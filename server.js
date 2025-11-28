import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import route handlers
import startAuthHandler from './api/auth/start-auth.js';
import oauthCallbackHandler from './api/auth/oauth-callback.js';
import sendEmailHandler from './api/gmail/send-email.js';
import listEmailsHandler from './api/gmail/list-emails.js';
import readSheetHandler from './api/sheets/read-sheet.js';
import writeSheetHandler from './api/sheets/write-sheet.js';
import uploadFileHandler from './api/drive/upload-file.js';
import downloadFileHandler from './api/drive/download-file.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes - Auth
app.post('/api/auth/start-auth', startAuthHandler);
app.post('/api/auth/oauth-callback', oauthCallbackHandler);

// API Routes - Gmail
app.post('/api/gmail/send-email', sendEmailHandler);
app.get('/api/gmail/list-emails', listEmailsHandler);

// API Routes - Sheets
app.get('/api/sheets/read-sheet', readSheetHandler);
app.post('/api/sheets/write-sheet', writeSheetHandler);

// API Routes - Drive
app.post('/api/drive/upload-file', uploadFileHandler);
app.get('/api/drive/download-file', downloadFileHandler);

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Multi-User Google Services Platform API',
    version: '1.0.0',
    baseUrl: `http://localhost:${PORT}`,
    endpoints: {
      auth: {
        'POST /api/auth/start-auth': 'Generate OAuth consent URL',
        'POST /api/auth/oauth-callback': 'Exchange code for tokens'
      },
      gmail: {
        'POST /api/gmail/send-email': 'Send email on behalf of user',
        'GET /api/gmail/list-emails': 'List emails for user'
      },
      sheets: {
        'GET /api/sheets/read-sheet': 'Read data from Google Sheet',
        'POST /api/sheets/write-sheet': 'Write data to Google Sheet'
      },
      drive: {
        'POST /api/drive/upload-file': 'Upload file to Google Drive',
        'GET /api/drive/download-file': 'Download file from Google Drive'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    availableEndpoints: '/api/docs'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Multi-User Google Services Platform                       ║
║  Server running on http://localhost:${PORT}                    ║
║  API Documentation: http://localhost:${PORT}/api/docs         ║
║  Health Check: http://localhost:${PORT}/health                ║
╚════════════════════════════════════════════════════════════╝
  `);
});
