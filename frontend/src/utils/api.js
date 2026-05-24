const API_BASE = 'http://localhost:5000/api';

/**
 * Get the stored access token.
 */
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

/**
 * Store the access token.
 */
export function setAccessToken(token) {
  localStorage.setItem('accessToken', token);
}

/**
 * Store user data.
 */
export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Get stored user data.
 */
export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Clear all auth data (logout).
 */
export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

/**
 * Make an authenticated API request.
 * Automatically retries with a refreshed token on 403.
 */
export async function authFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // send cookies
  });

  // If access token expired, try refreshing
  if (response.status === 403) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      response = await fetch(url, { ...options, headers, credentials: 'include' });
    }
  }

  return response;
}

/**
 * Attempt to refresh the access token using the refresh cookie.
 */
async function refreshAccessToken() {
  try {
    // Determine user type from stored user
    const user = getUser();
    const type = user?.type || 'citizen';

    const response = await fetch(`${API_BASE}/${type}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
