import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true, can't be disabled
  analytics: false,
  marketing: false,
};

export const useCookieConsent = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent) {
      try {
        const parsedPreferences = JSON.parse(savedConsent);
        setPreferences(parsedPreferences);
        setHasConsented(true);
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
        // Reset to default if parsing fails
        localStorage.removeItem('cookieConsent');
      }
    }
    setIsLoading(false);
  }, []);

  const acceptAll = () => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allPreferences);
    localStorage.setItem('cookieConsent', JSON.stringify(allPreferences));
    setHasConsented(true);
  };

  const acceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    localStorage.setItem('cookieConsent', JSON.stringify(necessaryOnly));
    setHasConsented(true);
  };

  const savePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('cookieConsent', JSON.stringify(newPreferences));
    setHasConsented(true);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't change necessary cookies
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
  };

  const resetConsent = () => {
    localStorage.removeItem('cookieConsent');
    setPreferences(defaultPreferences);
    setHasConsented(false);
  };

  const canUseAnalytics = () => {
    return preferences.analytics && hasConsented;
  };

  const canUseMarketing = () => {
    return preferences.marketing && hasConsented;
  };

  return {
    preferences,
    hasConsented,
    isLoading,
    acceptAll,
    acceptNecessary,
    savePreferences,
    updatePreference,
    resetConsent,
    canUseAnalytics,
    canUseMarketing,
  };
};
