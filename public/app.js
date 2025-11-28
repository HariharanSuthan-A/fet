/**
 * Multi-User Google Services Platform - Frontend Application
 */

const API_BASE_URL = 'https://fet-three.vercel.app';

// State management
const state = {
    userId: localStorage.getItem('userId') || null,
    clientId: localStorage.getItem('clientId') || null,
    clientSecret: localStorage.getItem('clientSecret') || null,
    redirectUri: localStorage.getItem('redirectUri') || null,
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    updateUIBasedOnAuthStatus();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Check if we're returning from OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
        handleOAuthCallback(code);
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            navigateToSection(section);
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Auth form
    document.getElementById('authForm').addEventListener('submit', handleAuthSubmit);

    // Gmail forms
    document.getElementById('sendEmailForm').addEventListener('submit', handleSendEmail);
    document.getElementById('listEmailsForm').addEventListener('submit', handleListEmails);

    // Sheets forms
    document.getElementById('readSheetForm').addEventListener('submit', handleReadSheet);
    document.getElementById('writeSheetForm').addEventListener('submit', handleWriteSheet);

    // Drive forms
    document.getElementById('uploadFileForm').addEventListener('submit', handleUploadFile);
    document.getElementById('downloadFileForm').addEventListener('submit', handleDownloadFile);

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            switchTab(tabName, e.currentTarget);
        });
    });
}

/**
 * Navigate to a section
 */
function navigateToSection(section) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update active section
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');

    // Update header
    const titles = {
        auth: { title: 'Authentication', desc: 'Set up your Google OAuth credentials' },
        gmail: { title: 'Gmail', desc: 'Send emails and manage messages' },
        sheets: { title: 'Google Sheets', desc: 'Read and write spreadsheet data' },
        drive: { title: 'Google Drive', desc: 'Upload and download files' },
    };

    const info = titles[section];
    document.getElementById('pageTitle').textContent = info.title;
    document.getElementById('pageDescription').textContent = info.desc;
}

/**
 * Switch between tabs
 */
function switchTab(tabName, button) {
    // Update active tab button
    button.parentElement.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');

    // Update active tab content
    const container = button.parentElement.nextElementSibling;
    if (container) {
        container.parentElement.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }
}

/**
 * Update UI based on authentication status
 */
function updateUIBasedOnAuthStatus() {
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');

    if (state.userId) {
        userInfo.style.display = 'flex';
        logoutBtn.style.display = 'flex';
        document.getElementById('userIdDisplay').textContent = `User: ${state.userId.substring(0, 8)}...`;
    } else {
        userInfo.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

/**
 * Handle OAuth flow
 */
async function handleAuthSubmit(e) {
    e.preventDefault();

    const clientId = document.getElementById('clientId').value;
    const clientSecret = document.getElementById('clientSecret').value;
    const redirectUri = document.getElementById('redirectUri').value;

    // Get selected scopes
    const scopes = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
        .map(input => input.value);

    if (scopes.length === 0) {
        showToast('Please select at least one scope', 'warning');
        return;
    }

    try {
        // Save credentials
        state.clientId = clientId;
        state.clientSecret = clientSecret;
        state.redirectUri = redirectUri;

        localStorage.setItem('clientId', clientId);
        localStorage.setItem('clientSecret', clientSecret);
        localStorage.setItem('redirectUri', redirectUri);

        // Generate auth URL
        const response = await fetch(`${API_BASE_URL}/api/auth/start-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, redirectUri, scopes }),
        });

        const data = await response.json();

        if (data.success) {
            showToast('Redirecting to Google...', 'info');
            // Redirect to Google OAuth
            window.location.href = data.authUrl;
        } else {
            showToast(data.error || 'Failed to generate auth URL', 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

/**
 * Handle OAuth callback
 */
async function handleOAuthCallback(code) {
    if (!state.clientId || !state.clientSecret || !state.redirectUri) {
        showToast('Missing OAuth credentials', 'error');
        return;
    }

    showModal(true);

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/oauth-callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                clientId: state.clientId,
                clientSecret: state.clientSecret,
                redirectUri: state.redirectUri,
            }),
        });

        const data = await response.json();

        if (data.success) {
            state.userId = data.userId;
            localStorage.setItem('userId', data.userId);
            updateUIBasedOnAuthStatus();
            showToast('Successfully authenticated!', 'success');
            showModal(false);
            // Clear URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            showToast(data.error || 'OAuth callback failed', 'error');
            showModal(false);
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        showModal(false);
    }
}

/**
 * Logout
 */
function logout() {
    state.userId = null;
    state.clientId = null;
    state.clientSecret = null;
    state.redirectUri = null;

    localStorage.removeItem('userId');
    localStorage.removeItem('clientId');
    localStorage.removeItem('clientSecret');
    localStorage.removeItem('redirectUri');

    updateUIBasedOnAuthStatus();
    navigateToSection('auth');
    showToast('Logged out successfully', 'success');
}

/**
 * Check if user is authenticated
 */
function checkAuth() {
    if (!state.userId) {
        showToast('Please authenticate first', 'warning');
        navigateToSection('auth');
        return false;
    }
    return true;
}

/* ============================================================================
   Gmail Handlers
   ============================================================================ */

async function handleSendEmail(e) {
    e.preventDefault();

    if (!checkAuth()) return;

    const to = document.getElementById('emailTo').value;
    const cc = document.getElementById('emailCc').value;
    const bcc = document.getElementById('emailBcc').value;
    const subject = document.getElementById('emailSubject').value;
    const htmlBody = document.getElementById('emailBody').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/gmail/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: state.userId,
                to,
                cc: cc || undefined,
                bcc: bcc || undefined,
                subject,
                htmlBody,
            }),
        });

        const data = await response.json();

        if (data.success) {
            showToast('Email sent successfully!', 'success');
            document.getElementById('sendEmailForm').reset();
        } else {
            showToast(data.error || 'Failed to send email', 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

async function handleListEmails(e) {
    e.preventDefault();

    if (!checkAuth()) return;

    const query = document.getElementById('emailQuery').value;
    const maxResults = document.getElementById('emailMaxResults').value;

    try {
        const params = new URLSearchParams({
            userId: state.userId,
            query,
            maxResults,
        });

        const response = await fetch(`${API_BASE_URL}/api/gmail/list-emails?${params}`);
        const data = await response.json();

        if (data.success) {
            displayEmails(data.emails);
            showToast(`Found ${data.count} emails`, 'success');
        } else {
            showToast(data.error || 'Failed to list emails', 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

function displayEmails(emails) {
    const container = document.getElementById('emailsList');
    container.innerHTML = '';

    if (emails.length === 0) {
        container.innerHTML = '<p class="text-muted">No emails found</p>';
        return;
    }

    emails.forEach(email => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-header">
                <div class="list-item-title">${escapeHtml(email.subject)}</div>
                <div class="list-item-meta">${email.date}</div>
            </div>
            <div class="list-item-meta">From: ${escapeHtml(email.from)}</div>
            <div class="list-item-content">${escapeHtml(email.snippet)}</div>
        `;
        container.appendChild(item);
    });
}

/* ============================================================================
   Sheets Handlers
   ============================================================================ */

async function handleReadSheet(e) {
    e.preventDefault();

    if (!checkAuth()) return;

    const spreadsheetId = document.getElementById('sheetId').value;
    const range = document.getElementById('sheetRange').value;

    try {
        const params = new URLSearchParams({
            userId: state.userId,
            spreadsheetId,
            range,
        });

        const response = await fetch(`${API_BASE_URL}/api/sheets/read-sheet?${params}`);
        const data = await response.json();

        if (data.success) {
            displaySheetData(data.values);
            showToast(`Read ${data.rowCount} rows`, 'success');
        } else {
            showToast(data.error || 'Failed to read sheet', 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

function displaySheetData(values) {
    const container = document.getElementById('sheetData');
    container.innerHTML = '';

    if (!values || values.length === 0) {
        container.innerHTML = '<p class="text-muted">No data found</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'table';

    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    (values[0] || []).forEach(cell => {
        const th = document.createElement('th');
        th.textContent = cell || '';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    values.slice(1).forEach(row => {
        const tr = document.createElement('tr');
        (row || []).forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell || '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.appendChild(table);
}

async function handleWriteSheet(e) {
    e.preventDefault();

    if (!checkAuth()) return;

    const spreadsheetId = document.getElementById('writeSheetId').value;
    const range = document.getElementById('writeSheetRange').value;
    const dataStr = document.getElementById('writeSheetData').value;

    try {
        let values = JSON.parse(dataStr);
        if (!Array.isArray(values)) {
            throw new Error('Data must be an array');
        }

        const response = await fetch(`${API_BASE_URL}/api/sheets/write-sheet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: state.userId,
                spreadsheetId,
                range,
                values,
            }),
        });

        const data = await response.json();

        if (data.success) {
            showToast(`Updated ${data.updatedCells} cells`, 'success');
            document.getElementById('writeSheetForm').reset();
        } else {
            showToast(data.error || 'Failed to write to sheet', 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

/* ============================================================================
   Drive Handlers
   ============================================================================ */

async function handleUploadFile(e) {
    e.preventDefault();

    if (!checkAuth()) return;

    const filePath = document.getElementById('uploadFilePath').value;
    const fileName = document.getElementById('uploadFileName').value;
    const mimeType = document.getElementById('uploadMimeType').value;
    const folderId = document.getElementById('uploadFolderId').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/drive/upload-file`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: state.userId,
                filePath,
                fileName: fileName || undefined,
                mimeType,
                folderId: folderId || undefined,
            }),
        });

        const data = await response.json();

        if (data.success) {
            showToast('File uploaded successfully!', 'success');
            document.getElementById('uploadFileForm').reset();
            // Show file link
            const link = document.createElement('a');
            link.href = data.file.webViewLink;
            link.target = '_blank';
            link.textContent = 'View on Drive';
            console.log('File uploaded:', data.file);
        } else {
            showToast(data.error || 'Failed to upload file', 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

async function handleDownloadFile(e) {
    e.preventDefault();

    if (!checkAuth()) return;

    const fileId = document.getElementById('downloadFileId').value;
    const outputPath = document.getElementById('downloadOutputPath').value;

    try {
        const params = new URLSearchParams({
            userId: state.userId,
            fileId,
            outputPath: outputPath || undefined,
        });

        const response = await fetch(`${API_BASE_URL}/api/drive/download-file?${params}`);
        const data = await response.json();

        if (data.success) {
            showToast('File downloaded successfully!', 'success');
            document.getElementById('downloadFileForm').reset();
        } else {
            showToast(data.error || 'Failed to download file', 'error');
        }
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
    }
}

/* ============================================================================
   Utility Functions
   ============================================================================ */

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

/**
 * Show/hide modal
 */
function showModal(show) {
    const modal = document.getElementById('oauthModal');
    modal.style.display = show ? 'flex' : 'none';
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
