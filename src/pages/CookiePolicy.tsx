import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Cookie, Shield, Settings, Eye, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="w-8 h-8 text-amber-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Cookie Policy
            </h1>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              What Are Cookies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              understanding how you use our site.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              At BeachVibe, we use cookies to enhance your browsing experience, analyze site traffic, 
              and provide personalized content. This policy explains how we use cookies and how you can 
              control them.
            </p>
          </Card>

          {/* Types of Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Types of Cookies We Use
            </h2>
            
            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Shield className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    Necessary Cookies
                  </h3>
                  <p className="text-green-800 dark:text-green-200 mb-3">
                    These cookies are essential for the website to function properly. They enable basic 
                    functions like page navigation, access to secure areas, and remembering your login status.
                  </p>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <strong>Examples:</strong> Authentication tokens, session IDs, security preferences
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Settings className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Analytics Cookies
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 mb-3">
                    These cookies help us understand how visitors interact with our website by collecting 
                    and reporting information anonymously. This helps us improve our website's performance.
                  </p>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Examples:</strong> Google Analytics, page views, user behavior tracking
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <Target className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Marketing Cookies
                  </h3>
                  <p className="text-purple-800 dark:text-purple-200 mb-3">
                    These cookies are used to track visitors across websites to display relevant and 
                    engaging advertisements. They help us measure the effectiveness of our marketing campaigns.
                  </p>
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    <strong>Examples:</strong> Facebook Pixel, Google Ads, retargeting pixels
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <Eye className="w-6 h-6 text-orange-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Functional Cookies
                  </h3>
                  <p className="text-orange-800 dark:text-orange-200 mb-3">
                    These cookies enable enhanced functionality and personalization, such as remembering 
                    your language preferences and providing improved features.
                  </p>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    <strong>Examples:</strong> Language settings, theme preferences, user interface customizations
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Third-Party Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Third-Party Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We may use third-party services that set their own cookies. These services include:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
              <li><strong>Stripe:</strong> For secure payment processing</li>
              <li><strong>Firebase:</strong> For authentication and database services</li>
              <li><strong>Social Media Platforms:</strong> For social sharing and login features</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These third-party services have their own privacy policies and cookie practices. 
              We recommend reviewing their policies for more information.
            </p>
          </Card>

          {/* Managing Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Managing Your Cookie Preferences
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You have several options for managing cookies:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Browser Settings
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Block all cookies</li>
                  <li>Block third-party cookies</li>
                  <li>Delete existing cookies</li>
                  <li>Set preferences for specific websites</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Our Cookie Consent Tool
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  When you first visit our website, you'll see a cookie consent banner where you can:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Accept all cookies</li>
                  <li>Accept only necessary cookies</li>
                  <li>Customize your preferences for different cookie types</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Impact of Disabling Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Impact of Disabling Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you choose to disable cookies, some features of our website may not function properly:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>You may need to log in repeatedly</li>
              <li>Your preferences and settings may not be saved</li>
              <li>Some interactive features may not work</li>
              <li>We won't be able to provide personalized content</li>
              <li>Analytics data will be limited, affecting our ability to improve the site</li>
            </ul>
          </Card>

          {/* Updates to Policy */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Updates to This Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or for other operational, legal, or regulatory reasons. We will notify you of any 
              significant changes by:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Posting the updated policy on our website</li>
              <li>Sending you an email notification (if you're a registered user)</li>
              <li>Showing a notice on our website</li>
            </ul>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
              Contact Us
            </h2>
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed mb-4">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="text-blue-800 dark:text-blue-200 space-y-2">
              <p><strong>Email:</strong> privacy@beachvibe.com</p>
              <p><strong>Address:</strong> BeachVibe Privacy Team, 123 Beach Road, Coastal City, CC 12345</p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button asChild className="flex-1 sm:flex-none">
              <Link to="/terms">View Terms & Conditions</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
