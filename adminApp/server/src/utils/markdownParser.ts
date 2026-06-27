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
  tags: string[];
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
  const lines = md.split('\n');
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
  let section: string | null = null;
  let summaryLines: string[] = [];

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
      if (match && match[1]) {
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
      
      let emoji = '';
      if (headingText !== cleanHeading) {
        emoji = headingText.slice(0, -cleanHeading.length).trim();
      }

  
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
        emoji: emoji,
        articles: []
      };
      data.categories.push(currentCategory);
      continue;
    }

    if (line.startsWith('### ') && section === 'category' && currentCategory) {
      flushArticleSummary();

      const articleTitleText = line.replace(/^###\s*/, '').trim();
      const cleanArticleTitle = articleTitleText.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]\s*/u, '').trim();
      
      let articleEmoji = '';
      if (articleTitleText !== cleanArticleTitle) {
        articleEmoji = articleTitleText.slice(0, -cleanArticleTitle.length).trim();
      }

      if (line.includes('<u>')) {
        const match = line.match(/###\s*<u>\s*(\S+)\s+(.+?)<\/u>/);
        if (match && match[1] && match[2]) {
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
        emoji: articleEmoji,
        confidence: '',
        title: cleanArticleTitle,
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
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.replace(/^[-*]\s*/, '').trim();
        const match = bulletText.match(/^\*\*([^*]+?):\*\*\s*(.+)$/);
        if (match && match[1] && match[2]) {
          data.trends.push({
            trend: match[1].trim(),
            description: match[2].trim()
          });
        } else {
          data.trends.push({
            trend: '',
            description: bulletText.trim()
          });
        }
      }
      continue;
    }

    if (section === 'stats') {
      if (line.startsWith('|')) {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        const p0 = parts[0];
        const p1 = parts[1];
        if (parts.length === 2 && p0 && p1 && !p0.includes('---') && p0 !== 'Metric') {
          const keyRaw = p0.replace(/[^\w\s-]/g, '').trim();
          const key = keyRaw
            .replace(/[-_\s]+(.)?/g, (_match: string, ch: string) => ch ? ch.toUpperCase() : '')
            .replace(/^\w/, c => c.toLowerCase());
          data.stats[key] = p1.trim();
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
        if (sourceMatch && sourceMatch[1] && sourceMatch[2]) {
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
