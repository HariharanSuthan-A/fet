# UI Quick Start

Get the Multi-User Google Services Platform UI running in 2 minutes.

## Prerequisites

- Backend server running (`npm run dev`)
- Modern web browser

## Step 1: Start the Server

```bash
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║  Multi-User Google Services Platform                       ║
║  Server running on http://localhost:3000                   ║
║  API Documentation: http://localhost:3000/api/docs         ║
║  Health Check: http://localhost:3000/health                ║
╚════════════════════════════════════════════════════════════╝
```

## Step 2: Open in Browser

Navigate to: **http://localhost:3000**

You should see the Multi-User Google Services Platform UI with:
- Dark sidebar on the left
- Main content area
- Authentication form

## Step 3: Set Up Google OAuth

### Get Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Gmail API
   - Google Sheets API
   - Google Drive API
4. Create OAuth 2.0 credentials (Web application)
5. Add redirect URI: `http://localhost:3000/callback`
6. Copy your Client ID and Client Secret

### Enter Credentials in UI

1. In the Authentication section, enter:
   - **Client ID**: Your Client ID
   - **Client Secret**: Your Client Secret
   - **Redirect URI**: `http://localhost:3000/callback`
2. Select scopes (all checked by default)
3. Click "Start OAuth Flow"

### Complete OAuth

1. You'll be redirected to Google
2. Click "Allow" to authorize
3. You'll be redirected back to the UI
4. See "Successfully authenticated!" message

## Step 4: Use the Platform

### Send an Email

1. Click **Gmail** in sidebar
2. Click **Send Email** tab
3. Fill in:
   - **To**: recipient@example.com
   - **Subject**: Test Email
   - **Message**: Hello, this is a test!
4. Click **Send Email**
5. See success notification

### Read a Spreadsheet

1. Click **Sheets** in sidebar
2. Click **Read Sheet** tab
3. Enter:
   - **Spreadsheet ID**: Your Google Sheet ID
   - **Range**: Sheet1 (or specific range)
4. Click **Read Sheet**
5. See data in table

### Upload a File

1. Click **Drive** in sidebar
2. Click **Upload File** tab
3. Enter:
   - **File Path**: /path/to/file.pdf
   - **MIME Type**: application/pdf
4. Click **Upload File**
5. See success notification with Drive link

### List Emails

1. Click **Gmail** in sidebar
2. Click **List Emails** tab
3. Optionally enter search query:
   - `is:unread` - Unread emails
   - `from:sender@example.com` - From specific sender
   - `has:attachment` - With attachments
4. Click **Search Emails**
5. See email list

## UI Sections

### Sidebar Navigation
- **Authentication** - OAuth setup
- **Gmail** - Send/list emails
- **Sheets** - Read/write spreadsheets
- **Drive** - Upload/download files
- **Logout** - Clear session

### Main Content
- Form inputs for each operation
- Real-time validation
- Results display (tables, lists)
- Toast notifications for feedback

### Header
- Current section title
- User status (when authenticated)
- Connected badge

## Features

✅ **Modern Design** - Clean, professional interface
✅ **Responsive** - Works on all devices
✅ **Real-time Feedback** - Toast notifications
✅ **Form Validation** - Client-side checks
✅ **Data Display** - Tables and lists
✅ **OAuth Integration** - Seamless Google auth
✅ **Local Storage** - Remember credentials

## Keyboard Shortcuts

- **Tab** - Navigate between fields
- **Enter** - Submit forms
- **Click** - Navigate sections

## Troubleshooting

### UI not loading
- Check server is running
- Clear browser cache
- Try different browser
- Check console for errors

### "User not authorized"
- Complete OAuth flow first
- Check if authenticated (see header)
- Try logging out and back in

### API errors
- Check server is running
- Verify credentials are correct
- Check browser console for details

### Credentials not saving
- Check browser localStorage is enabled
- Try clearing cache and reloading
- Check browser console for errors

## Tips

- Use specific ranges when reading sheets
- Limit email results to necessary amount
- Check browser console for detailed error messages
- Credentials are stored locally for convenience

## Next Steps

1. ✅ Start server
2. ✅ Open UI in browser
3. ✅ Set up Google OAuth
4. ✅ Test each section
5. Read [UI_GUIDE.md](UI_GUIDE.md) for detailed documentation
6. Customize as needed

## Support

- **UI Guide**: [UI_GUIDE.md](UI_GUIDE.md)
- **API Reference**: [API_REFERENCE.md](API_REFERENCE.md)
- **Full Documentation**: [README.md](README.md)

---

**Status**: ✅ UI Ready to Use

Open http://localhost:3000 in your browser to get started!
