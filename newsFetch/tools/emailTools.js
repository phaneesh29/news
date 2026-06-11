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
  return md
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#3b82f6;text-decoration:underline;">$1</a>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">')

    .replace(/^\|(.+)\|$/gm, (match, content) => {
      const cells = content.split('|').map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) return '';
      const cellHtml = cells.map(c => `<td style="padding:8px 12px;border:1px solid #e5e7eb;">${c}</td>`).join('');
      return `<tr>${cellHtml}</tr>`;
    })
    .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}


function buildEmailHtml(markdownContent) {
  const bodyHtml = markdownToHtml(markdownContent);
  const now = new Date().toLocaleString('en-US', { timeZoneName: 'short' });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:24px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e293b,#334155);border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🗞️ NewsFetch Digest</h1>
      <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">Developer-Focused AI News • ${now}</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:28px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;font-size:15px;line-height:1.7;color:#1e293b;">
      <p>${bodyHtml}</p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f5f9;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;border:1px solid #e5e7eb;border-top:none;">
      <p style="margin:0;color:#64748b;font-size:13px;">
        Powered by <strong>NewsFetch Agent</strong> • AI-curated, cross-verified developer news
      </p>
      <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;">
        Sent from ai@tsindia.org
      </p>
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
