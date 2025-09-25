import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Cookie, Settings } from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';

const CookiePreferencesManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    preferences,
    hasConsented,
    updatePreference,
    savePreferences,
    resetConsent,
  } = useCookieConsent();

  const handleSave = () => {
    savePreferences(preferences);
    setIsOpen(false);
  };

  const handleReset = () => {
    resetConsent();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20">
          <Cookie className="w-4 h-4" />
          Cookie Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Cookie Preferences
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Manage your cookie preferences. You can change these settings at any time.
          </div>

          {/* Cookie Categories */}
          <div className="space-y-4">
            {/* Necessary Cookies */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Necessary Cookies
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Essential for the website to function properly
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600 font-medium">Always Active</span>
                </div>
              </div>
            </Card>

            {/* Analytics Cookies */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Analytics Cookies
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Help us understand how visitors interact with our website
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => updatePreference('analytics', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </Card>

            {/* Marketing Cookies */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Marketing Cookies
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Used to display relevant advertisements
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => updatePreference('marketing', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Reset Preferences
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
            >
              Save Preferences
            </Button>
          </div>

          {/* Status */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {hasConsented ? (
              <span className="text-green-600">✓ Cookie preferences saved</span>
            ) : (
              <span className="text-orange-600">⚠ No cookie preferences set</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookiePreferencesManager;
