import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export const GoogleAuthButton = ({ onSuccess, onError, isLoading }) => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    return (
      <div style={{
        padding: '1rem',
        borderRadius: '10px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: '#fca5a5',
        fontSize: '0.875rem',
        textAlign: 'center',
      }}>
        ⚙️ Google OAuth not configured. Set REACT_APP_GOOGLE_CLIENT_ID in .env
      </div>
    );
  }

  const handleSuccess = (credentialResponse) => {
    if (onSuccess) {
      onSuccess(credentialResponse.credential);
    }
  };

  const handleError = () => {
    if (onError) {
      onError('Google login failed');
    }
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '1rem 0',
      }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          text="signin"
          theme="dark"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthButton;
