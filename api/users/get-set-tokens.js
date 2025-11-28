/**
 * User token storage layer
 * This is an in-memory implementation for development
 * For production, replace with MongoDB, PostgreSQL, or other persistent storage
 */

// In-memory storage (development only)
const userTokensStore = new Map();

/**
 * Save tokens for a user
 * @param {string} userId - Unique user identifier
 * @param {Object} credentials - User credentials object
 * @param {string} credentials.clientId - Google OAuth Client ID
 * @param {string} credentials.clientSecret - Google OAuth Client Secret
 * @param {string} credentials.redirectUri - OAuth redirect URI
 * @param {Object} credentials.tokens - Access/refresh tokens
 * @returns {Promise<void>}
 */
export async function saveTokensForUser(userId, credentials) {
  if (!userId || !credentials) {
    throw new Error('userId and credentials are required');
  }

  userTokensStore.set(userId, {
    ...credentials,
    savedAt: new Date().toISOString()
  });

  console.log(`[TokenStore] Saved tokens for user: ${userId}`);
}

/**
 * Get tokens for a user
 * @param {string} userId - Unique user identifier
 * @returns {Promise<Object|null>} User credentials or null if not found
 */
export async function getUserTokens(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }

  const credentials = userTokensStore.get(userId);
  if (!credentials) {
    console.log(`[TokenStore] No tokens found for user: ${userId}`);
    return null;
  }

  return credentials;
}

/**
 * Update tokens for a user (e.g., after refresh)
 * @param {string} userId - Unique user identifier
 * @param {Object} newTokens - Updated tokens object
 * @returns {Promise<void>}
 */
export async function updateTokensForUser(userId, newTokens) {
  if (!userId || !newTokens) {
    throw new Error('userId and newTokens are required');
  }

  const existing = userTokensStore.get(userId);
  if (!existing) {
    throw new Error(`No credentials found for user: ${userId}`);
  }

  userTokensStore.set(userId, {
    ...existing,
    tokens: newTokens,
    updatedAt: new Date().toISOString()
  });

  console.log(`[TokenStore] Updated tokens for user: ${userId}`);
}

/**
 * Delete tokens for a user (logout)
 * @param {string} userId - Unique user identifier
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteTokensForUser(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }

  const deleted = userTokensStore.delete(userId);
  if (deleted) {
    console.log(`[TokenStore] Deleted tokens for user: ${userId}`);
  }
  return deleted;
}

/**
 * Get all users (for admin purposes)
 * @returns {Promise<Array>} Array of user IDs
 */
export async function getAllUsers() {
  return Array.from(userTokensStore.keys());
}

/**
 * Clear all tokens (development/testing only)
 * @returns {Promise<void>}
 */
export async function clearAllTokens() {
  userTokensStore.clear();
  console.log('[TokenStore] Cleared all tokens');
}
