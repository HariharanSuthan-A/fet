# API Examples

Complete examples for all endpoints with curl and JavaScript.

## Table of Contents

1. [Authentication](#authentication)
2. [Gmail](#gmail)
3. [Google Sheets](#google-sheets)
4. [Google Drive](#google-drive)

---

## Authentication

### Generate OAuth URL

**cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/start-auth \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "123456789-abc.apps.googleusercontent.com",
    "redirectUri": "http://localhost:3000/callback",
    "scopes": [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file"
    ]
  }'
```

**JavaScript:**
```javascript
async function generateAuthUrl() {
  const response = await fetch('http://localhost:3000/api/auth/start-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: '123456789-abc.apps.googleusercontent.com',
      redirectUri: 'http://localhost:3000/callback',
      scopes: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ]
    })
  });

  const data = await response.json();
  console.log('Auth URL:', data.authUrl);
  window.location.href = data.authUrl;
}
```

### Exchange Code for Tokens

**cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/oauth-callback \
  -H "Content-Type: application/json" \
  -d '{
    "code": "4/0AY0e-g...",
    "clientId": "123456789-abc.apps.googleusercontent.com",
    "clientSecret": "GOCSPX-...",
    "redirectUri": "http://localhost:3000/callback",
    "userId": "user-123"
  }'
```

**JavaScript:**
```javascript
async function exchangeCodeForTokens(code) {
  const response = await fetch('http://localhost:3000/api/auth/oauth-callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      clientId: '123456789-abc.apps.googleusercontent.com',
      clientSecret: 'GOCSPX-...',
      redirectUri: 'http://localhost:3000/callback',
      userId: 'user-123'
    })
  });

  const data = await response.json();
  if (data.success) {
    console.log('User ID:', data.userId);
    localStorage.setItem('userId', data.userId);
  }
  return data;
}
```

---

## Gmail

### Send Email

**cURL:**
```bash
curl -X POST http://localhost:3000/api/gmail/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "to": "recipient@example.com",
    "cc": "cc@example.com",
    "bcc": "bcc@example.com",
    "subject": "Project Update",
    "htmlBody": "<h1>Project Status</h1><p>Everything is on track.</p>",
    "textBody": "Project Status\n\nEverything is on track."
  }'
```

**JavaScript:**
```javascript
async function sendEmail(userId, to, subject, message) {
  const response = await fetch('http://localhost:3000/api/gmail/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      to,
      subject,
      htmlBody: `<p>${message}</p>`,
      textBody: message
    })
  });

  return await response.json();
}

// Usage
const result = await sendEmail(
  'user-123',
  'john@example.com',
  'Hello',
  'This is a test email'
);
console.log('Message ID:', result.messageId);
```

### List Emails

**cURL:**
```bash
# List recent emails
curl "http://localhost:3000/api/gmail/list-emails?userId=user-123&maxResults=10"

# Search for emails from a specific sender
curl "http://localhost:3000/api/gmail/list-emails?userId=user-123&maxResults=10&query=from:sender@example.com"

# Search for unread emails
curl "http://localhost:3000/api/gmail/list-emails?userId=user-123&maxResults=10&query=is:unread"

# Search for emails with attachment
curl "http://localhost:3000/api/gmail/list-emails?userId=user-123&maxResults=10&query=has:attachment"
```

**JavaScript:**
```javascript
async function listEmails(userId, query = '', maxResults = 10) {
  const params = new URLSearchParams({
    userId,
    maxResults,
    query
  });

  const response = await fetch(
    `http://localhost:3000/api/gmail/list-emails?${params}`,
    { method: 'GET' }
  );

  return await response.json();
}

// Usage - Get recent emails
const emails = await listEmails('user-123');
emails.emails.forEach(email => {
  console.log(`From: ${email.from}`);
  console.log(`Subject: ${email.subject}`);
  console.log(`Date: ${email.date}`);
  console.log('---');
});

// Usage - Search for unread emails
const unreadEmails = await listEmails('user-123', 'is:unread', 20);
console.log(`Found ${unreadEmails.count} unread emails`);
```

---

## Google Sheets

### Read Sheet

**cURL:**
```bash
# Read entire sheet
curl "http://localhost:3000/api/sheets/read-sheet?userId=user-123&spreadsheetId=1BxiMVs0XRA5nFMKUVfIrWNw&range=Sheet1"

# Read specific range
curl "http://localhost:3000/api/sheets/read-sheet?userId=user-123&spreadsheetId=1BxiMVs0XRA5nFMKUVfIrWNw&range=Sheet1!A1:C10"

# Read from multiple sheets
curl "http://localhost:3000/api/sheets/read-sheet?userId=user-123&spreadsheetId=1BxiMVs0XRA5nFMKUVfIrWNw&range=Sheet1!A1:Z100,Sheet2!A1:Z100"
```

**JavaScript:**
```javascript
async function readSheet(userId, spreadsheetId, range = 'Sheet1') {
  const params = new URLSearchParams({
    userId,
    spreadsheetId,
    range
  });

  const response = await fetch(
    `http://localhost:3000/api/sheets/read-sheet?${params}`,
    { method: 'GET' }
  );

  return await response.json();
}

// Usage - Read entire sheet
const data = await readSheet(
  'user-123',
  '1BxiMVs0XRA5nFMKUVfIrWNw',
  'Sheet1'
);

console.log(`Read ${data.rowCount} rows and ${data.columnCount} columns`);
console.log(data.values);

// Usage - Read specific range
const rangeData = await readSheet(
  'user-123',
  '1BxiMVs0XRA5nFMKUVfIrWNw',
  'Sheet1!A1:C10'
);

// Process data
rangeData.values.forEach((row, index) => {
  console.log(`Row ${index + 1}:`, row);
});
```

### Write Sheet

**cURL:**
```bash
# Write simple data
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

# Append data to existing sheet
curl -X POST http://localhost:3000/api/sheets/write-sheet \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIrWNw",
    "range": "Sheet1!A4",
    "values": [
      ["Bob Johnson", "bob@example.com", "555-9999"]
    ]
  }'
```

**JavaScript:**
```javascript
async function writeSheet(userId, spreadsheetId, range, values) {
  const response = await fetch('http://localhost:3000/api/sheets/write-sheet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      spreadsheetId,
      range,
      values
    })
  });

  return await response.json();
}

// Usage - Write data
const result = await writeSheet(
  'user-123',
  '1BxiMVs0XRA5nFMKUVfIrWNw',
  'Sheet1!A1',
  [
    ['Name', 'Email', 'Phone'],
    ['John Doe', 'john@example.com', '555-1234'],
    ['Jane Smith', 'jane@example.com', '555-5678']
  ]
);

console.log(`Updated ${result.updatedCells} cells`);

// Usage - Append data
const appendResult = await writeSheet(
  'user-123',
  '1BxiMVs0XRA5nFMKUVfIrWNw',
  'Sheet1!A4',
  [['Bob Johnson', 'bob@example.com', '555-9999']]
);

console.log(`Appended ${appendResult.updatedRows} rows`);
```

---

## Google Drive

### Upload File

**cURL:**
```bash
curl -X POST http://localhost:3000/api/drive/upload-file \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "filePath": "/path/to/document.pdf",
    "fileName": "my-document.pdf",
    "mimeType": "application/pdf"
  }'
```

**JavaScript:**
```javascript
async function uploadFile(userId, filePath, fileName, mimeType) {
  const response = await fetch('http://localhost:3000/api/drive/upload-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      filePath,
      fileName,
      mimeType
    })
  });

  return await response.json();
}

// Usage - Upload PDF
const result = await uploadFile(
  'user-123',
  '/path/to/document.pdf',
  'my-document.pdf',
  'application/pdf'
);

console.log('File ID:', result.file.id);
console.log('View URL:', result.file.webViewLink);

// Usage - Upload image
const imageResult = await uploadFile(
  'user-123',
  '/path/to/photo.jpg',
  'my-photo.jpg',
  'image/jpeg'
);

console.log('Image uploaded:', imageResult.file.name);
```

### Download File

**cURL:**
```bash
# Download and save to local path
curl "http://localhost:3000/api/drive/download-file?userId=user-123&fileId=1A2B3C4D5E6F7G8H9I0J&outputPath=/path/to/save/file.pdf"

# Stream file to stdout
curl "http://localhost:3000/api/drive/download-file?userId=user-123&fileId=1A2B3C4D5E6F7G8H9I0J" > downloaded-file.pdf
```

**JavaScript:**
```javascript
async function downloadFile(userId, fileId, outputPath = null) {
  const params = new URLSearchParams({
    userId,
    fileId,
    ...(outputPath && { outputPath })
  });

  const response = await fetch(
    `http://localhost:3000/api/drive/download-file?${params}`,
    { method: 'GET' }
  );

  if (outputPath) {
    // File saved to disk, return metadata
    return await response.json();
  } else {
    // Stream file
    return response.blob();
  }
}

// Usage - Download and save
const result = await downloadFile(
  'user-123',
  '1A2B3C4D5E6F7G8H9I0J',
  '/path/to/save/file.pdf'
);

console.log('Downloaded to:', result.file.savedTo);

// Usage - Stream file
const blob = await downloadFile('user-123', '1A2B3C4D5E6F7G8H9I0J');
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'file.pdf';
a.click();
```

---

## Complete Example: Multi-Service Workflow

**JavaScript:**
```javascript
class GoogleServicesClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.userId = localStorage.getItem('userId');
  }

  async startAuth(clientId, redirectUri, scopes) {
    const response = await fetch(`${this.baseUrl}/api/auth/start-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, redirectUri, scopes })
    });
    return await response.json();
  }

  async exchangeCode(code, clientId, clientSecret, redirectUri) {
    const response = await fetch(`${this.baseUrl}/api/auth/oauth-callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, clientId, clientSecret, redirectUri })
    });
    const data = await response.json();
    if (data.success) {
      this.userId = data.userId;
      localStorage.setItem('userId', data.userId);
    }
    return data;
  }

  async sendEmail(to, subject, message) {
    const response = await fetch(`${this.baseUrl}/api/gmail/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.userId,
        to,
        subject,
        htmlBody: `<p>${message}</p>`,
        textBody: message
      })
    });
    return await response.json();
  }

  async listEmails(query = '', maxResults = 10) {
    const params = new URLSearchParams({ userId: this.userId, query, maxResults });
    const response = await fetch(
      `${this.baseUrl}/api/gmail/list-emails?${params}`,
      { method: 'GET' }
    );
    return await response.json();
  }

  async readSheet(spreadsheetId, range = 'Sheet1') {
    const params = new URLSearchParams({ userId: this.userId, spreadsheetId, range });
    const response = await fetch(
      `${this.baseUrl}/api/sheets/read-sheet?${params}`,
      { method: 'GET' }
    );
    return await response.json();
  }

  async writeSheet(spreadsheetId, range, values) {
    const response = await fetch(`${this.baseUrl}/api/sheets/write-sheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: this.userId, spreadsheetId, range, values })
    });
    return await response.json();
  }

  async uploadFile(filePath, fileName, mimeType) {
    const response = await fetch(`${this.baseUrl}/api/drive/upload-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: this.userId, filePath, fileName, mimeType })
    });
    return await response.json();
  }

  async downloadFile(fileId, outputPath = null) {
    const params = new URLSearchParams({ userId: this.userId, fileId, outputPath });
    const response = await fetch(
      `${this.baseUrl}/api/drive/download-file?${params}`,
      { method: 'GET' }
    );
    return outputPath ? await response.json() : response.blob();
  }
}

// Usage
const client = new GoogleServicesClient();

// 1. Send email
await client.sendEmail('user@example.com', 'Hello', 'This is a test');

// 2. Read spreadsheet
const sheetData = await client.readSheet('1BxiMVs0XRA5nFMKUVfIrWNw');
console.log(sheetData.values);

// 3. Update spreadsheet
await client.writeSheet('1BxiMVs0XRA5nFMKUVfIrWNw', 'Sheet1!A1', [
  ['Name', 'Email'],
  ['John', 'john@example.com']
]);

// 4. Upload file
const uploadResult = await client.uploadFile('/path/to/file.pdf', 'document.pdf', 'application/pdf');
console.log('Uploaded:', uploadResult.file.webViewLink);
```

---

## Error Handling

All examples should include error handling:

```javascript
async function safeApiCall(fn) {
  try {
    return await fn();
  } catch (error) {
    console.error('API Error:', error.message);
    return { error: error.message };
  }
}

// Usage
const result = await safeApiCall(() => 
  client.sendEmail('user@example.com', 'Test', 'Message')
);

if (result.error) {
  console.error('Failed to send email:', result.error);
} else {
  console.log('Email sent:', result.messageId);
}
```
