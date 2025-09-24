import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface CreateAdminUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const createAdminUser = async (data: CreateAdminUserData) => {
  try {
    // Create user in Firebase Auth
    const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
    
    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: `${data.firstName} ${data.lastName}`,
    });

    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      firstName: data.firstName,
      lastName: data.lastName,
      type: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    console.log('✅ Admin user created successfully!');
    console.log(`User ID: ${user.uid}`);
    console.log(`Email: ${data.email}`);
    console.log(`Name: ${data.firstName} ${data.lastName}`);
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

// Helper function to create a default admin user
export const createDefaultAdmin = async () => {
  const defaultAdminData: CreateAdminUserData = {
    email: 'admin@beachvibe.com',
    password: 'admin123!',
    firstName: 'Admin',
    lastName: 'User',
  };

  try {
    await createAdminUser(defaultAdminData);
    console.log('Default admin user created successfully!');
    console.log('Email: admin@beachvibe.com');
    console.log('Password: admin123!');
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists. Please check Firestore for the user document.');
    } else {
      throw error;
    }
  }
};
