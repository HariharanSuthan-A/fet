# API Reference Card

Quick reference for all API endpoints.

## Base URL

```
http://localhost:3000  (development)
https://yourdomain.com (production)
```

## Authentication Endpoints

### 1. Generate OAuth URL

```
POST /api/auth/start-auth
Content-Type: application/json

Request:
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

Response (200):
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "scopes": [...]
}

Errors:
- 400: Missing clientId or redirectUri
- 500: Server error
```

### 2. Exchange Code for Tokens

```
POST /api/auth/oauth-callback
Content-Type: application/json

Request:
{
  "code": "4/0AY0e-g...",
  "clientId": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "redirectUri": "http://localhost:3000/callback",
  "userId": "user-123"  // optional
}

Response (200):
{
  "success": true,
  "userId": "user-123",
  "message": "OAuth tokens saved successfully",
  "tokenInfo": {
    "expiresIn": "2024-01-15T10:30:00.000Z",
    "scopes": [...]
  }
}

Errors:
- 400: Missing required fields
- 500: Token exchange failed
```

---

## Gmail Endpoints

### 3. Send Email

```
POST /api/gmail/send-email
Content-Type: application/json

Request:
{
  "userId": "user-123",
  "to": "recipient@example.com",
  "cc": "cc@example.com",        // optional
  "bcc": "bcc@example.com",      // optional
  "subject": "Email Subject",
  "htmlBody": "<h1>Hello</h1>",  // optional
  "textBody": "Hello"            // optional
}

Response (200):
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "18b4f...",
  "threadId": "18b4f..."
}

Errors:
- 400: Missing userId, to, subject, or body
- 401: User not authorized
- 500: Failed to send email
```

### 4. List Emails

```
GET /api/gmail/list-emails?userId=USER_ID&maxResults=10&query=SEARCH_QUERY

Query Parameters:
- userId (required): User ID
- maxResults (optional): Max emails to return (default: 10, max: 100)
- query (optional): Gmail search query

Search Examples:
- from:sender@example.com
- is:unread
- has:attachment
- subject:keyword
- before:2024-01-15
- after:2024-01-01

Response (200):
{
  "success": true,
  "count": 10,
  "emails": [
    {
      "id": "18b4f...",
      "threadId": "18b4f...",
      "from": "sender@example.com",
      "subject": "Email Subject",
      "date": "Mon, 15 Jan 2024 10:30:00 +0000",
      "snippet": "Email preview text..."
    }
  ],
  "nextPageToken": null
}

Errors:
- 400: Missing userId
- 401: User not authorized
- 500: Failed to list emails
```

---

## Google Sheets Endpoints

### 5. Read Sheet

```
GET /api/sheets/read-sheet?userId=USER_ID&spreadsheetId=SHEET_ID&range=RANGE

Query Parameters:
- userId (required): User ID
- spreadsheetId (required): Google Sheet ID
- range (optional): Cell range (default: "Sheet1")

Range Examples:
- Sheet1
- Sheet1!A1:Z100
- Sheet1!A:C
- Sheet1!1:10

Response (200):
{
  "success": true,
  "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIrWNw",
  "range": "Sheet1!A1:C3",
  "values": [
    ["Name", "Email", "Phone"],
    ["John Doe", "john@example.com", "555-1234"],
    ["Jane Smith", "jane@example.com", "555-5678"]
  ],
  "rowCount": 3,
  "columnCount": 3
}

Errors:
- 400: Missing userId or spreadsheetId
- 401: User not authorized
- 500: Failed to read sheet
```

### 6. Write Sheet

```
POST /api/sheets/write-sheet
Content-Type: application/json

Request:
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

Response (200):
{
  "success": true,
  "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIrWNw",
  "range": "Sheet1!A1:C3",
  "updatedRows": 3,
  "updatedColumns": 3,
  "updatedCells": 9
}

Errors:
- 400: Missing userId, spreadsheetId, or values
- 401: User not authorized
- 500: Failed to write to sheet
```

---

## Google Drive Endpoints

### 7. Upload File

```
POST /api/drive/upload-file
Content-Type: application/json

Request:
{
  "userId": "user-123",
  "filePath": "/path/to/local/file.pdf",
  "fileName": "document.pdf",           // optional
  "mimeType": "application/pdf",        // optional
  "folderId": "1A2B3C4D5E6F7G8H9I0J"   // optional
}

Response (200):
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

Common MIME Types:
- application/pdf
- image/jpeg
- image/png
- text/plain
- application/vnd.openxmlformats-officedocument.wordprocessingml.document
- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

Errors:
- 400: Missing userId or filePath, or file not found
- 401: User not authorized
- 500: Failed to upload file
```

### 8. Download File

```
GET /api/drive/download-file?userId=USER_ID&fileId=FILE_ID&outputPath=OUTPUT_PATH

Query Parameters:
- userId (required): User ID
- fileId (required): Google Drive file ID
- outputPath (optional): Local path to save file

Response (200):
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

Errors:
- 400: Missing userId or fileId
- 401: User not authorized
- 500: Failed to download file
```

---

## Utility Endpoints

### 9. Health Check

```
GET /health

Response (200):
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 2.345
}
```

### 10. API Documentation

```
GET /api/docs

Response (200):
{
  "title": "Multi-User Google Services Platform API",
  "version": "1.0.0",
  "baseUrl": "http://localhost:3000",
  "endpoints": {
    "auth": {...},
    "gmail": {...},
    "sheets": {...},
    "drive": {...}
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing/invalid parameters) |
| 401 | Unauthorized (user not authorized) |
| 405 | Method Not Allowed (wrong HTTP method) |
| 500 | Internal Server Error |

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| User not authorized | No tokens for user | Complete OAuth flow |
| Missing required fields | Invalid request | Check request body |
| Invalid credentials | Wrong Client ID/Secret | Verify Google credentials |
| Token refresh failed | Refresh token expired | Re-authorize user |
| Rate limit exceeded | Too many requests | Wait and retry |

---

## Request/Response Examples

### Example 1: Send Email

```bash
curl -X POST http://localhost:3000/api/gmail/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "to": "john@example.com",
    "subject": "Hello",
    "htmlBody": "<p>This is a test email</p>"
  }'
```

### Example 2: Read Sheet

```bash
curl "http://localhost:3000/api/sheets/read-sheet?userId=user-123&spreadsheetId=1BxiMVs0XRA5nFMKUVfIrWNw&range=Sheet1!A1:C10"
```

### Example 3: Upload File

```bash
curl -X POST http://localhost:3000/api/drive/upload-file \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "filePath": "/path/to/file.pdf",
    "fileName": "document.pdf",
    "mimeType": "application/pdf"
  }'
```

---

## Rate Limiting

Recommended limits (implement in production):

- 100 requests per 15 minutes per IP
- 1000 requests per hour per user
- 10 concurrent requests per user

---

## Timeouts

- Request timeout: 30 seconds
- Token refresh timeout: 10 seconds
- File upload timeout: 5 minutes

---

## Pagination

For endpoints that support pagination:

```
Response includes:
- count: Number of items returned
- nextPageToken: Token for next page (if available)

Use nextPageToken in next request:
GET /api/gmail/list-emails?userId=USER_ID&pageToken=NEXT_PAGE_TOKEN
```

---

## Authentication

All requests require a valid `userId` that has completed OAuth flow.

The `userId` is returned from `/api/auth/oauth-callback`.

---

## CORS

CORS is enabled for configured origins (see `.env`).

Default: `*` (all origins)

Production: Set specific domains in `CORS_ORIGIN` environment variable.

---

## Versioning

Current API version: `1.0.0`

No version prefix in URLs (e.g., `/api/gmail/send-email` not `/api/v1/gmail/send-email`).

---

## Support

For detailed documentation, see:
- `README.md` - Full documentation
- `EXAMPLES.md` - Code examples
- `QUICKSTART.md` - Quick start guide
