import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import apiClient from './apiService';

export const signUp = (email: string, password: string, displayName?: string) =>
	createUserWithEmailAndPassword(auth, email, password);

export const signIn = (email: string, password: string) =>
	signInWithEmailAndPassword(auth, email, password);

export const signOutUser = () => signOut(auth);

export const listenAuth = (cb: (user: User | null) => void) => onAuthStateChanged(auth, cb);

export const getIdToken = async () => auth.currentUser ? auth.currentUser.getIdToken() : null;

export const verifyTokenWithServer = async () => {
	const token = await getIdToken();
	if (!token) throw new Error('No auth token');
	const res = await apiClient.post('/auth/verifyToken', { token });
	return res.data;
};
