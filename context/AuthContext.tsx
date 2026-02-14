'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user); // Immediate update for faster UI response
    };

    const signUp = async (email: string, password: string, name: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update the user's profile with their name
        await updateProfile(userCredential.user, {
            displayName: name,
        });
        // Force refresh user to get display name
        setUser({ ...userCredential.user, displayName: name });
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
            {loading ? (
                <div className="fixed inset-0 bg-space-black flex flex-col items-center justify-center z-50">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Rocket className="w-12 h-12 text-cosmic-purple" />
                    </motion.div>
                    <p className="mt-4 text-space-gray-400 font-mono animate-pulse">Initializing Systems...</p>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
