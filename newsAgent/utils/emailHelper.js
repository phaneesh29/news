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

  let html = marked.parse(md);

  const ink = '#181513';
  const fontBody = "'Alegreya', serif";
  const fontHeadline = "'Old Standard TT', serif";
  const fontSans = "'Arial', sans-serif";

  html = html.replace(/<h2>([\s\S]+?)<\/h2>/gi, (match, p1) => {
    const text = p1.trim();
    return `<div style="font-family:${fontHeadline};font-size:32px;font-weight:700;line-height:1.05;text-transform:uppercase;text-align:center;margin:20px 0 10px 0;border-bottom:1px solid ${ink};padding-bottom:4px;color:${ink};">${text}</div>`;
  });

  html = html.replace(/<h3>([\s\S]+?)<\/h3>/gi, (match, p1) => {
    const text = p1.trim();
    const cleanText = text.replace(/<\/?u>/g, '').trim();

    if (cleanText.includes('Breaking')) {
      return `
        <div style="margin-top: 20px; margin-bottom: 6px; border-bottom: 1px dashed ${ink}; padding-bottom: 2px;">
          <span style="font-family:${fontSans}; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #781a1a; display: block; margin-bottom: 2px;">NOTICE: BREAKING</span>
          <span style="font-family:${fontHeadline}; font-size: 20px; font-weight: 700; text-transform: uppercase; color: ${ink};">${text}</span>
        </div>`;
    } else if (cleanText.includes('Trending') || cleanText.includes('Notable')) {
      return `
        <div style="margin-top: 20px; margin-bottom: 6px; border-bottom: 1px dashed ${ink}; padding-bottom: 2px;">
          <span style="font-family:${fontSans}; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: ${ink}; display: block; margin-bottom: 2px;">DISPATCH UPDATE</span>
          <span style="font-family:${fontHeadline}; font-size: 20px; font-weight: 700; text-transform: uppercase; color: ${ink};">${text}</span>
        </div>`;
    }
    return `<div style="font-family:${fontHeadline};font-size:20px;font-weight:700;text-transform:uppercase;margin:15px 0 6px 0;border-bottom:1px dashed ${ink};padding-bottom:2px;color:${ink};">${text}</div>`;
  });

  html = html.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, (match, p1) => {
      return `<div>${p1}</div>`;
  });

  html = html.replace(/<table>/gi, `<table style="width:100%;border-collapse:collapse;margin:15px 0;font-family:${fontSans};font-size:12px;color:${ink};border:2px solid ${ink};">`);
  html = html.replace(/<th>/gi, `<th style="padding:8px;background-color:transparent;font-weight:bold;text-align:left;border-bottom:2px solid ${ink};border-right:1px solid ${ink};color:${ink};text-transform:uppercase;">`);
  html = html.replace(/<td>/gi, `<td style="padding:8px;border-bottom:1px solid ${ink};border-right:1px solid ${ink};color:${ink};">`);
  html = html.replace(/<tr>/gi, `<tr>`);

  html = html.replace(/<p>/gi, `<p style="margin:0 0 10px 0;text-indent:12px;color:${ink};font-family:${fontBody};font-size:15px;line-height:1.35;text-align:justify;">`);
  
  html = html.replace(/<ul>/gi, `<ul style="margin:10px 0;padding-left:20px;color:${ink};font-family:${fontBody};font-size:15px;">`);
  html = html.replace(/<ol>/gi, `<ol style="margin:10px 0;padding-left:20px;color:${ink};font-family:${fontBody};font-size:15px;">`);
  html = html.replace(/<li>/gi, `<li style="margin-bottom:6px;padding-left:4px;color:${ink};line-height:1.35;text-align:justify;">`);
  
  html = html.replace(/<strong>/gi, `<strong style="font-weight:bold;color:${ink};">`);
  html = html.replace(/<em>/gi, `<em style="font-style:italic;color:${ink};">`);
  html = html.replace(/<a href="([^"]+)">/gi, `<a href="$1" style="color:${ink};text-decoration:underline;font-weight:bold;">`);

  html = html.replace(/\(Impact:\s*([^)]+)\)/g, (match, p1) => {
    return `<span style="font-family:${fontSans}; font-size:10px; border:1px solid ${ink}; padding:1px 4px; font-weight:bold; text-transform:uppercase; margin-left:4px;">Impact: ${p1.trim()}</span>`;
  });

  return html;
}

export function buildEmailHtml(markdownContent) {
  const bodyHtml = markdownToHtml(markdownContent);
  const now = new Date().toLocaleString('en-US', { timeZoneName: 'short' }).toUpperCase();
  const ink = '#181513';
  const paper = '#e4d8bc';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Daily Dispatch</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,700;1,400;1,700&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:${paper};">
  
  <div style="width:100%; margin:0; padding:2px 8px; background-color:${paper}; color:${ink}; font-family:'Alegreya',serif; font-size:15px; line-height:1.35; border:none; text-align:justify; box-sizing:border-box;">
    
    <div style="text-align:center;border-bottom:4px double ${ink};padding-bottom:8px;margin-bottom:4px;">
        <div style="font-family:'Playfair Display',serif;font-size:52px;font-weight:900;text-transform:uppercase;line-height:1;letter-spacing:0px;color:${ink};">The Daily Dispatch</div>
    </div>
    
    <div style="text-align:center;border-bottom:1px solid ${ink};border-top:1px solid ${ink};padding:4px 0;margin-bottom:15px;font-family:'Arial',sans-serif;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:${ink};">
        Vol. I — No. 1 &nbsp;|&nbsp; DELIVERED VIA POST &nbsp;|&nbsp; ${now}
    </div>

    ${bodyHtml}

    <div style="text-align:center;font-family:'Arial',sans-serif;font-size:9px;text-transform:uppercase;border-top:4px double ${ink};padding-top:10px;margin-top:20px;color:${ink};">
        Printed and Published by the NewsAgent Dispatch Service.<br>
        Delivered electronically via telegraphic channels. All Rights Reserved © 2026.
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
