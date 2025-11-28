import { google } from 'googleapis';

/**
 * Generate OAuth consent URL for user
 * POST /api/auth/start-auth
 * Body: { clientId, redirectUri, scopes }
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { clientId, redirectUri, scopes } = req.body;

    // Validate required fields
    if (!clientId || !redirectUri) {
      return res.status(400).json({
        error: 'Missing required fields: clientId, redirectUri'
      });
    }

    // Default scopes if not provided
    const requestedScopes = scopes || [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ];

    // Create OAuth2 client (no secret needed yet)
    const oauth2Client = new google.auth.OAuth2(clientId, 'dummy-secret', redirectUri);

    // Generate consent URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: requestedScopes,
      prompt: 'consent'
    });

    res.json({
      success: true,
      authUrl,
      scopes: requestedScopes
    });
  } catch (error) {
    console.error('[start-auth] Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate auth URL',
      details: error.message
    });
  }
}
