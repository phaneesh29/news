import 'dotenv/config';
import { Resend } from 'resend';
import { whitelistedEmails } from '../whitelistEmails.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'NewsFetch Dispatch <ai@tsindia.org>';

export function buildEmailHtml(newsArray) {
  const ink = '#000000';
  const bg = '#ffffff';
  const accent = '#0055ff'; // sharp dev-blue
  const fontBody = "'JetBrains Mono', monospace";
  const fontHeadline = "'Space Grotesk', sans-serif";
  const fontSans = "'JetBrains Mono', monospace";

  const categories = [
    'Developer Tools & Platforms',
    'AI & Machine Learning',
    'Chips, Infrastructure & Acquisitions',
    'Security & Advisories'
  ];

  let bodyHtml = '';

  const matchedStories = new Set();

  categories.forEach(category => {
    const stories = newsArray.filter(s => {
      if (!s.category) return false;
      const cat = s.category.toLowerCase();
      let isMatch = false;
      
      if (category.includes('AI') && (cat.includes('ai') || cat.includes('machine learning'))) {
        isMatch = true;
      } else if (category.includes('Developer') && (cat.includes('dev') || cat.includes('platform'))) {
        isMatch = true;
      } else if (category.includes('Chips') && (cat.includes('chip') || cat.includes('infra') || cat.includes('acquisit'))) {
        isMatch = true;
      } else if (category.includes('Security') && cat.includes('secur')) {
        isMatch = true;
      } else if (cat === category.toLowerCase()) {
        isMatch = true;
      }

      if (isMatch) {
        matchedStories.add(s);
        return true;
      }
      return false;
    });

    if (stories.length === 0) return;
    
    // Category Header
    bodyHtml += `<div style="font-family:${fontHeadline};font-size:32px;font-weight:900;letter-spacing:-1px;line-height:1.1;text-transform:uppercase;text-align:left;margin:40px 0 20px 0;border-bottom:4px solid ${ink};padding-bottom:10px;color:${ink};">${category}</div>`;
    
    stories.forEach(story => {
      const tagsHtml = (story.tags || []).map(t => `<span style="background-color:#eeff00;padding:2px 6px;margin-right:6px;font-size:11px;font-weight:700;border:1px solid ${ink};">${t}</span>`).join('');
      
      const sourcesHtml = (story.sources || []).map(src => {
        let hostname = 'Link';
        try {
          hostname = new URL(src).hostname.replace('www.', '');
        } catch (e) {}
        return `<li><a href="${src}" style="color:${bg};background-color:${accent};text-decoration:none;padding:0 4px;font-weight:700;">${hostname}</a></li>`;
      }).join('');

      bodyHtml += `
        <div style="margin-bottom: 30px;">
          <div style="font-family:${fontHeadline};font-size:22px;font-weight:700;letter-spacing:-0.5px;text-transform:uppercase;margin:25px 0 10px 0;color:${ink};">${story.title}</div>
          <div style="margin-bottom:12px;">
            ${tagsHtml}
            <span style="font-family:${fontSans}; font-size:11px; letter-spacing:1px; border:1px solid ${ink}; background-color:#fff; padding:2px 8px; text-transform:uppercase; margin-left:8px; font-weight:700;">CONFIDENCE: ${story.confidence}</span>
          </div>
          <p style="margin:0 0 15px 0;color:${ink};font-family:${fontBody};font-size:14px;line-height:1.6;text-align:left;">${story.summary}</p>
          <ul style="margin:10px 0;padding-left:20px;color:${ink};font-family:${fontBody};font-size:13px;list-style-type:square;">
            ${sourcesHtml}
          </ul>
          <hr style="border: 0; border-top: 1px solid ${ink}; margin-top: 20px;" />
        </div>
      `;
    });
  });

  // Render any unmatched stories
  const unmatched = newsArray.filter(s => !matchedStories.has(s));
  if (unmatched.length > 0) {
    bodyHtml += `<div style="font-family:${fontHeadline};font-size:32px;font-weight:900;letter-spacing:-1px;line-height:1.1;text-transform:uppercase;text-align:left;margin:40px 0 20px 0;border-bottom:4px solid ${ink};padding-bottom:10px;color:${ink};">Other Updates</div>`;
    
    unmatched.forEach(story => {
      const tagsHtml = (story.tags || []).map(t => `<span style="background-color:#eeff00;padding:2px 6px;margin-right:6px;font-size:11px;font-weight:700;border:1px solid ${ink};">${t}</span>`).join('');
      
      const sourcesHtml = (story.sources || []).map(src => {
        let hostname = 'Link';
        try {
          hostname = new URL(src).hostname.replace('www.', '');
        } catch (e) {}
        return `<li><a href="${src}" style="color:${bg};background-color:${accent};text-decoration:none;padding:0 4px;font-weight:700;">${hostname}</a></li>`;
      }).join('');

      bodyHtml += `
        <div style="margin-bottom: 30px;">
          <div style="font-family:${fontHeadline};font-size:22px;font-weight:700;letter-spacing:-0.5px;text-transform:uppercase;margin:25px 0 10px 0;color:${ink};">${story.title}</div>
          <div style="margin-bottom:12px;">
            ${tagsHtml}
            <span style="font-family:${fontSans}; font-size:11px; letter-spacing:1px; border:1px solid ${ink}; background-color:#fff; padding:2px 8px; text-transform:uppercase; margin-left:8px; font-weight:700;">CONFIDENCE: ${story.confidence}</span>
          </div>
          <p style="margin:0 0 15px 0;color:${ink};font-family:${fontBody};font-size:14px;line-height:1.6;text-align:left;">${story.summary}</p>
          <ul style="margin:10px 0;padding-left:20px;color:${ink};font-family:${fontBody};font-size:13px;list-style-type:square;">
            ${sourcesHtml}
          </ul>
          <hr style="border: 0; border-top: 1px solid ${ink}; margin-top: 20px;" />
        </div>
      `;
    });
  }

  const now = new Date().toISOString();

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

export async function sendEmail(newsArray, subject) {
  try {
    if (!newsArray || !Array.isArray(newsArray) || newsArray.length === 0) {
      console.log('⚠️ [Email Sender] News array is empty or not an array. Skipping email.');
      return { success: false, error: 'News array is empty.' };
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
    const htmlContent = buildEmailHtml(newsArray);

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
