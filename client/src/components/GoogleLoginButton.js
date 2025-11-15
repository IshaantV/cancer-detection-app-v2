import React from 'react';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ onSuccess, onError, disabled }) => {
  // This hook will only work if GoogleOAuthProvider is in the component tree
  // It's safe to call because this component is only rendered when hasGoogleOAuth is true
  // and the provider is in the tree
  const handleGoogleLogin = useGoogleLogin({
    onSuccess,
    onError,
    disabled
  });

  return (
    <motion.button
      onClick={handleGoogleLogin}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="oauth-button google-button"
      disabled={disabled}
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.965-2.184l-2.908-2.258c-.806.54-1.837.86-3.057.86-2.35 0-4.34-1.587-5.053-3.72H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
        <path fill="#FBBC05" d="M3.947 10.698c-.18-.54-.282-1.117-.282-1.698s.102-1.158.282-1.698V4.97H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.03l2.99-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.97L3.947 7.302C4.66 5.167 6.65 3.58 9 3.58z"/>
      </svg>
      Continue with Google
    </motion.button>
  );
};

export default GoogleLoginButton;

