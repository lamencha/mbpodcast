import { useEffect, useState } from 'react';
import { authService } from '../services/authService';

interface AuthCallbackProps {
  onAuthComplete: (success: boolean) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthComplete }) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authentication parameters');
        }

        setMessage('Exchanging authorization code...');
        const success = await authService.handleCallback(code, state);

        if (success) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Clean up URL and redirect
          setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
            onAuthComplete(true);
          }, 2000);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
        
        setTimeout(() => {
          onAuthComplete(false);
        }, 3000);
      }
    };

    handleAuth();
  }, [onAuthComplete]);

  return (
    <div className="auth-callback">
      <div className="auth-status">
        <div className="auth-icon">
          {status === 'processing' && <div className="spinner"></div>}
          {status === 'success' && <div className="success-icon">✓</div>}
          {status === 'error' && <div className="error-icon">✗</div>}
        </div>
        <div className="auth-message">{message}</div>
      </div>
    </div>
  );
};

export default AuthCallback;