import 'dotenv/config';
import { tool } from 'ai';
import { z } from 'zod';
import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';
import { whitelistedEmails } from '../whitelistEmails.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const NEWS_FILE = path.join(process.cwd(), 'news.md');
const FROM_EMAIL = 'NewsFetch Digest <ai@tsindia.org>';

function markdownToHtml(md) {
  md = md.replace(/# Developer News Digest[^\n]*/gi, '');
  md = md.replace(/## TL;DR\n[\s\S]+?(?=\n##|\n###|\n---)/g, '');

  md = md.replace(/^(#+ .+)$/gm, '\n\n$1\n\n');
  md = md.replace(/((?:^\|.+\n?)+)/gm, '\n\n$1\n\n');
  md = md.replace(/((?:^[*-] .+\n?)+)/gm, '\n\n$1\n\n');
  md = md.replace(/\n{3,}/g, '\n\n');

  const blocks = md.split(/\n\s*\n/);
  const htmlBlocks = [];

  let metaBadge = '';

  for (let block of blocks) {
    block = block.trim();
    if (!block) continue;

    if (block.startsWith('Last flow execution:')) {
      const timeStr = block.replace('Last flow execution:', '').trim();
      metaBadge = `
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="background-color:#efe9de; border:1px solid #e6dfd8; border-radius:20px; padding:6px 14px; display:inline-block; font-family:Inter,system-ui,sans-serif; font-size:12px; color:#6c6a64;">
            <span style="color:#cc785c; font-weight:600; margin-right:4px;">✦</span> Last updated: ${timeStr}
          </div>
        </div>
      `;
      continue;
    }

    if (block.startsWith('#')) {
      if (block.startsWith('#### ')) {
        const text = block.replace(/^####\s+/, '');
        htmlBlocks.push(`<h4 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;font-weight:600;color:#141413;margin:20px 0 8px;letter-spacing:-0.1px;">${text}</h4>`);
      } else if (block.startsWith('### ')) {
        const text = block.replace(/^###\s+/, '');
        if (text === '⚡ Breaking' || text.startsWith('⚡ Breaking')) {
          htmlBlocks.push(`
            <div style="margin-top: 40px; margin-bottom: 16px; border-bottom: 1px solid #e6dfd8; padding-bottom: 8px;">
              <span style="background-color: #cc785c; color: #ffffff; font-family: Inter, system-ui, sans-serif; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; vertical-align: middle;">⚡ Breaking</span>
            </div>`);
        } else if (text === '🔥 Trending' || text.startsWith('🔥 Trending')) {
          htmlBlocks.push(`
            <div style="margin-top: 40px; margin-bottom: 16px; border-bottom: 1px solid #e6dfd8; padding-bottom: 8px;">
              <span style="background-color: #cc785c; color: #ffffff; font-family: Inter, system-ui, sans-serif; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; vertical-align: middle;">🔥 Trending</span>
            </div>`);
        } else if (text === '📌 Notable' || text.startsWith('📌 Notable')) {
          htmlBlocks.push(`
            <div style="margin-top: 40px; margin-bottom: 16px; border-bottom: 1px solid #e6dfd8; padding-bottom: 8px;">
              <span style="background-color: #efe9de; color: #141413; font-family: Inter, system-ui, sans-serif; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; vertical-align: middle; border: 1px solid #e6dfd8;">📌 Notable</span>
            </div>`);
        } else {
          htmlBlocks.push(`<h3 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:19px;font-weight:500;color:#141413;margin:28px 0 12px;letter-spacing:-0.2px;">${text}</h3>`);
        }
      } else if (block.startsWith('## ')) {
        const text = block.replace(/^##\s+/, '');
        if (text === '📊 Pipeline Stats' || text.startsWith('📊 Pipeline Stats')) {
          htmlBlocks.push(`
            <div style="margin-top: 48px; margin-bottom: 16px; border-bottom: 1px solid #e6dfd8; padding-bottom: 8px;">
              <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:600;color:#141413;margin:0;letter-spacing:-0.3px;display:inline-block;vertical-align:middle;">📊 Pipeline Stats</h2>
            </div>`);
        } else {
          htmlBlocks.push(`<h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-weight:500;color:#141413;margin:36px 0 16px;border-bottom:1px solid #e6dfd8;padding-bottom:8px;letter-spacing:-0.3px;">${text}</h2>`);
        }
      } else if (block.startsWith('# ')) {
        const text = block.replace(/^#\s+/, '');
        htmlBlocks.push(`<h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;font-weight:500;color:#141413;margin:28px 0 20px;letter-spacing:-0.5px;line-height:1.2;text-align:center;">${text}</h1>`);
      }
    }
    else if (block === '---') {
      htmlBlocks.push('<hr style="border:none;border-top:1px solid #e6dfd8;margin:28px 0;">');
    }
    else if (block.startsWith('|')) {
      const lines = block.split('\n');
      let tableHtml = '<table style="width:100%;border-collapse:collapse;margin:24px 0;font-family:Inter,system-ui,sans-serif;font-size:14px;color:#3d3d3a;border:1px solid #e6dfd8;border-radius:8px;overflow:hidden;">';
      let rowCount = 0;
      for (const line of lines) {
        if (!line.trim().startsWith('|')) continue;
        const content = line.trim().slice(1, -1);
        const cells = content.split('|').map(c => c.trim());
        if (cells.every(c => /^[-:]+$/.test(c))) continue;
        
        const isHeader = rowCount === 0;
        const cellTag = isHeader ? 'th' : 'td';
        const cellStyle = isHeader
          ? 'padding:12px 14px;background-color:#efe9de;font-weight:600;text-align:left;border-bottom:1px solid #e6dfd8;color:#141413;'
          : 'padding:12px 14px;border-bottom:1px solid #e6dfd8;color:#3d3d3a;';
        const cellHtml = cells.map(c => `<${cellTag} style="${cellStyle}">${c}</${cellTag}>`).join('');
        tableHtml += `<tr style="${!isHeader ? 'background-color:#faf9f5;' : ''}">${cellHtml}</tr>`;
        rowCount++;
      }
      tableHtml += '</table>';
      htmlBlocks.push(tableHtml);
    }
    else if (block.startsWith('- ') || block.startsWith('* ')) {
      const lines = block.split('\n');
      let listHtml = '<ul style="margin:16px 0;padding-left:20px;color:#3d3d3a;">';
      for (const line of lines) {
        const cleanLine = line.replace(/^[*-]\s+/, '').trim();
        if (!cleanLine) continue;
        listHtml += `<li style="margin-bottom:12px;padding-left:4px;color:#3d3d3a;font-family:Inter,system-ui,sans-serif;font-size:14.5px;line-height:1.6;">${cleanLine}</li>`;
      }
      listHtml += '</ul>';
      htmlBlocks.push(listHtml);
    }
    else {
      htmlBlocks.push(`<p style="margin:0 0 16px;color:#3d3d3a;font-family:Inter,system-ui,sans-serif;font-size:14.5px;line-height:1.6;">${block}</p>`);
    }
  }

  let html = htmlBlocks.join('\n');

  html = html.replace(/<h2 style="[^"]*">📋 TL;DR<\/h2>\s*<p style="[^"]*">([\s\S]+?)<\/p>/g, (match, p1) => {
    return `
      <div style="background-color: #efe9de; border-left: 4px solid #cc785c; border-radius: 8px; padding: 20px 24px; margin: 24px 0 32px;">
        <h3 style="margin: 0 0 10px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 600; color: #141413; letter-spacing: -0.3px;">📋 Executive Summary (TL;DR)</h3>
        <p style="margin: 0; font-family: Inter, system-ui, sans-serif; font-size: 14.5px; line-height: 1.6; color: #3d3d3a;">${p1.trim()}</p>
      </div>
    `;
  });

  html = html.replace(/<h2 style="[^"]*">📈 Trends Detected<\/h2>\s*<ul style="[^"]*">([\s\S]+?)<\/ul>/g, (match, p1) => {
    return `
      <div style="background-color: #faf9f5; border: 1px solid #e6dfd8; border-radius: 8px; padding: 20px 24px; margin: 24px 0 32px;">
        <h3 style="margin: 0 0 12px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 600; color: #141413; letter-spacing: -0.3px;">📈 Key Industry Trends</h3>
        <ul style="margin: 0; padding-left: 20px; color: #3d3d3a;">${p1.trim()}</ul>
      </div>
    `;
  });

  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#141413;font-weight:600;">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#3d3d3a;">$1</em>');

  html = html.replace(/\[Impact:\s*([45])\]/g, '<span style="font-size:11px; font-family:Inter,system-ui,sans-serif; background-color:#cc785c; color:#ffffff; padding:2px 6px; border-radius:4px; font-weight:600; margin-left:6px; vertical-align:middle; display:inline-block; letter-spacing:0.5px;">Impact: $1/5</span>');
  html = html.replace(/\[Impact:\s*([123])\]/g, '<span style="font-size:11px; font-family:Inter,system-ui,sans-serif; background-color:#efe9de; color:#141413; border: 1px solid #e6dfd8; padding:2px 6px; border-radius:4px; font-weight:500; margin-left:6px; vertical-align:middle; display:inline-block; letter-spacing:0.5px;">Impact: $1/5</span>');

  html = html
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#cc785c;text-decoration:none;border-bottom:1px solid rgba(204,120,92,0.3);padding-bottom:1px;font-weight:500;">$1</a>');

  if (metaBadge) {
    html = metaBadge + html;
  }

  return html;
}

export function buildEmailHtml(markdownContent) {
  const bodyHtml = markdownToHtml(markdownContent);
  const now = new Date().toLocaleString('en-US', { timeZoneName: 'short' });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NewsFetch Digest</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @media only screen and (max-width: 600px) {
      .email-container {
        padding: 16px !important;
      }
      .email-card {
        padding: 24px 16px !important;
      }
      .email-header {
        padding: 24px 16px !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <div class="email-container" style="max-width:640px;margin:0 auto;padding:40px 20px;">
    <div style="background-color:#faf9f5;border:1px solid #e6dfd8;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(20,20,19,0.03);">
      
      <div class="email-header" style="background-color:#faf9f5;padding:32px 40px 24px;text-align:center;border-bottom:1px solid #e6dfd8;">
        <div style="color:#cc785c;font-size:24px;line-height:1;margin-bottom:8px;">✦</div>
        <h1 style="margin:0;color:#141413;font-family:'Cormorant Garamond',Georgia,serif;font-size:30px;font-weight:500;letter-spacing:-0.5px;line-height:1.2;">NewsFetch Digest</h1>
        <p style="margin:6px 0 0;color:#6c6a64;font-family:Inter,system-ui,sans-serif;font-size:12px;font-weight:500;letter-spacing:1px;text-transform:uppercase;">Developer-Focused AI News &bull; ${now}</p>
      </div>

      <div class="email-card" style="padding:40px;color:#3d3d3a;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        ${bodyHtml}
      </div>

      <div style="background-color:#181715;padding:32px 40px;text-align:center;color:#a09d96;font-family:Inter,system-ui,sans-serif;">
        <div style="color:#faf9f5;font-size:18px;margin-bottom:12px;line-height:1;">✦</div>
        <p style="margin:0;font-size:13px;font-weight:500;line-height:1.5;color:#faf9f5;">
          Powered by <strong>NewsFetch Agent</strong>
        </p>
        <p style="margin:6px 0 0;font-size:12px;line-height:1.5;color:#a09d96;">
          AI-curated, cross-verified developer ecosystem intelligence.
        </p>
        <p style="margin:16px 0 0;font-size:11px;color:#6c6a64;letter-spacing:0.5px;">
          Sent from ai@tsindia.org
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export const sendNewsEmail = tool({
  description: 'Send the latest news.md digest via email to all whitelisted recipients using Resend. Call this AFTER saving news.md.',
  inputSchema: z.object({
    subject: z.string().optional().describe('Custom email subject line. Defaults to a date-stamped subject.'),
  }),
  execute: async ({ subject }) => {
    try {
      const newsContent = await fs.readFile(NEWS_FILE, 'utf-8');

      if (!newsContent || newsContent.trim().length === 0) {
        return { success: false, error: 'news.md is empty. Run the news pipeline first.' };
      }

      if (whitelistedEmails.length === 0) {
        return { success: false, error: 'No whitelisted emails configured.' };
      }

      const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      });
      const emailSubject = subject || `🗞️ Dev News Digest — ${today}`;
      const htmlContent = buildEmailHtml(newsContent);

      console.log(`📧 Sending news digest to ${whitelistedEmails.length} recipient(s) in a single call...`);

      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: whitelistedEmails,
        subject: emailSubject,
        html: htmlContent,
      });

      if (error) {
        console.log(`  ❌ Email failed: ${error.message}`);
        return { success: false, error: error.message };
      }

      console.log(`  ✅ Email sent to all recipients (ID: ${data.id})`);

      return {
        success: true,
        message: `News digest emailed to ${whitelistedEmails.length} recipient(s).`,
        subject: emailSubject,
        recipients: whitelistedEmails,
        emailId: data.id,
      };
    } catch (error) {
      return { success: false, error: `Email sending failed: ${error.message}` };
    }
  },
});
