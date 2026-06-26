export function parseMarkdown(md) {
  const lines = md.split('\n');
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
  let section = null;  
  let summaryLines = [];

  const flushArticleSummary = () => {
    if (currentArticle && summaryLines.length > 0) {
      currentArticle.summary = summaryLines.join(' ').trim();
      if (!currentArticle.sourceName && currentArticle.sources.length > 0) {
        currentArticle.sourceName = currentArticle.sources[0].name;
        currentArticle.sourceUrl = currentArticle.sources[0].url;
      }
      summaryLines = [];
    }
  };

  const SPECIAL_SECTIONS = ['TL;DR', 'Signals To Watch', 'Pipeline Stats',
    'Executive Summary', 'Key Industry Trends'];

  const isSpecialSection = (heading) => {
    const cleaned = heading.replace(/^##\s+/, '').replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]\s*/u, '').trim();
    return SPECIAL_SECTIONS.some(s => cleaned.startsWith(s));
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('Freshness window:')) continue;

    if (line === '---') continue;

    if (line.startsWith('# ') && !line.startsWith('## ')) {
      data.title = line.replace(/^#\s*✦?\s*/, '').trim();
      continue;
    }

    if (line.startsWith('### ') && !currentCategory && !section && !line.includes('<u>')) {
      data.subtitle = line.replace(/^###\s*/, '').trim();
      continue;
    }

    if (line.startsWith('Last updated:') || line.includes('Last updated:')) {
      const match = line.match(/Last updated:\s*(.+)$/i);
      if (match) {
        data.lastUpdated = match[1].trim();
      }
      continue;
    }

    if (line.startsWith('## ')) {

      flushArticleSummary();
      currentArticle = null;
      inSources = false;

      const headingText = line.replace(/^##\s+/, '').trim();
      const cleanHeading = headingText.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]\s*/u, '').trim();

      if (cleanHeading.startsWith('TL;DR') || cleanHeading.startsWith('Executive Summary')) {
        section = 'tldr';
        continue;
      }

      if (cleanHeading.startsWith('Signals To Watch') || cleanHeading.startsWith('Key Industry Trends')) {
        section = 'signals';
        continue;
      }

      if (cleanHeading.startsWith('Pipeline Stats')) {
        section = 'stats';
        continue;
      }

      section = 'category';
      currentCategory = {
        name: cleanHeading,
        emoji: '',
        articles: []
      };
      data.categories.push(currentCategory);
      continue;
    }

    if (line.startsWith('### ') && section === 'category' && currentCategory) {
      flushArticleSummary();

      const articleTitle = line.replace(/^###\s*/, '').trim();

      if (line.includes('<u>')) {
        const match = line.match(/###\s*<u>\s*(\S+)\s+(.+?)<\/u>/);
        if (match) {
          currentArticle = {
            type: match[2].trim(),
            emoji: match[1].trim(),
            confidence: '',
            title: '',
            impact: null,
            sourceName: '',
            sourceUrl: '',
            summary: '',
            tags: [],
            score: null,
            scoringBreakdown: {},
            sources: []
          };
          currentCategory.articles.push(currentArticle);
          inSources = false;
          summaryLines = [];
        }
        continue;
      }

    
      currentArticle = {
        type: '',
        emoji: '',
        confidence: '',
        title: articleTitle,
        impact: null,
        sourceName: '',
        sourceUrl: '',
        summary: '',
        tags: [],
        score: null,
        scoringBreakdown: {},
        sources: []
      };
      currentCategory.articles.push(currentArticle);
      inSources = false;
      summaryLines = [];
      continue;
    }

    
    if (section === 'tldr') {
      if (line.startsWith('- ')) {
        const bulletText = line.replace(/^-\s*/, '').trim();
        if (!data.executiveSummary) {
          data.executiveSummary = '- ' + bulletText;
        } else {
          data.executiveSummary += '\n- ' + bulletText;
        }
      }
      continue;
    }

    if (section === 'signals') {
      if (line.startsWith('- ')) {
        const bulletText = line.replace(/^-\s*/, '').trim();
        const match = bulletText.match(/^\*\*([^*]+?):\*\*\s*(.+)$/);
        if (match) {
          data.trends.push({
            trend: match[1].trim(),
            description: match[2].trim()
          });
        } else {
        
          data.trends.push({
            trend: '',
            description: bulletText.replace(/\*\*/g, '').trim()
          });
        }
      }
      if (line.startsWith('* ')) {
        const bulletText = line.replace(/^\*\s*/, '').trim();
        const match = bulletText.match(/^\*\*([^*]+?):\*\*\s*(.+)$/);
        if (match) {
          data.trends.push({
            trend: match[1].trim(),
            description: match[2].trim()
          });
        } else {
          data.trends.push({
            trend: '',
            description: bulletText.replace(/\*\*/g, '').trim()
          });
        }
      }
      continue;
    }

    if (section === 'stats') {
      if (line.startsWith('|')) {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (parts.length === 2 && !parts[0].includes('---') && parts[0] !== 'Metric') {
          const keyRaw = parts[0].replace(/[^\w\s-]/g, '').trim();
          const key = keyRaw
            .replace(/[-_\s]+(.)?/g, (match, ch) => ch ? ch.toUpperCase() : '')
            .replace(/^\w/, c => c.toLowerCase());
          data.stats[key] = parts[1].trim();
        }
      }
      continue;
    }

  
    if (section === 'category' && currentArticle) {

      if (line.startsWith('Tags:')) {
        const tagMatches = line.matchAll(/`([^`]+)`/g);
        currentArticle.tags = [...tagMatches].map(m => m[1].trim());
        inSources = false;
        continue;
      }


      if (line.startsWith('Confidence:')) {
        currentArticle.confidence = line.replace(/^Confidence:\s*/, '').trim();
        inSources = false;
        continue;
      }

    
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

     
      if (line === 'Sources:' || line === '**Sources:**') {

        if (summaryLines.length > 0) {
          currentArticle.summary = summaryLines.join(' ').trim();
          summaryLines = [];
        }
        inSources = true;
        continue;
      }

  
      if (inSources && (line.startsWith('- ') || line.startsWith('* '))) {
        const sourceMatch = line.match(/^[-*]\s+\[([^\]]+)\]\(([^)]+)\)/);
        if (sourceMatch) {
          currentArticle.sources.push({
            name: sourceMatch[1].trim(),
            url: sourceMatch[2].trim()
          });
     
          if (currentArticle.sources.length === 1) {
            currentArticle.sourceName = sourceMatch[1].trim();
            currentArticle.sourceUrl = sourceMatch[2].trim();
          }
        }
        continue;
      }


      if (inSources && line && !line.startsWith('- ') && !line.startsWith('* ')) {
        inSources = false;
      }

      
      if (!inSources && line) {
        summaryLines.push(line);
      }
    }
  }

  flushArticleSummary();

  return data;
}
