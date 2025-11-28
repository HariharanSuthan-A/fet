import { getUserTokens } from '../users/get-set-tokens.js';
import { getUserOAuthClient, getGmailClient } from '../util/googleClient.js';

/**
 * Send email on behalf of user
 * POST /api/gmail/send-email
 * Body: { userId, to, subject, htmlBody, textBody (optional), cc (optional), bcc (optional) }
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, to, subject, htmlBody, textBody, cc, bcc } = req.body;

    // Validate required fields
    if (!userId || !to || !subject || (!htmlBody && !textBody)) {
      return res.status(400).json({
        error: 'Missing required fields: userId, to, subject, and (htmlBody or textBody)'
      });
    }

    // Get user's credentials
    const creds = await getUserTokens(userId);
    if (!creds) {
      return res.status(401).json({
        error: 'User not authorized',
        message: 'Please complete OAuth flow first'
      });
    }

    // Create OAuth2 client
    const oauth2Client = getUserOAuthClient({
      clientId: creds.clientId,
      clientSecret: creds.clientSecret,
      redirectUri: creds.redirectUri,
      tokens: creds.tokens
    });

    // Create Gmail client
    const gmail = getGmailClient(oauth2Client);

    // Build email message
    const emailLines = [];
    emailLines.push(`To: ${to}`);
    if (cc) emailLines.push(`Cc: ${cc}`);
    if (bcc) emailLines.push(`Bcc: ${bcc}`);
    emailLines.push(`Subject: ${subject}`);

    if (htmlBody) {
      emailLines.push('Content-Type: text/html; charset=UTF-8');
    } else {
      emailLines.push('Content-Type: text/plain; charset=UTF-8');
    }

    emailLines.push('');
    emailLines.push(htmlBody || textBody);

    const email = emailLines.join('\r\n');

    // Encode to base64url
    const raw = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw }
    });

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.data.id,
      threadId: result.data.threadId
    });
  } catch (error) {
    console.error('[send-email] Error:', error.message);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
}
