# Quick Start Guide

Get the Multi-User Google Services Platform running in 5 minutes.

## Prerequisites

- Node.js 16+ installed
- Google Cloud Project with OAuth credentials
- npm or yarn

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
NODE_ENV=development
```

## Step 3: Start Server

```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║  Multi-User Google Services Platform                       ║
║  Server running on http://localhost:3000                   ║
║  API Documentation: http://localhost:3000/api/docs         ║
║  Health Check: http://localhost:3000/health                ║
╚════════════════════════════════════════════════════════════╝
```

## Step 4: Test Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 2.345
}
```

## Step 5: Get Your Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Gmail, Sheets, and Drive APIs
4. Create OAuth 2.0 credentials (Web application)
5. Add redirect URI: `http://localhost:3000/callback`
6. Copy your Client ID and Client Secret

## Step 6: Test OAuth Flow

### Generate Auth URL

```bash
curl -X POST http://localhost:3000/api/auth/start-auth \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "redirectUri": "http://localhost:3000/callback",
    "scopes": [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file"
    ]
  }'
```

Response:
```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "scopes": [...]
}
```

### Visit Auth URL

Open the `authUrl` in your browser. You'll be redirected to:
```
http://localhost:3000/callback?code=4/0AY0e-g...&scope=...
```

### Exchange Code for Tokens

Extract the `code` from the redirect URL and exchange it:

```bash
curl -X POST http://localhost:3000/api/auth/oauth-callback \
  -H "Content-Type: application/json" \
  -d '{
    "code": "4/0AY0e-g...",
    "clientId": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "clientSecret": "YOUR_CLIENT_SECRET",
    "redirectUri": "http://localhost:3000/callback",
    "userId": "user-123"
  }'
```

Response:
```json
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

## Step 7: Send Test Email

```bash
curl -X POST http://localhost:3000/api/gmail/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "to": "recipient@example.com",
    "subject": "Test Email",
    "htmlBody": "<h1>Hello!</h1><p>This is a test email from the Multi-User Google Services Platform.</p>"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "18b4f...",
  "threadId": "18b4f..."
}
```

## Step 8: Read Google Sheet

```bash
curl "http://localhost:3000/api/sheets/read-sheet?userId=user-123&spreadsheetId=1BxiMVs0XRA5nFMKUVfIrWNw&range=Sheet1"
```

Response:
```json
{
  "success": true,
  "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIrWNw",
  "range": "Sheet1!A1:C3",
  "values": [
    ["Name", "Email", "Phone"],
    ["John Doe", "john@example.com", "555-1234"]
  ],
  "rowCount": 2,
  "columnCount": 3
}
```

## Step 9: Write to Google Sheet

```bash
curl -X POST http://localhost:3000/api/sheets/write-sheet \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIrWNw",
    "range": "Sheet1!A1",
    "values": [
      ["Name", "Email", "Phone"],
      ["John Doe", "john@example.com", "555-1234"],
      ["Jane Smith", "jane@example.com", "555-5678"]
    ]
  }'
```

## Step 10: Upload File to Drive

```bash
curl -X POST http://localhost:3000/api/drive/upload-file \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "filePath": "/path/to/local/file.pdf",
    "fileName": "document.pdf",
    "mimeType": "application/pdf"
  }'
```

Response:
```json
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

## Common Issues

### "User not authorized"
- Make sure you've completed the OAuth flow
- Check that `userId` matches the one from oauth-callback

### "Invalid credentials"
- Verify Client ID and Client Secret are correct
- Check redirect URI matches in Google Cloud Console

### "Rate limit exceeded"
- Wait a few seconds before retrying
- Implement exponential backoff in production

## Next Steps

1. ✅ Server is running
2. ✅ OAuth flow tested
3. ✅ Gmail, Sheets, Drive APIs working
4. Build a frontend application
5. Deploy to production

## Documentation

- Full API docs: http://localhost:3000/api/docs
- README: See `README.md`
- Examples: See `EXAMPLES.md`

## Support

Check the README.md for detailed documentation and troubleshooting.
