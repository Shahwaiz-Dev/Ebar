import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useEmailService } from '@/hooks/useEmailService';
import { deleteAllUserData } from '@/lib/firestore';

export interface AuthUser {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  type: 'user' | 'owner' | 'admin';
  avatar?: string;
  phone?: string;
  businessName?: string;
  businessAddress?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, type: 'user' | 'owner' | 'admin', phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<AuthUser>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { sendWelcomeEmail, sendAccountDeletionEmail } = useEmailService();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as AuthUser;
            console.log('User data loaded:', userData);
            setCurrentUser(userData);
          } else {
            // Handle case where user exists in Auth but not in Firestore
            console.warn('User exists in Auth but not in Firestore:', user.uid);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    type: 'user' | 'owner' | 'admin',
    phone?: string
  ) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Create user document in Firestore
      const userData: AuthUser = {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        type,
        ...(phone && { phone }),
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Don't set currentUser immediately - let the auth state listener handle it
      // This prevents timing issues with subsequent updateUserProfile calls

      // Send welcome email
      try {
        await sendWelcomeEmail({
          firstName,
          lastName,
          email,
        });
      } catch (error) {
        console.error('Failed to send welcome email:', error);
        // Don't throw error - user registration should still succeed
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document for Google sign-in
        const userData: AuthUser = {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          type: 'user', // Default to regular user
        };

        await setDoc(doc(db, 'users', user.uid), {
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<AuthUser>) => {
    if (!currentUser) throw new Error('No user logged in');

    try {
      const updatedData = {
        ...data,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', currentUser.uid), updatedData, { merge: true });
      
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const deleteAccount = async (password?: string) => {
    if (!currentUser || !auth.currentUser) throw new Error('No user logged in');

    try {
      // Re-authenticate user before deletion (required by Firebase for security)
      if (password && currentUser.email) {
        try {
          const credential = EmailAuthProvider.credential(currentUser.email, password);
          await reauthenticateWithCredential(auth.currentUser, credential);
          console.log('User re-authenticated successfully');
        } catch (reauthError) {
          console.error('Re-authentication failed:', reauthError);
          throw new Error('Invalid password. Please try again.');
        }
      } else {
        // If no password provided, try to proceed anyway (might work if recently authenticated)
        console.log('No password provided for re-authentication, proceeding with deletion');
      }

      // Send account deletion confirmation email before deletion
      try {
        await sendAccountDeletionEmail({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email || '',
          deletionDate: new Date().toLocaleDateString(),
        });
      } catch (error) {
        console.error('Failed to send account deletion email:', error);
        // Continue with deletion even if email fails
      }

      // Delete all user-related data (bars, bookings, orders, reviews, favorites)
      try {
        const deletionResults = await deleteAllUserData(currentUser.uid);
        console.log(`User data deletion completed for ${currentUser.uid}:`, deletionResults);
      } catch (error) {
        console.error('Error deleting user data:', error);
        // Continue with account deletion even if data deletion fails
      }

      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', currentUser.uid));
      
      // Delete user from Firebase Auth
      await deleteUser(auth.currentUser);
      
      setCurrentUser(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    updateUserProfile,
    resetPassword,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};