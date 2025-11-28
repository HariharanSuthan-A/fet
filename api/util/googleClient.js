import { google } from 'googleapis';

/**
 * Create an OAuth2 client for a specific user
 * @param {Object} params
 * @param {string} params.clientId - Google OAuth Client ID
 * @param {string} params.clientSecret - Google OAuth Client Secret
 * @param {string} params.redirectUri - OAuth redirect URI
 * @param {Object} params.tokens - User's access/refresh tokens
 * @returns {google.auth.OAuth2} Authenticated OAuth2 client
 */
export function getUserOAuthClient({ clientId, clientSecret, redirectUri, tokens }) {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

/**
 * Create a Gmail API client for a user
 * @param {Object} oauth2Client - Authenticated OAuth2 client
 * @returns {Object} Gmail API client
 */
export function getGmailClient(oauth2Client) {
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Create a Sheets API client for a user
 * @param {Object} oauth2Client - Authenticated OAuth2 client
 * @returns {Object} Sheets API client
 */
export function getSheetsClient(oauth2Client) {
  return google.sheets({ version: 'v4', auth: oauth2Client });
}

/**
 * Create a Drive API client for a user
 * @param {Object} oauth2Client - Authenticated OAuth2 client
 * @returns {Object} Drive API client
 */
export function getDriveClient(oauth2Client) {
  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Refresh access token if expired
 * @param {Object} oauth2Client - Authenticated OAuth2 client
 * @returns {Promise<Object>} Updated credentials
 */
export async function refreshAccessToken(oauth2Client) {
  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);
    return credentials;
  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }
}
