export interface DigestTrend {
  trend: string;
  description: string;
}

export interface DigestSource {
  name: string;
  url: string;
}

export interface DigestArticle {
  type: string;
  emoji: string;
  confidence: string;
  title: string;
  impact: number | null;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  score: number | null;
  scoringBreakdown: Record<string, number>;
  sources: DigestSource[];
}

export interface DigestCategory {
  name: string;
  emoji: string;
  articles: DigestArticle[];
}

export interface DigestStats {
  totalItemsVerified?: string;
  highConfidence?: string;
  mediumConfidence?: string;
  lowConfidence?: string;
  crossReferenced?: string;
  freshnessWindow?: string;
  generatedAt?: string;
  [key: string]: string | undefined;
}

export interface DigestData {
  title: string;
  subtitle: string;
  lastUpdated: string;
  executiveSummary: string;
  trends: DigestTrend[];
  categories: DigestCategory[];
  stats: DigestStats;
}

export function parseMarkdown(md: string): DigestData {
  const lines = md.split('\n').map(line => line.trim());
  const data: DigestData = {
    title: '',
    subtitle: '',
    lastUpdated: '',
    executiveSummary: '',
    trends: [],
    categories: [],
    stats: {}
  };

  let currentCategory: DigestCategory | null = null;
  let currentArticle: DigestArticle | null = null;
  let inSources = false;
  let execSummaryLines: string[] = [];

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
      if (match && match[1]) {
        data.lastUpdated = match[1].trim();
      }
      continue;
    }

    if (line.startsWith('## 📋 Executive Summary') || line.startsWith('## Executive Summary')) {
      let j = i + 1;
      while (j < lines.length) {
        const lineJ = lines[j];
        if (!lineJ || lineJ.startsWith('##')) break;
        execSummaryLines.push(lineJ.trim());
        j++;
      }
      data.executiveSummary = execSummaryLines.join(' ');
      i = j - 1;
      continue;
    }

    if (line.startsWith('## 📈 Key Industry Trends') || line.startsWith('## Key Industry Trends')) {
      let j = i + 1;
      while (j < lines.length) {
        const trendLine = lines[j];
        if (!trendLine || trendLine.startsWith('##')) break;
        const trimmed = trendLine.trim();
        if (trimmed.startsWith('*')) {
          const match = trimmed.match(/^\*\s+\*\*([^*]+):\*\*\s*(.+)$/);
          if (match && match[1] && match[2]) {
            data.trends.push({
              trend: match[1].trim(),
              description: match[2].trim()
            });
          } else {
            data.trends.push({
              trend: '',
              description: trimmed.replace(/^\*\s*/, '').trim()
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
      while (j < lines.length) {
        const statsLine = lines[j];
        if (!statsLine || statsLine.startsWith('##') || statsLine.startsWith('---')) break;
        const trimmed = statsLine.trim();
        if (trimmed.startsWith('|')) {
          const parts = trimmed.split('|').map(p => p.trim()).filter(Boolean);
          const p0 = parts[0];
          const p1 = parts[1];
          if (parts.length === 2 && p0 && p1 && !p0.includes('---') && p0 !== 'Metric') {
            const keyRaw = p0.replace(/[^\w\s-]/g, '').trim();
            const key = keyRaw
              .replace(/[-_\s]+(.)?/g, (match, ch) => ch ? ch.toUpperCase() : '')
              .replace(/^\w/, c => c.toLowerCase());
            
            data.stats[key] = p1.trim();
          }
        }
        j++;
      }
      i = j - 1;
      continue;
    }

    if (line.startsWith('## ')) {
      const match = line.match(/^##\s+(\S+)\s+(.+)$/);
      if (match && match[1] && match[2]) {
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
      if (match && match[1] && match[2] && currentCategory) {
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
        if (match && match[1] && match[2] && match[3] && match[4] && match[5]) {
          currentArticle.confidence = match[1].trim();
          currentArticle.title = match[2].trim();
          currentArticle.impact = parseFloat(match[3]);
          currentArticle.sourceName = match[4].trim();
          currentArticle.sourceUrl = match[5].trim();
        } else {
          const confMatch = line.match(/\[Confidence:\s*([^\]]+)\]/);
          if (confMatch && confMatch[1]) currentArticle.confidence = confMatch[1].trim();
          
          const impactMatch = line.match(/\(Impact:\s*([0-9.]+)\)/);
          if (impactMatch && impactMatch[1]) currentArticle.impact = parseFloat(impactMatch[1]);
          
          const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)\s*\*\*/);
          if (linkMatch && linkMatch[1] && linkMatch[2]) {
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
        if (scoreMatch && scoreMatch[1]) {
          currentArticle.score = parseFloat(scoreMatch[1]);
        }
        
        const detailsMatch = line.match(/\(([^)]+)\)/);
        if (detailsMatch && detailsMatch[1]) {
          const pairs = detailsMatch[1].split(',');
          pairs.forEach(pair => {
            const [k, v] = pair.split(':').map(x => x.trim());
            if (k && v && currentArticle) {
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
        if (sourceMatch && sourceMatch[1] && sourceMatch[2]) {
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
