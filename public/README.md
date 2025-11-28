# Public Folder - Frontend UI

This folder contains the web UI for the Multi-User Google Services Platform.

## Files

- **index.html** - Main HTML file (500+ lines)
- **styles.css** - Complete styling (800+ lines)
- **app.js** - Frontend application logic (600+ lines)

## Quick Start

1. Start the backend server:
```bash
npm run dev
```

2. Open in browser:
```
http://localhost:3000
```

3. Set up Google OAuth credentials
4. Start using the platform!

## Features

✅ Modern, responsive UI
✅ OAuth 2.0 integration
✅ Gmail, Sheets, Drive support
✅ Real-time notifications
✅ Form validation
✅ Data display (tables, lists)
✅ Mobile-friendly

## Sections

### Authentication
- OAuth credential setup
- Scope selection
- Seamless Google redirect

### Gmail
- Send emails with HTML support
- List and search emails
- Email preview

### Google Sheets
- Read spreadsheet data
- Write/update data
- Table display

### Google Drive
- Upload files
- Download files
- File metadata

## Documentation

- **UI_GUIDE.md** - Comprehensive UI documentation
- **UI_QUICKSTART.md** - Quick start guide
- **UI_SUMMARY.md** - UI overview

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Local Storage

The UI stores credentials in browser localStorage:
- `userId` - Current user ID
- `clientId` - OAuth Client ID
- `clientSecret` - OAuth Client Secret
- `redirectUri` - OAuth Redirect URI

**Note**: For production, use secure session management.

## API Integration

The UI communicates with the backend API at:
```
http://localhost:3000/api/
```

All requests use JSON format with proper headers.

## Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #4F46E5;
    --secondary: #10B981;
    /* ... more colors ... */
}
```

### Styling
- All styles in `styles.css`
- Organized by section
- Responsive breakpoints

### Functionality
- All logic in `app.js`
- Event listeners for interactions
- State management
- API communication

## Performance

- No external dependencies
- Optimized CSS
- Minimal JavaScript
- Fast load time

## Accessibility

- Semantic HTML
- Keyboard navigation
- Screen reader friendly
- WCAG compliant

## Security

### Development
- Credentials in localStorage (for testing)

### Production
- Use secure session management
- Implement CSRF protection
- Use HTTPS only
- Never expose secrets

## Troubleshooting

### UI not loading
- Check server is running
- Clear browser cache
- Check console for errors

### API errors
- Verify server is running
- Check credentials
- Review browser console

### Credentials not saving
- Enable localStorage
- Clear cache and reload
- Check console

## Support

- **UI_GUIDE.md** - Detailed documentation
- **UI_QUICKSTART.md** - Quick start
- **README.md** - Full project docs

## License

MIT

---

**Status**: ✅ Ready to Use

Open http://localhost:3000 to get started!
