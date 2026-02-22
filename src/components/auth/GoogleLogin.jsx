import React from 'react';
import { motion } from 'framer-motion';

const GoogleLogin = () => {
  const handleGoogleLogin = async () => {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'dark',
            size: 'large',
            width: '100%',
          }
        );
      }
    } catch (error) {
      console.error("Error al abrir Google:", error);
    }
  };

  React.useEffect(() => {
    handleGoogleLogin();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      <div id="google-signin-button" className="w-full flex justify-center"></div>
    </motion.div>
  );
};

export default GoogleLogin;