# Multi-User Google Services Platform

A production-ready Node.js backend for managing multi-user access to Google APIs (Gmail, Sheets, Drive) with per-user OAuth token management.

## Features

- ✅ **Multi-User OAuth Support** - Each user provides their own Google credentials
- ✅ **Gmail API** - Send emails, list messages
- ✅ **Google Sheets API** - Read and write spreadsheet data
- ✅ **Google Drive API** - Upload and download files
- ✅ **Token Management** - Secure per-user token storage and refresh
- ✅ **Error Handling** - Comprehensive error messages and logging
- ✅ **CORS Enabled** - Ready for frontend integration
- ✅ **Serverless Ready** - Compatible with Vercel, AWS Lambda, etc.

## Project Structure

```
project-root/
├── api/
│   ├── auth/
│   │   ├── start-auth.js       # Generate OAuth consent URL
│   │   └── oauth-callback.js   # Exchange code for tokens
│   ├── gmail/
│   │   ├── send-email.js       # Send email
│   │   └── list-emails.js      # List user emails
│   ├── sheets/
│   │   ├── read-sheet.js       # Read spreadsheet data
│   │   └── write-sheet.js      # Write spreadsheet data
│   ├── drive/
│   │   ├── upload-file.js      # Upload file to Drive
│   │   └── download-file.js    # Download file from Drive
│   ├── users/
│   │   └── get-set-tokens.js   # Token storage layer
│   └── util/
│       └── googleClient.js     # Google API client helpers
├── server.js                   # Express server
├── package.json
├── .env.example
└── README.md
```

## Installation

### 1. Clone/Setup Project

```bash
cd multi-user-google-platform
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` as needed:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
TOKEN_STORAGE=memory
```

### 3. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will be available at `http://localhost:3000`

## API Endpoints

### Authentication

#### Generate OAuth URL
```
POST /api/auth/start-auth
Content-Type: application/json

{
  "clientId": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "redirectUri": "http://localhost:3000/callback",
  "scopes": [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file"
  ]
}

Response:
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "scopes": [...]
}
```

#### Exchange Code for Tokens
```
POST /api/auth/oauth-callback
Content-Type: application/json

{
  "code": "4/0AY0e-g...",
  "clientId": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "redirectUri": "http://localhost:3000/callback",
  "userId": "user-123"  // optional, auto-generated if not provided
}

Response:
{
  "success": true,
  "userId": "user-123",
  "message": "OAuth tokens saved successfully",
  "tokenInfo": {
    "expiresIn": "2024-01-15T10:30:00.000Z",
    "scopes": [...]
  }
}
```

### Gmail

#### Send Email
```
POST /api/gmail/send-email
Content-Type: application/json

{
  "userId": "user-123",
  "to": "recipient@example.com",
  "cc": "cc@example.com",
  "bcc": "bcc@example.com",
  "subject": "Hello World",
  "htmlBody": "<h1>Hello</h1><p>This is a test email</p>",
  "textBody": "Hello\n\nThis is a test email"
}

Response:
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "18b4f...",
  "threadId": "18b4f..."
}
```

#### List Emails
```
GET /api/gmail/list-emails?userId=user-123&maxResults=10&query=from:sender@example.com

Response:
{
  "success": true,
  "count": 10,
  "emails": [
    {
      "id": "18b4f...",
      "threadId": "18b4f...",
      "from": "sender@example.com",
      "subject": "Test Email",
      "date": "Mon, 15 Jan 2024 10:30:00 +0000",
      "snippet": "This is a test email..."
    }
  ],
  "nextPageToken": null
}
```

### Google Sheets

#### Read Sheet
```
GET /api/sheets/read-sheet?userId=user-123&spreadsheetId=1BxiMVs0XRA5nFMKUVfIrWNw&range=Sheet1!A1:Z100

Response:
{
  "success": true,
  "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIrWNw",
  "range": "Sheet1!A1:Z100",
  "values": [
    ["Name", "Email", "Phone"],
    ["John Doe", "john@example.com", "555-1234"],
    ["Jane Smith", "jane@example.com", "555-5678"]
  ],
  "rowCount": 3,
  "columnCount": 3
}
```

#### Write Sheet
```
POST /api/sheets/write-sheet
Content-Type: application/json

{
  "userId": "user-123",
  "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIrWNw",
  "range": "Sheet1!A1",
  "values": [
    ["Name", "Email", "Phone"],
    ["John Doe", "john@example.com", "555-1234"],
    ["Jane Smith", "jane@example.com", "555-5678"]
  ]
}

Response:
{
  "success": true,
  "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIrWNw",
  "range": "Sheet1!A1:C3",
  "updatedRows": 3,
  "updatedColumns": 3,
  "updatedCells": 9
}
```

### Google Drive

#### Upload File
```
POST /api/drive/upload-file
Content-Type: application/json

{
  "userId": "user-123",
  "filePath": "/path/to/local/file.pdf",
  "fileName": "document.pdf",
  "mimeType": "application/pdf",
  "folderId": "1A2B3C4D5E6F7G8H9I0J"  // optional
}

Response:
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "id": "1A2B3C4D5E6F7G8H9I0J",
    "name": "document.pdf",
    "mimeType": "application/pdf",
    "webViewLink": "https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view",
    "createdTime": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Download File
```
GET /api/drive/download-file?userId=user-123&fileId=1A2B3C4D5E6F7G8H9I0J&outputPath=/path/to/save/file.pdf

Response:
{
  "success": true,
  "message": "File downloaded successfully",
  "file": {
    "id": "1A2B3C4D5E6F7G8H9I0J",
    "name": "document.pdf",
    "mimeType": "application/pdf",
    "size": "1024000",
    "savedTo": "/path/to/save/file.pdf"
  }
}
```

## Setup Google OAuth

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Gmail API
   - Google Sheets API
   - Google Drive API

### 2. Create OAuth 2.0 Credentials

1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Choose **Web application**
3. Add authorized redirect URIs:
   - `http://localhost:3000/callback` (development)
   - `https://yourdomain.com/callback` (production)
4. Download credentials JSON

### 3. Get Client ID & Secret

From the downloaded JSON or credentials page:
- `client_id`: Your Client ID
- `client_secret`: Your Client Secret

## Token Storage

### Development (In-Memory)

Tokens are stored in memory. They will be lost on server restart.

```javascript
// In api/users/get-set-tokens.js
const userTokensStore = new Map();
```

### Production (Database)

For production, replace the in-memory storage with a database:

**MongoDB Example:**
```javascript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('google-services');
const tokensCollection = db.collection('user_tokens');

export async function saveTokensForUser(userId, credentials) {
  await tokensCollection.updateOne(
    { userId },
    { $set: credentials },
    { upsert: true }
  );
}

export async function getUserTokens(userId) {
  return await tokensCollection.findOne({ userId });
}
```

**PostgreSQL Example:**
```javascript
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function saveTokensForUser(userId, credentials) {
  await pool.query(
    'INSERT INTO user_tokens (user_id, credentials) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET credentials = $2',
    [userId, JSON.stringify(credentials)]
  );
}

export async function getUserTokens(userId) {
  const result = await pool.query(
    'SELECT credentials FROM user_tokens WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.credentials ? JSON.parse(result.rows[0].credentials) : null;
}
```

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### AWS Lambda

1. Install Serverless Framework
2. Configure `serverless.yml`
3. Deploy with `serverless deploy`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

Common errors:
- `400 Bad Request` - Missing or invalid parameters
- `401 Unauthorized` - User not authorized (no tokens)
- `405 Method Not Allowed` - Wrong HTTP method
- `500 Internal Server Error` - Server error

## Security Considerations

1. **Never hardcode credentials** - Use environment variables
2. **Validate all inputs** - Check userId, spreadsheetId, fileId, etc.
3. **Use HTTPS in production** - Secure token transmission
4. **Implement rate limiting** - Prevent abuse
5. **Log all API calls** - For audit trails
6. **Rotate refresh tokens** - Implement token rotation
7. **Secure token storage** - Use encrypted database
8. **Implement CORS properly** - Restrict to trusted origins

## Troubleshooting

### "User not authorized"
- User hasn't completed OAuth flow
- Tokens have expired and refresh failed
- Check if userId is correct

### "Invalid credentials"
- Client ID or Secret is incorrect
- Redirect URI doesn't match
- Check Google Cloud Console settings

### "Rate limit exceeded"
- Too many API requests
- Implement exponential backoff
- Use batch operations when possible

### "Token refresh failed"
- Refresh token has expired
- User revoked access
- Require re-authorization

## License

MIT

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Google API documentation
3. Check server logs for detailed errors
4. Enable debug logging in `.env`

## Next Steps

1. Set up Google OAuth credentials
2. Test OAuth flow with `/api/auth/start-auth`
3. Implement frontend to call these endpoints
4. Set up database for token storage
5. Deploy to production
#   f e t  
 