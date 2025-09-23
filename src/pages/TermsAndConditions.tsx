import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, FileText, Shield, CreditCard, Users, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
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
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Terms & Conditions
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
              Agreement to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              By accessing and using BeachVibe ("the Service"), you accept and agree to be bound by the 
              terms and provision of this agreement. If you do not agree to abide by the above, please 
              do not use this service.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms & Conditions govern your use of our beach bar booking and ordering platform. 
              Please read them carefully before using our services.
            </p>
          </Card>

          {/* Service Description */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Service Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              BeachVibe is a platform that connects users with beach bars and restaurants, allowing you to:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Browse and discover beach bars and restaurants</li>
              <li>Make reservations and bookings</li>
              <li>Place food and drink orders</li>
              <li>Access QR code menus</li>
              <li>Process payments securely</li>
              <li>Leave reviews and ratings</li>
            </ul>
          </Card>

          {/* User Responsibilities */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              User Responsibilities
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Users className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Account Information
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    You are responsible for maintaining the accuracy of your account information and 
                    keeping your login credentials secure.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Shield className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Appropriate Use
                  </h3>
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    You agree to use the service only for lawful purposes and in accordance with these terms. 
                    You will not use the service for any illegal or unauthorized purpose.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Prohibited Activities
                  </h3>
                  <p className="text-orange-800 dark:text-orange-200 text-sm">
                    You may not attempt to gain unauthorized access to any part of the service, use automated 
                    systems to access the service, or interfere with the proper functioning of the service.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Terms */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Payment Terms
            </h2>
            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <CreditCard className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Payment Processing
                </h3>
                <p className="text-purple-800 dark:text-purple-200 mb-3">
                  All payments are processed securely through Stripe. By making a payment, you agree to:
                </p>
                <ul className="list-disc list-inside text-purple-800 dark:text-purple-200 space-y-1 text-sm">
                  <li>Provide accurate payment information</li>
                  <li>Authorize charges for your orders and bookings</li>
                  <li>Pay all applicable taxes and fees</li>
                  <li>Accept our refund and cancellation policies</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Cancellation Policy */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Cancellation and Refund Policy
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Booking Cancellations
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Cancellation policies vary by establishment. Please check the specific cancellation 
                  policy when making your booking. Generally, cancellations made 24 hours in advance 
                  are fully refundable.
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Order Cancellations
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Food and drink orders can typically be cancelled before preparation begins. 
                  Once preparation has started, cancellations may not be possible or may incur charges.
                </p>
              </div>
            </div>
          </Card>

          {/* Limitation of Liability */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              BeachVibe acts as an intermediary platform connecting users with beach bars and restaurants. 
              We are not responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>The quality of food, drinks, or services provided by establishments</li>
              <li>Any disputes between users and establishments</li>
              <li>Changes to establishment hours, menus, or availability</li>
              <li>Weather conditions or other external factors affecting your experience</li>
            </ul>
          </Card>

          {/* Privacy */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of the service, to understand our practices.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We collect and use your information in accordance with our Privacy Policy and applicable 
              data protection laws.
            </p>
          </Card>

          {/* Changes to Terms */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any 
              significant changes by:
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li>Posting the updated terms on our website</li>
              <li>Sending email notifications to registered users</li>
              <li>Displaying a notice on our platform</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
              Contact Information
            </h2>
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed mb-4">
              If you have any questions about these Terms & Conditions, please contact us:
            </p>
            <div className="text-blue-800 dark:text-blue-200 space-y-2">
              <p><strong>Email:</strong> legal@beachvibe.com</p>
              <p><strong>Address:</strong> BeachVibe Legal Team, 123 Beach Road, Coastal City, CC 12345</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button asChild className="flex-1 sm:flex-none">
              <Link to="/cookie-policy">View Cookie Policy</Link>
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

export default TermsAndConditions;
