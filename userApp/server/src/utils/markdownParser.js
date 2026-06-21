export function parseMarkdown(md) {
  const lines = md.split('\n').map(line => line.trim());
  const data = {
    title: '',
    subtitle: '',
    lastUpdated: '',
    executiveSummary: '',
    trends: [],
    categories: [],
    stats: {}
  };

  let currentCategory = null;
  let currentArticle = null;
  let inSources = false;
  let execSummaryLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line) continue;

    if (line.startsWith('# ')) {
      data.title = line.replace(/^#\s*✦?\s*/, '').trim();
      continue;
    }

    if (line.startsWith('### ') && !line.includes('<u>')) {
      data.subtitle = line.replace(/^###\s*/, '').trim();
      continue;
    }

    if (line.includes('Last updated:')) {
      const match = line.match(/Last updated:\s*(.+)$/i);
      if (match) {
        data.lastUpdated = match[1].trim();
      }
      continue;
    }

    if (line.startsWith('## 📋 Executive Summary') || line.startsWith('## Executive Summary')) {
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('##')) {
        if (lines[j].trim()) {
          execSummaryLines.push(lines[j].trim());
        }
        j++;
      }
      data.executiveSummary = execSummaryLines.join(' ');
      i = j - 1;
      continue;
    }

    if (line.startsWith('## 📈 Key Industry Trends') || line.startsWith('## Key Industry Trends')) {
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('##')) {
        const trendLine = lines[j].trim();
        if (trendLine.startsWith('*')) {
          const match = trendLine.match(/^\*\s+\*\*([^*]+):\*\*\s*(.+)$/);
          if (match) {
            data.trends.push({
              trend: match[1].trim(),
              description: match[2].trim()
            });
          } else {
            data.trends.push({
              trend: '',
              description: trendLine.replace(/^\*\s*/, '').trim()
            });
          }
        }
        j++;
      }
      i = j - 1;
      continue;
    }

    if (line.startsWith('## 📊 Pipeline Stats') || line.startsWith('## Pipeline Stats')) {
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('##') && !lines[j].startsWith('---')) {
        const statsLine = lines[j].trim();
        if (statsLine.startsWith('|')) {
          const parts = statsLine.split('|').map(p => p.trim()).filter(Boolean);
          if (parts.length === 2 && !parts[0].includes('---') && parts[0] !== 'Metric') {
            const keyRaw = parts[0].replace(/[^\w\s-]/g, '').trim();
            const key = keyRaw
              .replace(/[-_\s]+(.)?/g, (match, ch) => ch ? ch.toUpperCase() : '')
              .replace(/^\w/, c => c.toLowerCase());
            
            data.stats[key] = parts[1].trim();
          }
        }
        j++;
      }
      i = j - 1;
      continue;
    }

    if (line.startsWith('## ')) {
      const match = line.match(/^##\s+(\S+)\s+(.+)$/);
      if (match) {
        const emoji = match[1];
        const name = match[2].trim();
        currentCategory = {
          name,
          emoji,
          articles: []
        };
        data.categories.push(currentCategory);
        currentArticle = null;
        inSources = false;
      }
      continue;
    }

    if (line.startsWith('### <u>')) {
      const match = line.match(/###\s*<u>\s*(\S+)\s+(.+?)<\/u>/);
      if (match && currentCategory) {
        const emoji = match[1].trim();
        const type = match[2].trim();
        currentArticle = {
          type,
          emoji,
          confidence: '',
          title: '',
          impact: null,
          sourceName: '',
          sourceUrl: '',
          summary: '',
          score: null,
          scoringBreakdown: {},
          sources: []
        };
        currentCategory.articles.push(currentArticle);
        inSources = false;
      }
      continue;
    }

    if (currentArticle) {
    
      if (line.startsWith('**[Confidence:')) {
        const match = line.match(/^\*\*\[Confidence:\s*([^\]]+)\]\s*(.*?)\s*\(Impact:\s*([0-9.]+)\)\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\*\*/);
        if (match) {
          currentArticle.confidence = match[1].trim();
          currentArticle.title = match[2].trim();
          currentArticle.impact = parseFloat(match[3]);
          currentArticle.sourceName = match[4].trim();
          currentArticle.sourceUrl = match[5].trim();
        } else {
          const confMatch = line.match(/\[Confidence:\s*([^\]]+)\]/);
          if (confMatch) currentArticle.confidence = confMatch[1].trim();
          
          const impactMatch = line.match(/\(Impact:\s*([0-9.]+)\)/);
          if (impactMatch) currentArticle.impact = parseFloat(impactMatch[1]);
          
          const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)\s*\*\*/);
          if (linkMatch) {
            currentArticle.sourceName = linkMatch[1].trim();
            currentArticle.sourceUrl = linkMatch[2].trim();
          }
          
          let cleanTitle = line.replace(/^\*\*\[Confidence:[^\]]+\]/, '')
                              .replace(/\(Impact:[^)]+\)/, '')
                              .replace(/\|[^|]+\*\*/, '')
                              .replace(/\*\*/g, '')
                              .trim();
          currentArticle.title = cleanTitle;
        }
        continue;
      }

      if (line.startsWith('**Summary:**')) {
        currentArticle.summary = line.replace(/^\*\*Summary:\*\*\s*/, '').trim();
        continue;
      }

      if (line.startsWith('**Scoring Breakdown:**')) {
        const scoreMatch = line.match(/`Score:\s*([0-9.]+)\/10`/);
        if (scoreMatch) {
          currentArticle.score = parseFloat(scoreMatch[1]);
        }
        
        const detailsMatch = line.match(/\(([^)]+)\)/);
        if (detailsMatch) {
          const pairs = detailsMatch[1].split(',');
          pairs.forEach(pair => {
            const [k, v] = pair.split(':').map(x => x.trim());
            if (k && v) {
              currentArticle.scoringBreakdown[k.toLowerCase()] = parseFloat(v);
            }
          });
        }
        continue;
      }

      if (line.startsWith('**Sources:**')) {
        inSources = true;
        continue;
      }

      if (inSources && line.startsWith('*')) {
        const sourceMatch = line.match(/^\*\s+\[([^\]]+)\]\(([^)]+)\)/);
        if (sourceMatch) {
          currentArticle.sources.push({
            name: sourceMatch[1].trim(),
            url: sourceMatch[2].trim()
          });
        }
        continue;
      }
    }
  }

  return data;
}
