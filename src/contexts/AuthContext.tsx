import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { UserModel } from '../models/UserModel';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string, allowShare?: boolean) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteUserAccount: (password: string) => Promise<void>;
  loading: boolean;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    // Lưu user vào Firestore
    const userData: UserModel = {
      uid: result.user.uid,
      displayName,
      email,
      photoURL: result.user.photoURL || '',
      createdAt: new Date().toISOString(),
      allowShare: true,
    };
    await setDoc(doc(db, 'users', result.user.uid), userData);
    // Lưu dữ liệu public vào public_users
    const publicUserData = {
      uid: result.user.uid,
      displayName,
      photoURL: result.user.photoURL || '',
      createdAt: userData.createdAt,
    };
    await setDoc(doc(db, 'public_users', result.user.uid), publicUserData);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (displayName: string, photoURL?: string, allowShare?: boolean) => {
    if (!currentUser) throw new Error('No user logged in');
    const updateData: { displayName?: string; photoURL?: string } = { displayName };
    if (photoURL !== undefined) {
      updateData.photoURL = photoURL;
    }
    await updateProfile(currentUser, updateData);
    // Cập nhật Firestore
    const userRef = doc(db, 'users', currentUser.uid);
    const updateFirestore: any = { displayName };
    if (photoURL !== undefined) updateFirestore.photoURL = photoURL;
    if (allowShare !== undefined) updateFirestore.allowShare = allowShare;
    await updateDoc(userRef, updateFirestore);
    // Đồng bộ sang public_users
    const publicUserRef = doc(db, 'public_users', currentUser.uid);
    const publicUpdate: any = { displayName };
    if (photoURL !== undefined) publicUpdate.photoURL = photoURL;
    await updateDoc(publicUserRef, publicUpdate);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser || !currentUser.email) throw new Error('No user logged in');
    
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  };

  const deleteUserAccount = async (password: string) => {
    if (!currentUser || !currentUser.email) throw new Error('No user logged in');
    
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
    await deleteUser(currentUser);
  };

  const value = {
    currentUser,
    signUp,
    signIn,
    logout,
    resetPassword,
    updateUserProfile,
    changePassword,
    deleteUserAccount,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 