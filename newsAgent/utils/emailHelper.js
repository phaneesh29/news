import 'dotenv/config';
import { Resend } from 'resend';
import { marked } from 'marked';
import { whitelistedEmails } from '../whitelistEmails.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'NewsFetch Dispatch <ai@tsindia.org>';

function markdownToHtml(md) {
  md = md.replace(/# ✦ NewsFetch Digest[^\n]*/gi, '');
  md = md.replace(/### Developer-Focused AI News[^\n]*/gi, '');
  md = md.replace(/✦ Last updated:[^\n]*/gi, '');

  md = md.replace(/[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}]/gu, '');

  // Safely remove emojis without destroying math symbols like < and >
  md = md.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');

  let html = marked.parse(md);

  const ink = '#000000';
  const bg = '#ffffff';
  const accent = '#0055ff'; // sharp dev-blue
  const fontBody = "'JetBrains Mono', monospace";
  const fontHeadline = "'Space Grotesk', sans-serif";
  const fontSans = "'JetBrains Mono', monospace";

  html = html.replace(/<h2>([\s\S]+?)<\/h2>/gi, (match, p1) => {
    const text = p1.trim();
    return `<div style="font-family:${fontHeadline};font-size:42px;font-weight:900;letter-spacing:-1px;line-height:1.1;text-transform:uppercase;text-align:left;margin:40px 0 20px 0;border-bottom:4px solid ${ink};padding-bottom:10px;color:${ink};">${text}</div>`;
  });

  html = html.replace(/<h3>([\s\S]+?)<\/h3>/gi, (match, p1) => {
    const text = p1.trim();
    const cleanText = text.replace(/<\/?u>/g, '').trim();

    if (cleanText.includes('Breaking')) {
      return `
        <div style="margin-top: 30px; margin-bottom: 15px; border: 2px solid ${ink}; background-color: ${ink}; padding: 12px;">
          <span style="font-family:${fontSans}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${bg}; display: block; margin-bottom: 5px;">[ SYS.CRITICAL.ALERT ]</span>
          <span style="font-family:${fontHeadline}; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: ${bg};">${text}</span>
        </div>`;
    } else if (cleanText.includes('Trending') || cleanText.includes('Notable')) {
      return `
        <div style="margin-top: 30px; margin-bottom: 15px; border-left: 8px solid ${accent}; background-color: #f4f4f4; padding: 12px;">
          <span style="font-family:${fontSans}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${accent}; display: block; margin-bottom: 5px;">[ DATA.TRENDING ]</span>
          <span style="font-family:${fontHeadline}; font-size: 26px; font-weight: 700; letter-spacing: -0.5px; text-transform: uppercase; color: ${ink};">${text}</span>
        </div>`;
    }
    return `<div style="font-family:${fontHeadline};font-size:24px;font-weight:700;letter-spacing:-0.5px;text-transform:uppercase;margin:25px 0 10px 0;border-bottom:1px solid ${ink};padding-bottom:5px;color:${ink};">${text}</div>`;
  });

  html = html.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, (match, p1) => {
      return `<div>${p1}</div>`;
  });

  html = html.replace(/<table>/gi, `<table style="width:100%;border-collapse:collapse;margin:25px 0;font-family:${fontSans};font-size:13px;color:${ink};border:2px solid ${ink};">`);
  html = html.replace(/<th>/gi, `<th style="padding:12px;background-color:${ink};font-weight:700;text-align:left;border-bottom:2px solid ${ink};border-right:1px solid #444;color:${bg};text-transform:uppercase;font-family:${fontSans};letter-spacing:1px;">`);
  html = html.replace(/<td>/gi, `<td style="padding:12px;border-bottom:1px solid ${ink};border-right:1px solid ${ink};color:${ink};">`);
  html = html.replace(/<tr>/gi, `<tr>`);

  html = html.replace(/<p>/gi, `<p style="margin:0 0 15px 0;color:${ink};font-family:${fontBody};font-size:14px;line-height:1.6;text-align:left;">`);
  
  html = html.replace(/<ul>/gi, `<ul style="margin:15px 0;padding-left:20px;color:${ink};font-family:${fontBody};font-size:14px;list-style-type: square;">`);
  html = html.replace(/<ol>/gi, `<ol style="margin:15px 0;padding-left:20px;color:${ink};font-family:${fontBody};font-size:14px;">`);
  html = html.replace(/<li>/gi, `<li style="margin-bottom:10px;padding-left:5px;color:${ink};line-height:1.6;text-align:left;">`);
  
  html = html.replace(/<strong>/gi, `<strong style="font-weight:700;color:${ink};background-color:#eeff00;padding:0 4px;">`);
  html = html.replace(/<em>/gi, `<em style="font-style:italic;color:${ink};border-bottom: 1px solid ${ink};">`);
  html = html.replace(/<a href="([^"]+)">/gi, `<a href="$1" style="color:${bg};background-color:${accent};text-decoration:none;padding:0 4px;font-weight:700;">`);

  html = html.replace(/\(Impact:\s*([^)]+)\)/g, (match, p1) => {
    return `<span style="font-family:${fontSans}; font-size:11px; letter-spacing:1px; border:1px solid ${ink}; background-color:#fff; padding:2px 8px; text-transform:uppercase; margin-left:8px; font-weight:700;">IMPACT:${p1.trim()}</span>`;
  });

  return html;
}

export function buildEmailHtml(markdownContent) {
  const bodyHtml = markdownToHtml(markdownContent);
  const now = new Date().toISOString();
  const ink = '#000000';
  const bg = '#ffffff';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Daily Dispatch</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Space+Grotesk:wght@400;700;900&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:40px 10px;background-color:#f0f0f0;font-family:'JetBrains Mono', monospace;">
  
  <div style="max-width:700px; margin:0 auto; padding:40px; background-color:${bg}; color:${ink}; border:2px solid ${ink}; box-shadow: 10px 10px 0px ${ink}; box-sizing:border-box;">
    
    <div style="text-align:left;border-bottom:8px solid ${ink};padding-bottom:15px;margin-bottom:20px;">
        <div style="font-family:'Space Grotesk', sans-serif;font-size:48px;font-weight:900;letter-spacing:-2px;text-transform:uppercase;line-height:1;color:${ink};">SYS.DISPATCH</div>
    </div>
    
    <div style="display:flex;justify-content:space-between;border-bottom:2px solid ${ink};padding:10px 0;margin-bottom:30px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${ink};">
        <span>// BUILD: v10.9.9</span>
        <span>// TS: ${now}</span>
    </div>

    ${bodyHtml}

    <div style="text-align:left;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;border-top:4px solid ${ink};padding-top:20px;margin-top:40px;color:${ink};">
        > EXECUTION_COMPLETE<br>
        > GENERATED BY NEWS_AGENT_CORE<br>
        > (C) 2026. ALL SYSTEMS OPERATIONAL.
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
    const emailSubject = subject || `The Daily Dispatch — ${today}`;
    const htmlContent = buildEmailHtml(content);

    console.log(`📧 Sending news digest to ${whitelistedEmails.length} recipient(s) via Resend...`);

    let data, error;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const response = await resend.emails.send({
        from: FROM_EMAIL,
        to: whitelistedEmails,
        subject: emailSubject,
        html: htmlContent,
      });
      data = response.data;
      error = response.error;

      if (!error) {
        break;
      }
      
      console.warn(`  ⚠️ Email attempt ${attempt} failed: ${error.message}`);
      if (attempt < 3) {
        console.log(`  ⏳ Retrying in 2 seconds...`);
        await new Promise(res => setTimeout(res, 2000));
      }
    }

    if (error) {
      console.error(`  ❌ Email ultimately failed: ${error.message}`);
      return { success: false, error: error.message };
    }

    console.log(`  ✅ Email sent successfully (ID: ${data.id})`);
    return { success: true, emailId: data.id };
  } catch (error) {
    console.error(`  ❌ Email sending encountered an error:`, error);
    return { success: false, error: error.message };
  }
}
