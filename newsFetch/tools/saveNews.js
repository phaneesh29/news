import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

const NEWS_FILE = path.join(process.cwd(), 'news.md');

export const saveNews = tool({
  description: 'Save the final verified AI developer news to news.md with rich formatting, stats, and metadata.',
  inputSchema: z.object({
    content: z.string().describe('The full, markdown-formatted verified news summary.'),
    tldr: z.string().optional().describe('The TL;DR executive summary.'),
    trends: z.array(z.string()).optional().describe('Detected trends across categories.'),
    stats: z.object({
      totalItemsVerified: z.number().optional(),
      highConfidenceCount: z.number().optional(),
      mediumConfidenceCount: z.number().optional(),
      lowConfidenceCount: z.number().optional(),
      crossReferencedCount: z.number().optional(),
    }).optional().describe('Verification statistics.'),
  }),
  execute: async ({ content, tldr, trends, stats }) => {
    try {
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', { timeZoneName: 'short' });
      const cleanContent = content.replace(/^Last flow execution:.*$/gim, '').trim();

      let output = `Last flow execution: ${timestamp}\n\n`;

      if (tldr) {
        output += `## 📋 TL;DR\n${tldr}\n\n---\n\n`;
      }

      if (trends && trends.length > 0) {
        output += `## 📈 Trends Detected\n`;
        trends.forEach(t => { output += `- ${t}\n`; });
        output += `\n---\n\n`;
      }

      output += cleanContent;

      if (stats) {
        output += `\n\n---\n\n## 📊 Pipeline Stats\n`;
        output += `| Metric | Value |\n|--------|-------|\n`;
        if (stats.totalItemsVerified != null) output += `| Total Items Verified | ${stats.totalItemsVerified} |\n`;
        if (stats.highConfidenceCount != null) output += `| ✅ High Confidence | ${stats.highConfidenceCount} |\n`;
        if (stats.mediumConfidenceCount != null) output += `| ⚠️ Medium Confidence | ${stats.mediumConfidenceCount} |\n`;
        if (stats.lowConfidenceCount != null) output += `| ❌ Low Confidence | ${stats.lowConfidenceCount} |\n`;
        if (stats.crossReferencedCount != null) output += `| 🔍 Cross-Referenced | ${stats.crossReferencedCount} |\n`;
        output += `| ⏰ Freshness Window | Last 12 hours |\n`;
        output += `| 🕐 Generated At | ${timestamp} |\n`;
      }

      await fs.writeFile(NEWS_FILE, output, 'utf-8');

      console.log(`💾 News saved to news.md (${output.length} chars)`);

      return {
        success: true,
        message: `News successfully saved to news.md with ${stats?.totalItemsVerified || 'N/A'} verified items.`,
        lastFlowExecution: timestamp,
      };
    } catch (error) {
      return { error: `Failed to save news to news.md: ${error.message}` };
    }
  },
});
