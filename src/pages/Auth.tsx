import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  X
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth, AuthUser } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  businessName?: string;
  businessAddress?: string;
}

export const AuthPage = () => {
  const navigate = useNavigate();
  const { signUp, signIn, signInWithGoogle, updateUserProfile, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'user' | 'owner'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    businessName: '',
    businessAddress: '',
  });

  const handleInputChange = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === 'signup') {
        // Create the user account
        await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName,
          userType
        );
        
        // If there's additional profile data, update it
        const additionalData: Partial<AuthUser> = {};
        
        if (formData.phone) {
          additionalData.phone = formData.phone;
        }
        
        if (userType === 'owner') {
          additionalData.businessName = formData.businessName;
          additionalData.businessAddress = formData.businessAddress;
        }
        
        // Only update if there's data to update
        if (Object.keys(additionalData).length > 0) {
          await updateUserProfile(additionalData);
        }
        
        toast({
          title: "Account created successfully!",
          description: "Welcome to BeachVibe!",
        });
      } else {
        await signIn(formData.email, formData.password);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      }
      
      // Redirect based on user type
      if (userType === 'owner') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome to BeachVibe!",
        description: "Successfully signed in with Google.",
      });
      navigate('/');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Google sign-in failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password reset failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const isFormValid = () => {
    if (activeTab === 'login') {
      return formData.email && formData.password;
    } else {
      const baseValid = formData.email && formData.password && formData.confirmPassword && 
                       formData.firstName && formData.lastName;
      
      // Additional validation for bar owners
      if (userType === 'owner' && activeTab === 'signup') {
        return baseValid && 
               formData.password === formData.confirmPassword &&
               formData.businessName && 
               formData.businessAddress;
      }
      
      return baseValid && formData.password === formData.confirmPassword;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Header />
      
      {/* Password Reset Modal */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset}>
            <div className="grid gap-4 py-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                disabled={isResetting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!resetEmail || isResetting}>
                {isResetting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            {/* User Type Switch */}
            <div className="mb-8">
              <div className="bg-white rounded-xl p-1 shadow-sm border">
                <div className="flex">
                  <button
                    onClick={() => setUserType('user')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                      userType === 'user'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    Beach Goer
                  </button>
                  <button
                    onClick={() => setUserType('owner')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                      userType === 'owner'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    Bar Owner
                  </button>
                </div>
              </div>
            </div>

            {/* Auth Card */}
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                </CardTitle>
                <p className="text-muted-foreground">
                  {activeTab === 'login' 
                    ? `Sign in to your ${userType === 'user' ? 'beach' : 'business'} account`
                    : `Join BeachVibe as a ${userType === 'user' ? 'beach goer' : 'bar owner'}`
                  }
                </p>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Login Tab */}
                  <TabsContent value="login">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="login-password">Password</Label>
                          <button 
                            type="button" 
                            onClick={() => setShowForgotPassword(true)}
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                                             <Button
                         type="submit"
                         className="w-full"
                         disabled={!isFormValid() || isLoading}
                       >
                         {isLoading ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                             Signing In...
                           </>
                         ) : (
                           'Sign In'
                         )}
                       </Button>

                       <div className="relative">
                         <div className="absolute inset-0 flex items-center">
                           <span className="w-full border-t" />
                         </div>
                         <div className="relative flex justify-center text-xs uppercase">
                           <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                         </div>
                       </div>

                       <Button
                         type="button"
                         variant="outline"
                         className="w-full"
                         onClick={handleGoogleSignIn}
                         disabled={isLoading}
                       >
                         <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                           <path
                             d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                             fill="#4285F4"
                           />
                           <path
                             d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                             fill="#34A853"
                           />
                           <path
                             d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                             fill="#FBBC05"
                           />
                           <path
                             d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                             fill="#EA4335"
                           />
                         </svg>
                         Continue with Google
                       </Button>
                    </form>
                  </TabsContent>

                  {/* Signup Tab */}
                  <TabsContent value="signup">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="signup-firstName">First Name</Label>
                          <Input
                            id="signup-firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="signup-lastName">Last Name</Label>
                          <Input
                            id="signup-lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      

                      

                      {/* Phone Number - Optional for all users */}
                      <div>
                        <Label htmlFor="signup-phone">Phone Number (Optional)</Label>
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>

                      {/* Business fields - Only shown for bar owners */}
                      {userType === 'owner' && (
                        <>
                          <div>
                            <Label htmlFor="signup-businessName">Business Name</Label>
                            <Input
                              id="signup-businessName"
                              placeholder="Your Beach Bar Name"
                              value={formData.businessName}
                              onChange={(e) => handleInputChange('businessName', e.target.value)}
                              required={userType === 'owner'}
                            />
                          </div>
                          <div>
                            <Label htmlFor="signup-businessAddress">Business Address</Label>
                            <Input
                              id="signup-businessAddress"
                              placeholder="123 Beach Road, Paradise Island"
                              value={formData.businessAddress}
                              onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                              required={userType === 'owner'}
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                          <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                        )}
                      </div>

                                             <Button
                         type="submit"
                         className="w-full"
                         disabled={!isFormValid() || isLoading}
                       >
                         {isLoading ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                             Creating Account...
                           </>
                         ) : (
                           'Create Account'
                         )}
                       </Button>

                       <div className="relative">
                         <div className="absolute inset-0 flex items-center">
                           <span className="w-full border-t" />
                         </div>
                         <div className="relative flex justify-center text-xs uppercase">
                           <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                         </div>
                       </div>

                       <Button
                         type="button"
                         variant="outline"
                         className="w-full"
                         onClick={handleGoogleSignIn}
                         disabled={isLoading}
                       >
                         <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                           <path
                             d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                             fill="#4285F4"
                           />
                           <path
                             d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                             fill="#34A853"
                           />
                           <path
                             d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                             fill="#FBBC05"
                           />
                           <path
                             d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                             fill="#EA4335"
                           />
                         </svg>
                         Continue with Google
                       </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPage;