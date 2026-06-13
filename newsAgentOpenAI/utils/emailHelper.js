import 'dotenv/config';
import { Resend } from 'resend';
import { whitelistedEmails } from '../whitelistEmails.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'NewsFetch Digest <ai@tsindia.org>';

function markdownToHtml(md) {
  // Strip main headers
  md = md.replace(/# ✦ NewsFetch Digest[^\n]*/gi, '');
  md = md.replace(/### Developer-Focused AI News[^\n]*/gi, '');
  md = md.replace(/✦ Last updated:[^\n]*/gi, '');

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

    if (block.includes('Last updated:')) {
      const timeStr = block.replace('✦ Last updated:', '').trim();
      metaBadge = `
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="background-color:#141516; border:1px solid #23252a; border-radius:9999px; padding:6px 14px; display:inline-block; font-family:Inter,system-ui,sans-serif; font-size:12px; color:#d0d6e0;">
            <span style="color:#5e6ad2; font-weight:600; margin-right:4px;">✦</span> Last updated: ${timeStr}
          </div>
        </div>
      `;
      continue;
    }

    if (block.startsWith('#')) {
      if (block.startsWith('#### ')) {
        const text = block.replace(/^####\s+/, '');
        htmlBlocks.push(`<h4 style="font-family:Inter,system-ui,sans-serif;font-size:16px;font-weight:600;color:#f7f8f8;margin:20px 0 8px;letter-spacing:-0.1px;">${text}</h4>`);
      } else if (block.startsWith('### ')) {
        const text = block.replace(/^###\s+/, '');
        const cleanText = text.replace(/<\/?u>/g, '').trim();

        if (cleanText === '⚡ Breaking' || cleanText.startsWith('⚡ Breaking') || cleanText === '🔥 Breaking' || cleanText.startsWith('🔥 Breaking')) {
          htmlBlocks.push(`
            <div style="margin-top: 40px; margin-bottom: 16px; border-bottom: 1px solid #23252a; padding-bottom: 8px;">
              <span style="background-color: #5e6ad2; color: #ffffff; font-family: Inter, system-ui, sans-serif; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; vertical-align: middle;">🔥 Breaking</span>
            </div>`);
        } else if (cleanText === '🔥 Trending' || cleanText.startsWith('🔥 Trending') || cleanText === '📈 Trending' || cleanText.startsWith('📈 Trending')) {
          htmlBlocks.push(`
            <div style="margin-top: 40px; margin-bottom: 16px; border-bottom: 1px solid #23252a; padding-bottom: 8px;">
              <span style="background-color: #141516; color: #f7f8f8; font-family: Inter, system-ui, sans-serif; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; vertical-align: middle; border: 1px solid #34343a;">📈 Trending</span>
            </div>`);
        } else if (cleanText === '📌 Notable' || cleanText.startsWith('📌 Notable')) {
          htmlBlocks.push(`
            <div style="margin-top: 40px; margin-bottom: 16px; border-bottom: 1px solid #23252a; padding-bottom: 8px;">
              <span style="background-color: #0f1011; color: #8a8f98; font-family: Inter, system-ui, sans-serif; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; vertical-align: middle; border: 1px solid #23252a;">📌 Notable</span>
            </div>`);
        } else {
          htmlBlocks.push(`<h3 style="font-family:Inter,system-ui,sans-serif;font-size:18px;font-weight:500;color:#f7f8f8;margin:28px 0 12px;letter-spacing:-0.2px;">${text}</h3>`);
        }
      } else if (block.startsWith('## ')) {
        const text = block.replace(/^##\s+/, '');
        if (text === '📊 Pipeline Stats' || text.startsWith('📊 Pipeline Stats')) {
          htmlBlocks.push(`
            <div style="margin-top: 48px; margin-bottom: 16px; border-bottom: 1px solid #23252a; padding-bottom: 8px;">
              <h2 style="font-family:Inter,system-ui,sans-serif;font-size:22px;font-weight:600;color:#f7f8f8;margin:0;letter-spacing:-0.3px;display:inline-block;vertical-align:middle;">📊 Pipeline Stats</h2>
            </div>`);
        } else {
          htmlBlocks.push(`<h2 style="font-family:Inter,system-ui,sans-serif;font-size:22px;font-weight:500;color:#f7f8f8;margin:36px 0 16px;border-bottom:1px solid #23252a;padding-bottom:8px;letter-spacing:-0.3px;">${text}</h2>`);
        }
      } else if (block.startsWith('# ')) {
        const text = block.replace(/^#\s+/, '');
        htmlBlocks.push(`<h1 style="font-family:Inter,system-ui,sans-serif;font-size:26px;font-weight:500;color:#f7f8f8;margin:28px 0 20px;letter-spacing:-0.5px;line-height:1.2;text-align:center;">${text}</h1>`);
      }
    }
    else if (block === '---') {
      htmlBlocks.push('<hr style="border:none;border-top:1px solid #23252a;margin:28px 0;">');
    }
    else if (block.startsWith('|')) {
      const lines = block.split('\n');
      let tableHtml = '<table style="width:100%;border-collapse:collapse;margin:24px 0;font-family:Inter,system-ui,sans-serif;font-size:14px;color:#d0d6e0;border:1px solid #23252a;border-radius:8px;overflow:hidden;">';
      let rowCount = 0;
      for (const line of lines) {
        if (!line.trim().startsWith('|')) continue;
        const content = line.trim().slice(1, -1);
        const cells = content.split('|').map(c => c.trim());
        if (cells.every(c => /^[-:]+$/.test(c))) continue;
        
        const isHeader = rowCount === 0;
        const cellTag = isHeader ? 'th' : 'td';
        const cellStyle = isHeader
          ? 'padding:12px 14px;background-color:#0f1011;font-weight:600;text-align:left;border-bottom:1px solid #23252a;color:#f7f8f8;'
          : 'padding:12px 14px;border-bottom:1px solid #23252a;color:#d0d6e0;';
        const cellHtml = cells.map(c => `<${cellTag} style="${cellStyle}">${c}</${cellTag}>`).join('');
        tableHtml += `<tr style="${!isHeader ? 'background-color:#010102;' : ''}">${cellHtml}</tr>`;
        rowCount++;
      }
      tableHtml += '</table>';
      htmlBlocks.push(tableHtml);
    }
    else if (block.startsWith('- ') || block.startsWith('* ')) {
      const lines = block.split('\n');
      let listHtml = '<ul style="margin:16px 0;padding-left:20px;color:#d0d6e0;">';
      let currentLi = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          if (currentLi) {
            listHtml += `<li style="margin-bottom:12px;padding-left:4px;color:#d0d6e0;font-family:Inter,system-ui,sans-serif;font-size:14.5px;line-height:1.6;">${currentLi}</li>`;
          }
          currentLi = trimmed.replace(/^[*-]\s+/, '');
        } else {
          if (currentLi) {
            if (trimmed.startsWith('Summary:')) {
              currentLi += `<br><span style="display:block; margin-top:4px; font-size:13.5px; color:#8a8f98; line-height:1.5;">${trimmed}</span>`;
            } else {
              currentLi += ' ' + trimmed;
            }
          } else {
            currentLi = trimmed;
          }
        }
      }
      if (currentLi) {
        listHtml += `<li style="margin-bottom:12px;padding-left:4px;color:#d0d6e0;font-family:Inter,system-ui,sans-serif;font-size:14.5px;line-height:1.6;">${currentLi}</li>`;
      }
      listHtml += '</ul>';
      htmlBlocks.push(listHtml);
    }
    else {
      htmlBlocks.push(`<p style="margin:0 0 16px;color:#d0d6e0;font-family:Inter,system-ui,sans-serif;font-size:14.5px;line-height:1.6;">${block}</p>`);
    }
  }

  let html = htmlBlocks.join('\n');

  // Format Executive Summary (TL;DR)
  html = html.replace(/<h2 style="[^"]*">📋 Executive Summary \(TL;DR\)<\/h2>\s*<p style="[^"]*">([\s\S]+?)<\/p>/gi, (match, p1) => {
    return `
      <div style="background-color: #0f1011; border: 1px solid #23252a; border-left: 4px solid #5e6ad2; border-radius: 8px; padding: 20px 24px; margin: 24px 0 32px;">
        <h3 style="margin: 0 0 10px; font-family: Inter, system-ui, sans-serif; font-size: 18px; font-weight: 600; color: #f7f8f8; letter-spacing: -0.3px;">📋 Executive Summary (TL;DR)</h3>
        <p style="margin: 0; font-family: Inter, system-ui, sans-serif; font-size: 14.5px; line-height: 1.6; color: #d0d6e0;">${p1.trim()}</p>
      </div>
    `;
  });

  // Format Key Industry Trends
  html = html.replace(/<h2 style="[^"]*">📈 Key Industry Trends<\/h2>\s*<ul style="[^"]*">([\s\S]+?)<\/ul>/gi, (match, p1) => {
    return `
      <div style="background-color: #0f1011; border: 1px solid #23252a; border-radius: 8px; padding: 20px 24px; margin: 24px 0 32px;">
        <h3 style="margin: 0 0 12px; font-family: Inter, system-ui, sans-serif; font-size: 18px; font-weight: 600; color: #f7f8f8; letter-spacing: -0.3px;">📈 Key Industry Trends</h3>
        <ul style="margin: 0; padding-left: 20px; color: #d0d6e0;">${p1.trim()}</ul>
      </div>
    `;
  });

  // Strong & Emphasis formatting
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f7f8f8;font-weight:600;">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#8a8f98;">$1</em>');

  // Impact formatting: (Impact: 7.1) or (Impact: 7)
  html = html.replace(/\(Impact:\s*([0-9.]+)\)/g, (match, p1) => {
    const score = parseFloat(p1);
    const bgColor = score >= 7.0 ? '#5e6ad2' : '#141516';
    const textColor = '#ffffff';
    const border = score >= 7.0 ? 'none' : '1px solid #23252a';
    return `<span style="font-size:11px; font-family:Inter,system-ui,sans-serif; background-color:${bgColor}; color:${textColor}; border:${border}; padding:2px 6px; border-radius:4px; font-weight:600; margin-left:6px; vertical-align:middle; display:inline-block; letter-spacing:0.5px;">Impact: ${p1}/10</span>`;
  });

  // Links formatting
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#828fff;text-decoration:none;border-bottom:1px solid rgba(130,143,255,0.3);padding-bottom:1px;font-weight:500;">$1</a>');

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
  <title>NewsAgent Digest</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
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
<body style="margin:0;padding:0;background-color:#010102;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <div class="email-container" style="max-width:640px;margin:0 auto;padding:40px 20px;">
    <div style="background-color:#0f1011;border:1px solid #23252a;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);">
      
      <div class="email-header" style="background-color:#0f1011;padding:32px 40px 24px;text-align:center;border-bottom:1px solid #23252a;">
        <div style="color:#5e6ad2;font-size:24px;line-height:1;margin-bottom:8px;">✦</div>
        <h1 style="margin:0;color:#f7f8f8;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:26px;font-weight:600;letter-spacing:-0.8px;line-height:1.2;">NewsAgent Digest</h1>
        <p style="margin:6px 0 0;color:#8a8f98;font-family:Inter,system-ui,sans-serif;font-size:12px;font-weight:500;letter-spacing:1px;text-transform:uppercase;">Developer-Focused AI News &bull; ${now}</p>
      </div>

      <div class="email-card" style="padding:40px;color:#d0d6e0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        ${bodyHtml}
      </div>

      <div style="background-color:#010102;padding:32px 40px;text-align:center;color:#8a8f98;font-family:Inter,system-ui,sans-serif;border-top:1px solid #23252a;">
        <div style="color:#f7f8f8;font-size:18px;margin-bottom:12px;line-height:1;">✦</div>
        <p style="margin:0;font-size:13px;font-weight:500;line-height:1.5;color:#f7f8f8;">
          Powered by <strong style="color:#5e6ad2;">NewsAgent OpenAI</strong>
        </p>
        <p style="margin:6px 0 0;font-size:12px;line-height:1.5;color:#8a8f98;">
          AI-curated, cross-verified developer ecosystem intelligence.
        </p>
        <p style="margin:16px 0 0;font-size:11px;color:#62666d;letter-spacing:0.5px;">
          Sent from ai@tsindia.org
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function sendEmail(content, subject) {
  try {
    if (!content || content.trim().length === 0) {
      console.log('⚠️ [Email Sender] Content is empty. Skipping email.');
      return { success: false, error: 'Content is empty.' };
    }

    if (!whitelistedEmails || whitelistedEmails.length === 0) {
      console.log('⚠️ [Email Sender] No whitelisted emails found. Skipping email.');
      return { success: false, error: 'No whitelisted emails configured.' };
    }

    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ [Email Sender] RESEND_API_KEY is not set. Skipping email.');
      return { success: false, error: 'RESEND_API_KEY is not set.' };
    }

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const emailSubject = subject || `🗞️ Dev News Digest — ${today}`;
    const htmlContent = buildEmailHtml(content);

    console.log(`📧 Sending news digest to ${whitelistedEmails.length} recipient(s) via Resend...`);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: whitelistedEmails,
      subject: emailSubject,
      html: htmlContent,
    });

    if (error) {
      console.error(`  ❌ Email failed: ${error.message}`);
      return { success: false, error: error.message };
    }

    console.log(`  ✅ Email sent successfully (ID: ${data.id})`);
    return { success: true, emailId: data.id };
  } catch (error) {
    console.error(`  ❌ Email sending encountered an error:`, error);
    return { success: false, error: error.message };
  }
}
