import { getUserTokens } from '../users/get-set-tokens.js';
import { getUserOAuthClient, getDriveClient } from '../util/googleClient.js';
import fs from 'fs';
import path from 'path';

/**
 * Upload file to Google Drive
 * POST /api/drive/upload-file
 * Body: { userId, filePath, fileName (optional), mimeType (optional), folderId (optional) }
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, filePath, fileName, mimeType, folderId } = req.body;

    // Validate required fields
    if (!userId || !filePath) {
      return res.status(400).json({
        error: 'Missing required fields: userId, filePath'
      });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        error: 'File not found',
        filePath
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

    // Create Drive client
    const drive = getDriveClient(oauth2Client);

    // Prepare file metadata
    const finalFileName = fileName || path.basename(filePath);
    const fileMetadata = {
      name: finalFileName,
      ...(folderId && { parents: [folderId] })
    };

    // Read file
    const fileContent = fs.readFileSync(filePath);

    // Upload file
    const result = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: mimeType || 'application/octet-stream',
        body: fileContent
      },
      fields: 'id, name, mimeType, webViewLink, createdTime'
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: result.data.id,
        name: result.data.name,
        mimeType: result.data.mimeType,
        webViewLink: result.data.webViewLink,
        createdTime: result.data.createdTime
      }
    });
  } catch (error) {
    console.error('[upload-file] Error:', error.message);
    res.status(500).json({
      error: 'Failed to upload file',
      details: error.message
    });
  }
}
