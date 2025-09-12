import Cookies from 'js-cookie';

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
}

class AuthService {
  private readonly CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  private readonly ADMIN_USERNAME = import.meta.env.VITE_ADMIN_GITHUB_USERNAME;
  private readonly TOKEN_COOKIE = 'github_token';
  private readonly USER_COOKIE = 'github_user';

  constructor() {
    // Validate environment variables
    if (!this.CLIENT_ID) {
      console.warn('VITE_GITHUB_CLIENT_ID not configured');
    }
    if (!this.ADMIN_USERNAME) {
      console.warn('VITE_ADMIN_GITHUB_USERNAME not configured');
    }
  }

  /**
   * Initiate GitHub OAuth flow
   */
  initiateAuth(): void {
    const state = this.generateState();
    Cookies.set('oauth_state', state, { expires: 1/24 }); // 1 hour

    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      scope: 'repo user:email',
      state,
      allow_signup: 'false'
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string, state: string): Promise<boolean> {
    try {
      // Verify state parameter
      const savedState = Cookies.get('oauth_state');
      if (!savedState || savedState !== state) {
        throw new Error('Invalid state parameter');
      }
      Cookies.remove('oauth_state');

      // Exchange code for token using Vercel serverless function
      const response = await fetch('/api/auth/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const { access_token } = await response.json();

      // Get user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const user: GitHubUser = await userResponse.json();

      // Check if user is admin
      if (user.login !== this.ADMIN_USERNAME) {
        throw new Error('Access denied: Not authorized admin user');
      }

      // Store authentication data
      Cookies.set(this.TOKEN_COOKIE, access_token, { 
        expires: 7, // 7 days
        secure: true,
        sameSite: 'strict'
      });
      Cookies.set(this.USER_COOKIE, JSON.stringify(user), { 
        expires: 7,
        secure: true,
        sameSite: 'strict'
      });

      return true;
    } catch (error) {
      console.error('Auth callback error:', error);
      return false;
    }
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    const token = Cookies.get(this.TOKEN_COOKIE);
    const userCookie = Cookies.get(this.USER_COOKIE);
    
    if (!token || !userCookie) {
      return {
        isAuthenticated: false,
        user: null,
        token: null
      };
    }

    try {
      const user = JSON.parse(userCookie) as GitHubUser;
      return {
        isAuthenticated: true,
        user,
        token
      };
    } catch {
      // Invalid user data, clear cookies
      this.logout();
      return {
        isAuthenticated: false,
        user: null,
        token: null
      };
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    Cookies.remove(this.TOKEN_COOKIE);
    Cookies.remove(this.USER_COOKIE);
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const { isAuthenticated, user } = this.getAuthState();
    return isAuthenticated && user?.login === this.ADMIN_USERNAME;
  }

  /**
   * Get authorization headers for GitHub API
   */
  getAuthHeaders(): Record<string, string> {
    const { token } = this.getAuthState();
    if (!token) {
      throw new Error('Not authenticated');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  /**
   * Generate random state for OAuth security
   */
  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

export const authService = new AuthService();
export type { GitHubUser, AuthState };