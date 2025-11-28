import { getUserTokens } from '../users/get-set-tokens.js';
import { getUserOAuthClient, getSheetsClient } from '../util/googleClient.js';

/**
 * Read data from a Google Sheet
 * GET /api/sheets/read-sheet?userId=USER_ID&spreadsheetId=SHEET_ID&range=Sheet1!A1:Z100
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, spreadsheetId, range = 'Sheet1' } = req.query;

    // Validate required fields
    if (!userId || !spreadsheetId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, spreadsheetId'
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

    // Create Sheets client
    const sheets = getSheetsClient(oauth2Client);

    // Read sheet data
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    res.json({
      success: true,
      spreadsheetId,
      range: result.data.range,
      values: result.data.values || [],
      rowCount: result.data.values?.length || 0,
      columnCount: result.data.values?.[0]?.length || 0
    });
  } catch (error) {
    console.error('[read-sheet] Error:', error.message);
    res.status(500).json({
      error: 'Failed to read sheet',
      details: error.message
    });
  }
}
