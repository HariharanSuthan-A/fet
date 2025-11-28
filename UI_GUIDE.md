# UI Guide - Multi-User Google Services Platform

## Overview

A modern, responsive web interface for the Multi-User Google Services Platform. Built with vanilla HTML, CSS, and JavaScript.

## Features

✅ **Modern Design** - Clean, professional interface
✅ **Responsive** - Works on desktop, tablet, and mobile
✅ **Dark Sidebar** - Easy navigation
✅ **Real-time Feedback** - Toast notifications
✅ **Tab-based Interface** - Organized sections
✅ **Form Validation** - Client-side validation
✅ **OAuth Integration** - Seamless Google authentication
✅ **Data Display** - Tables and lists for results

## File Structure

```
public/
├── index.html       # Main HTML file
├── styles.css       # All styling
├── app.js          # Frontend application logic
└── README.md       # This guide
```

## Getting Started

### 1. Start the Server

```bash
npm run dev
```

### 2. Open in Browser

Navigate to: `http://localhost:3000`

You should see the Multi-User Google Services Platform UI.

## UI Sections

### 1. Authentication

**Purpose**: Set up Google OAuth credentials

**Steps**:
1. Enter your Client ID from Google Cloud Console
2. Enter your Client Secret
3. Verify the Redirect URI matches your Google settings
4. Select the scopes you need (Gmail, Sheets, Drive)
5. Click "Start OAuth Flow"
6. You'll be redirected to Google to authorize
7. After authorization, you'll be redirected back

**Features**:
- Secure credential input
- Scope selection
- Step-by-step instructions

### 2. Gmail

**Purpose**: Send and manage emails

#### Send Email Tab
- **To**: Recipient email address
- **CC/BCC**: Optional recipients
- **Subject**: Email subject
- **Message**: Email body (supports HTML)
- **Send Button**: Send the email

#### List Emails Tab
- **Search Query**: Optional Gmail search query
  - Examples: `from:sender@example.com`, `is:unread`, `has:attachment`
- **Max Results**: Number of emails to retrieve (1-100)
- **Search Button**: Fetch emails
- **Results**: Display emails with sender, subject, date, and snippet

### 3. Google Sheets

**Purpose**: Read and write spreadsheet data

#### Read Sheet Tab
- **Spreadsheet ID**: Google Sheet ID
- **Range**: Cell range (e.g., `Sheet1!A1:Z100`)
- **Read Button**: Fetch data
- **Results**: Display data in a table

#### Write Sheet Tab
- **Spreadsheet ID**: Google Sheet ID
- **Range**: Starting cell (e.g., `Sheet1!A1`)
- **Data**: JSON array format
  - Example: `[["Name", "Email"], ["John", "john@example.com"]]`
- **Write Button**: Update the sheet
- **Results**: Show number of updated cells

### 4. Google Drive

**Purpose**: Upload and download files

#### Upload File Tab
- **File Path**: Local file path on server
- **File Name**: Optional custom name
- **MIME Type**: File type selector
- **Folder ID**: Optional Drive folder
- **Upload Button**: Upload file
- **Results**: Show file link and metadata

#### Download File Tab
- **File ID**: Google Drive file ID
- **Output Path**: Optional local save path
- **Download Button**: Download file
- **Results**: Confirmation and file details

## Navigation

### Sidebar Menu
- **Authentication** - OAuth setup
- **Gmail** - Email management
- **Sheets** - Spreadsheet operations
- **Drive** - File management

### User Status
- Shows connected user ID when authenticated
- "Connected" badge indicates active session
- Logout button to clear session

## Notifications

### Toast Messages

**Success** (Green):
- Email sent successfully
- File uploaded successfully
- Data updated successfully

**Error** (Red):
- Missing authentication
- API errors
- Validation errors

**Warning** (Orange):
- Please authenticate first
- Missing required fields

**Info** (Blue):
- Redirecting to Google
- Processing requests

## Data Display

### Email List
- **From**: Sender email address
- **Subject**: Email subject
- **Date**: Email date
- **Snippet**: Email preview text

### Spreadsheet Table
- Formatted as HTML table
- Sortable columns
- Scrollable for large datasets

### File Information
- **File ID**: Google Drive ID
- **Name**: File name
- **MIME Type**: File type
- **Web Link**: Clickable link to view on Drive

## Form Features

### Input Validation
- Required fields marked with asterisk (*)
- Real-time validation feedback
- Error messages for invalid input

### Helpful Hints
- Placeholder text shows expected format
- Small text provides additional guidance
- Examples in descriptions

### Form Groups
- Organized by logical sections
- Clear labels and descriptions
- Consistent styling

## Responsive Design

### Desktop (1024px+)
- Full sidebar navigation
- Multi-column layouts
- Optimized spacing

### Tablet (768px - 1023px)
- Adjusted sidebar
- Single column forms
- Touch-friendly buttons

### Mobile (< 768px)
- Horizontal sidebar
- Full-width forms
- Stacked layouts
- Optimized touch targets

## Keyboard Shortcuts

- **Tab**: Navigate between form fields
- **Enter**: Submit forms
- **Escape**: Close modals (future feature)

## Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Color contrast compliant
- Keyboard navigable
- Screen reader friendly

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Local Storage

The UI stores the following in browser localStorage:
- `userId` - Current user ID
- `clientId` - Google OAuth Client ID
- `clientSecret` - Google OAuth Client Secret
- `redirectUri` - OAuth redirect URI

**Note**: Credentials are stored locally for convenience. In production, use secure session management.

## API Integration

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

### Request Format
All requests use JSON with proper headers:
```javascript
{
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}
```

### Error Handling
- Network errors show toast notifications
- API errors display error messages
- Form validation prevents invalid requests

## Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #4F46E5;
    --secondary: #10B981;
    --danger: #EF4444;
    /* ... more colors ... */
}
```

### Styling
- All styles in `styles.css`
- Organized by section
- CSS variables for consistency
- Responsive breakpoints at bottom

### Functionality
- All logic in `app.js`
- Event listeners for user interactions
- State management for user data
- API communication functions

## Common Tasks

### Send an Email
1. Navigate to Gmail section
2. Click "Send Email" tab
3. Fill in recipient, subject, message
4. Click "Send Email"
5. See success notification

### Read a Spreadsheet
1. Navigate to Sheets section
2. Click "Read Sheet" tab
3. Enter Spreadsheet ID and range
4. Click "Read Sheet"
5. View data in table

### Upload a File
1. Navigate to Drive section
2. Click "Upload File" tab
3. Enter file path and MIME type
4. Click "Upload File"
5. See success notification with Drive link

### Search Emails
1. Navigate to Gmail section
2. Click "List Emails" tab
3. Enter search query (optional)
4. Click "Search Emails"
5. View email list

## Troubleshooting

### "User not authorized"
- Complete OAuth flow first
- Check if userId is saved in localStorage
- Try logging out and back in

### "Failed to send email"
- Check recipient email format
- Ensure Gmail scope is selected
- Check API credentials

### "Cannot read spreadsheet"
- Verify Spreadsheet ID is correct
- Check range format (e.g., `Sheet1!A1:Z100`)
- Ensure Sheets scope is selected

### "File upload failed"
- Check file path is correct
- Verify file exists on server
- Check MIME type is appropriate

### UI not loading
- Check server is running (`npm run dev`)
- Clear browser cache
- Check browser console for errors
- Verify port 3000 is accessible

## Performance Tips

- Use specific ranges when reading sheets (not entire sheet)
- Limit email results to necessary amount
- Compress files before uploading
- Use appropriate MIME types

## Security Notes

- Credentials stored in localStorage (development only)
- Use secure session management in production
- Never expose Client Secret in frontend code
- Always use HTTPS in production
- Implement CSRF protection

## Future Enhancements

- Dark mode toggle
- Batch operations
- File preview
- Email templates
- Spreadsheet charts
- Advanced search filters
- Export functionality
- Multi-user support UI

## Support

For issues or questions:
1. Check the main README.md
2. Review API_REFERENCE.md
3. Check browser console for errors
4. Verify API is running and accessible

## License

MIT
