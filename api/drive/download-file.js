import { getUserTokens } from '../users/get-set-tokens.js';
import { getUserOAuthClient, getDriveClient } from '../util/googleClient.js';
import fs from 'fs';
import path from 'path';

/**
 * Download file from Google Drive
 * GET /api/drive/download-file?userId=USER_ID&fileId=FILE_ID&outputPath=/path/to/save
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, fileId, outputPath } = req.query;

    // Validate required fields
    if (!userId || !fileId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, fileId'
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

    // Get file metadata
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size'
    });

    // Download file
    const response = await drive.files.get(
      {
        fileId,
        alt: 'media'
      },
      { responseType: 'stream' }
    );

    // If outputPath provided, save to disk
    if (outputPath) {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(outputPath);
      response.data.pipe(writeStream);

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          res.json({
            success: true,
            message: 'File downloaded successfully',
            file: {
              id: fileMetadata.data.id,
              name: fileMetadata.data.name,
              mimeType: fileMetadata.data.mimeType,
              size: fileMetadata.data.size,
              savedTo: outputPath
            }
          });
          resolve();
        });
        writeStream.on('error', reject);
      });
    }

    // Otherwise, stream to response
    res.setHeader('Content-Disposition', `attachment; filename="${fileMetadata.data.name}"`);
    res.setHeader('Content-Type', fileMetadata.data.mimeType);
    response.data.pipe(res);
  } catch (error) {
    console.error('[download-file] Error:', error.message);
    res.status(500).json({
      error: 'Failed to download file',
      details: error.message
    });
  }
}
