import { getUserTokens } from '../users/get-set-tokens.js';
import { getUserOAuthClient, getGmailClient } from '../util/googleClient.js';

/**
 * List emails for a user
 * GET /api/gmail/list-emails?userId=USER_ID&maxResults=10&query=
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, maxResults = 10, query = '' } = req.query;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
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

    // List messages
    const result = await gmail.users.messages.list({
      userId: 'me',
      maxResults: Math.min(parseInt(maxResults), 100),
      q: query
    });

    const messages = result.data.messages || [];

    // Get full message details
    const messageDetails = await Promise.all(
      messages.map(msg =>
        gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date']
        })
      )
    );

    const emails = messageDetails.map(msg => {
      const headers = msg.data.payload.headers;
      const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

      return {
        id: msg.data.id,
        threadId: msg.data.threadId,
        from: getHeader('From'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        snippet: msg.data.snippet
      };
    });

    res.json({
      success: true,
      count: emails.length,
      emails,
      nextPageToken: result.data.nextPageToken || null
    });
  } catch (error) {
    console.error('[list-emails] Error:', error.message);
    res.status(500).json({
      error: 'Failed to list emails',
      details: error.message
    });
  }
}
