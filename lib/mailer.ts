import nodemailer from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER || 'codeclash.invertis@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);

// Create reusable transporter object using Gmail SMTP
function getTransporter() {
  if (!SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export interface WelcomeEmailData {
  toEmail: string;
  toName: string;
  handle?: string;
  college?: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const { toEmail, toName, handle, college } = data;
  const displayName = toName || 'Contestant';
  const userHandle = handle ? `@${handle}` : '';
  const collegeName = college || 'Invertis University';

  const subject = `Welcome to CodeClash - Your 1v1 Competitive Coding Journey Begins!`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CodeClash</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #faf8f5;
      color: #1a1715;
    }
    .wrapper {
      max-width: 600px;
      margin: 24px auto;
      background-color: #ffffff;
      border: 1px solid #e7e2d9;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    }
    .header {
      background-color: #151311;
      padding: 32px 28px;
      text-align: center;
      border-bottom: 3px solid #f59e0b;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      margin: 0;
    }
    .logo span {
      color: #f59e0b;
    }
    .badge {
      display: inline-block;
      margin-top: 10px;
      padding: 4px 12px;
      border-radius: 9999px;
      background-color: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 32px 28px;
      line-height: 1.6;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #151311;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 14px;
      color: #4a453e;
      margin: 0 0 16px 0;
    }
    .info-box {
      background-color: #fcfbf9;
      border: 1px solid #ede8e1;
      border-radius: 12px;
      padding: 18px 20px;
      margin: 24px 0;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px dashed #e7e2d9;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #78716c;
      font-weight: 500;
    }
    .info-value {
      color: #151311;
      font-weight: 700;
      font-family: monospace;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 24px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #f59e0b;
      color: #000000 !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
    }
    .steps {
      margin: 24px 0;
      padding: 0;
      list-style-type: none;
    }
    .step-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 14px;
      font-size: 13px;
      color: #4a453e;
    }
    .step-num {
      background-color: #151311;
      color: #f59e0b;
      font-weight: 800;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      text-align: center;
      line-height: 22px;
      font-size: 11px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .footer {
      background-color: #faf8f5;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e7e2d9;
      font-size: 12px;
      color: #78716c;
    }
    .footer a {
      color: #b45309;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="logo">CODE<span>CLASH</span></h1>
      <div class="badge">${collegeName.toUpperCase()} ARENA</div>
    </div>

    <div class="content">
      <h1>Welcome aboard, ${displayName}! 🎉</h1>
      <p>
        Thank you for joining <strong>CodeClash</strong> — the official peer-to-peer real-time competitive coding platform at ${collegeName}. Your student duel profile has been successfully activated.
      </p>

      <div class="info-box">
        <div class="info-item">
          <span class="info-label">Contestant Name</span>
          <span class="info-value">${displayName}</span>
        </div>
        ${handle ? `
        <div class="info-item">
          <span class="info-label">Arena Handle</span>
          <span class="info-value">${userHandle}</span>
        </div>` : ''}
        <div class="info-item">
          <span class="info-label">Starting Tier</span>
          <span class="info-value">Novice (1000 ELO)</span>
        </div>
        <div class="info-item">
          <span class="info-label">Institution</span>
          <span class="info-value">${collegeName}</span>
        </div>
      </div>

      <p style="font-weight: 600; color: #151311;">What you can do right now:</p>
      <div class="steps">
        <div class="step-item">
          <div class="step-num">1</div>
          <div><strong>1v1 Coding Duels:</strong> Challenge classmates to 45-minute live DSA duels with real-time testcase scoring.</div>
        </div>
        <div class="step-item">
          <div class="step-num">2</div>
          <div><strong>Curated Question Bank:</strong> Solve previous placement interview questions from Google, Amazon, Microsoft, TCS & Infosys.</div>
        </div>
        <div class="step-item">
          <div class="step-num">3</div>
          <div><strong>Climb Campus Leaderboard:</strong> Earn ELO points, maintain your daily practice streak, and unlock placement badges.</div>
        </div>
      </div>

      <div class="cta-container">
        <a href="https://codeclash-in.vercel.app" class="cta-button">Enter The Arena &rarr;</a>
      </div>

      <p style="font-size: 12px; color: #78716c; text-align: center; margin-top: 24px;">
        Need assistance, want to organize a campus contest, or report a bug? Reach out directly to our team at <a href="mailto:codeclash.invertis@gmail.com" style="color: #b45309; font-weight: 600;">codeclash.invertis@gmail.com</a>.
      </p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CodeClash Platform &bull; Invertis University, Bareilly</p>
      <p>
        <a href="https://codeclash-in.vercel.app/privacy">Privacy Policy</a> &bull;
        <a href="https://codeclash-in.vercel.app/terms">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Welcome to CodeClash, ${displayName}!

Thank you for registering on CodeClash — the real-time 1v1 competitive coding platform at ${collegeName}.

Your Account Summary:
- Name: ${displayName}
- Handle: ${userHandle}
- Starting ELO: 1000 ELO (Novice)
- College: ${collegeName}

Jump in and test your DSA skills: https://codeclash-in.vercel.app

Support & Contact: codeclash.invertis@gmail.com
Invertis University, Bareilly
  `;

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[SMTP SIMULATED] Welcome email prepared for ${toEmail} (${displayName}). To send live emails, configure SMTP_PASS in environment variables.`);
    return {
      success: true,
      simulated: true,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"CodeClash Invertis" <${SMTP_USER}>`,
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`[SMTP SENT] Welcome email dispatched to ${toEmail}. MessageId: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (err: any) {
    console.error(`[SMTP ERROR] Failed to send welcome email to ${toEmail}:`, err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function sendCustomMail(params: {
  toEmail: string;
  toName?: string;
  subject: string;
  body: string;
  category?: string;
}): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const { toEmail, toName, subject, body } = params;
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[SMTP SIMULATED] Custom email to ${toEmail}: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"CodeClash Admin" <${SMTP_USER}>`,
      to: toEmail,
      subject,
      text: body,
      html: `<div style="font-family: sans-serif; line-height: 1.6; color: #151311; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b; margin-top: 0;">CodeClash Notification</h2>
        <p>Hello ${toName || 'Student'},</p>
        <div style="background: #fdfcf9; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0;">
          ${body.replace(/\n/g, '<br/>')}
        </div>
        <p style="font-size: 12px; color: #78716c; margin-top: 24px;">Sent by CodeClash Invertis Administration &bull; <a href="mailto:codeclash.invertis@gmail.com">codeclash.invertis@gmail.com</a></p>
      </div>`,
    });

    return { success: true, messageId: info.messageId, simulated: false };
  } catch (err: any) {
    console.error(`[SMTP ERROR] Failed to send custom email to ${toEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}
