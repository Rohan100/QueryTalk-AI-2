/**
 * Clerk appearance configuration that matches the QueryTalk AI dark theme.
 * Colors sourced from tailwind.config.js design tokens.
 */
export const clerkAppearance = {
  variables: {
    // Core colors from the app's design system
    colorPrimary: '#adc6ff',
    colorBackground: '#0c1324',
    colorInputBackground: '#070d1f',
    colorInputText: '#dce1fb',
    colorText: '#dce1fb',
    colorTextSecondary: '#c2c6d6',
    colorDanger: '#ffb4ab',
    colorSuccess: '#89ceff',
    colorNeutral: '#8c909f',
    colorShimmer: 'rgba(173, 198, 255, 0.05)',

    // Typography
    fontFamily: "'Geist', sans-serif",
    fontFamilyButtons: "'Geist', sans-serif",
    fontSize: '14px',
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },

    // Border radius
    borderRadius: '0.5rem',

    // Spacing
    spacingUnit: '4px',
  },

  elements: {
    // Root card container — glassmorphism
    card: {
      background: 'rgba(21, 27, 45, 0.5)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(173, 198, 255, 0.04)',
      borderRadius: '1rem',
    },

    // Page/root background
    rootBox: {
      width: '100%',
    },

    // Header title
    headerTitle: {
      color: '#adc6ff',
      fontSize: '22px',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },

    headerSubtitle: {
      color: '#8c909f',
      fontSize: '13px',
    },

    // Form field labels
    formFieldLabel: {
      color: '#c2c6d6',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontFamily: "'JetBrains Mono', monospace",
    },

    // Form field inputs
    formFieldInput: {
      background: 'rgba(0, 0, 0, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#dce1fb',
      borderRadius: '0.5rem',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      '&:focus': {
        borderColor: 'rgba(173, 198, 255, 0.5)',
        boxShadow: '0 0 0 2px rgba(173, 198, 255, 0.15)',
        outline: 'none',
      },
    },

    // Primary action button (Sign In / Continue)
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #adc6ff 0%, #4d8eff 100%)',
      color: '#002e6a',
      fontWeight: '600',
      fontSize: '14px',
      borderRadius: '0.5rem',
      border: 'none',
      transition: 'all 0.2s ease',
      boxShadow: '0 0 20px rgba(173, 198, 255, 0.2)',
      '&:hover': {
        opacity: '0.9',
        boxShadow: '0 0 28px rgba(173, 198, 255, 0.35)',
        transform: 'translateY(-1px)',
      },
      '&:active': {
        transform: 'scale(0.98)',
      },
    },

    // Social OAuth buttons (Google, etc.)
    socialButtonsIconButton: {
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      color: '#dce1fb',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.07)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
      },
    },

    socialButtonsBlockButton: {
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      color: '#dce1fb',
      fontSize: '14px',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.07)',
      },
    },

    // Divider
    dividerLine: {
      background: 'rgba(255, 255, 255, 0.06)',
    },
    dividerText: {
      color: '#8c909f',
      fontSize: '12px',
      fontFamily: "'JetBrains Mono', monospace",
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },

    // Footer links (Don't have an account? Sign up)
    footerActionText: {
      color: '#8c909f',
      fontSize: '13px',
    },
    footerActionLink: {
      color: '#adc6ff',
      fontWeight: '500',
      '&:hover': {
        color: '#4d8eff',
      },
    },
    footer: {
      background: 'transparent',
      '& + div': {
        display: 'none',
      },
    },

    // "Secured by Clerk" badge — hide it or style it
    footerPages: {
      display: 'none',
    },

    // Internal links (Forgot password)
    formFieldAction: {
      color: '#adc6ff',
      fontSize: '13px',
      '&:hover': {
        color: '#4d8eff',
      },
    },

    // Error messages
    formFieldErrorText: {
      color: '#ffb4ab',
      fontSize: '12px',
    },
    alert: {
      background: 'rgba(255, 180, 171, 0.08)',
      border: '1px solid rgba(255, 180, 171, 0.2)',
      borderRadius: '0.5rem',
      color: '#ffb4ab',
      fontSize: '13px',
    },
    alertText: {
      color: '#ffb4ab',
    },

    // OTP / verification code inputs
    otpCodeFieldInput: {
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#dce1fb',
      borderRadius: '0.5rem',
      fontSize: '20px',
      fontFamily: "'JetBrains Mono', monospace",
      '&:focus': {
        borderColor: '#adc6ff',
        boxShadow: '0 0 0 2px rgba(173, 198, 255, 0.2)',
      },
    },

    // Identity preview (avatar + email shown after entering email)
    identityPreviewText: {
      color: '#dce1fb',
      fontSize: '14px',
    },
    identityPreviewEditButton: {
      color: '#adc6ff',
      '&:hover': { color: '#4d8eff' },
    },

    // Avatar / user icon in header
    avatarBox: {
      borderRadius: '0.5rem',
      border: '1px solid rgba(173, 198, 255, 0.2)',
    },

    // Back button
    backLink: {
      color: '#8c909f',
      '&:hover': { color: '#adc6ff' },
    },

    // Clerk logo (shown in footer) — keep transparent
    internal: {
      display: 'none',
    },
  },
};
