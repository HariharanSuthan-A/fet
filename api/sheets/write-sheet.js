import { getUserTokens } from '../users/get-set-tokens.js';
import { getUserOAuthClient, getSheetsClient } from '../util/googleClient.js';

/**
 * Write data to a Google Sheet
 * POST /api/sheets/write-sheet
 * Body: { userId, spreadsheetId, range, values }
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, spreadsheetId, range = 'Sheet1!A1', values } = req.body;

    // Validate required fields
    if (!userId || !spreadsheetId || !values) {
      return res.status(400).json({
        error: 'Missing required fields: userId, spreadsheetId, values'
      });
    }

    // Validate values is array of arrays
    if (!Array.isArray(values) || !values.every(row => Array.isArray(row))) {
      return res.status(400).json({
        error: 'values must be an array of arrays (2D array)'
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

    // Write data to sheet
    const result = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values
      }
    });

    res.json({
      success: true,
      spreadsheetId,
      range: result.data.updatedRange,
      updatedRows: result.data.updatedRows,
      updatedColumns: result.data.updatedColumns,
      updatedCells: result.data.updatedCells
    });
  } catch (error) {
    console.error('[write-sheet] Error:', error.message);
    res.status(500).json({
      error: 'Failed to write to sheet',
      details: error.message
    });
  }
}
