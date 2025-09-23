import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Cookie, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../hooks/useCookieConsent';

const CookiePolicyPopup: React.FC = () => {
  const [showPreferences, setShowPreferences] = useState(false);
  const {
    preferences,
    hasConsented,
    isLoading,
    acceptAll,
    acceptNecessary,
    savePreferences,
    updatePreference,
  } = useCookieConsent();

  // Don't show popup if user has already consented or if still loading
  if (hasConsented || isLoading) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Cookie className="w-8 h-8 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cookie Policy
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={acceptNecessary}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <p className="mb-4">
                We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                By continuing to use our site, you consent to our use of cookies.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learn more about how we use cookies in our{' '}
                <Link to="/cookie-policy" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                  Cookie Policy
                </Link>{' '}
                and{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                  Terms & Conditions
                </Link>.
              </p>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cookie Categories
              </h3>
              
              {/* Necessary Cookies */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Necessary Cookies
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">Always Active</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Essential for the website to function properly. These cannot be disabled.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Analytics Cookies
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => updatePreference('analytics', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Help us understand how visitors interact with our website by collecting anonymous information.
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Cookie className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Marketing Cookies
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => updatePreference('marketing', e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Used to track visitors across websites to display relevant and engaging advertisements.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={acceptNecessary}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                Accept Necessary Only
              </Button>
              <Button
                onClick={() => setShowPreferences(!showPreferences)}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                Customize Preferences
              </Button>
              <Button
                onClick={acceptAll}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
              >
                Accept All Cookies
              </Button>
            </div>

            {/* Customize Preferences Section */}
            {showPreferences && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                  Customize Your Cookie Preferences
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      Analytics Cookies
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => updatePreference('analytics', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      Marketing Cookies
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => updatePreference('marketing', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => savePreferences(preferences)}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Save Preferences
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookiePolicyPopup;
