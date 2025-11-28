import { google } from 'googleapis';
import { saveTokensForUser } from '../users/get-set-tokens.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handle OAuth callback and exchange code for tokens
 * POST /api/auth/oauth-callback
 * Body: { code, clientId, clientSecret, redirectUri, userId (optional) }
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, clientId, clientSecret, redirectUri, userId } = req.body;

    // Validate required fields
    if (!code || !clientId || !clientSecret || !redirectUri) {
      return res.status(400).json({
        error: 'Missing required fields: code, clientId, clientSecret, redirectUri'
      });
    }

    // Generate userId if not provided
    const finalUserId = userId || uuidv4();

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Save tokens in database/storage
    await saveTokensForUser(finalUserId, {
      clientId,
      clientSecret,
      redirectUri,
      tokens,
      scopes: tokens.scope ? tokens.scope.split(' ') : []
    });

    res.json({
      success: true,
      userId: finalUserId,
      message: 'OAuth tokens saved successfully',
      tokenInfo: {
        expiresIn: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'unknown',
        scopes: tokens.scope ? tokens.scope.split(' ') : []
      }
    });
  } catch (error) {
    console.error('[oauth-callback] Error:', error.message);
    res.status(500).json({
      error: 'Failed to exchange authorization code',
      details: error.message
    });
  }
}
