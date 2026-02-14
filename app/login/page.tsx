'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Mail, Lock, User, ArrowRight, Github, Twitter, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Starfield } from '@/components/ui/Starfield';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { signIn, signUp } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Prefetch portions of the app for faster transitions
    useEffect(() => {
        router.prefetch('/events');
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password, name);
            }
            // Use client-side navigation for instant transition
            router.push('/events');
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-space-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Animation */}
            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
                <Starfield density="medium" className="opacity-50" />
                <div className="absolute w-full h-full bg-gradient-to-br from-space-black via-space-gray-900 to-black opacity-90" />

                {/* Animated Orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cosmic-purple/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nebula-pink/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-cosmic-purple to-nebula-pink shadow-lg shadow-cosmic-purple/20 group-hover:shadow-cosmic-purple/40 transition-all">
                            <Rocket className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-3xl font-bold font-display text-white">
                            AstroView
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-space-gray-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {isLogin ? 'Welcome Back, Explorer' : 'Join the Mission'}
                        </h2>
                        <p className="text-space-gray-400 text-sm">
                            {isLogin
                                ? 'Enter your credentials to access mission control.'
                                : 'Create an account to start your cosmic journey.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2 text-red-200 text-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-space-gray-400 uppercase tracking-wider">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-space-gray-500" />
                                            <input
                                                type="text"
                                                required={!isLogin}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full bg-space-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-space-gray-600 focus:outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple transition-all"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-space-gray-400 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-space-gray-500" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-space-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-space-gray-600 focus:outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-space-gray-400 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-space-gray-500" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-space-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-space-gray-600 focus:outline-none focus:border-cosmic-purple focus:ring-1 focus:ring-cosmic-purple transition-all"
                                />
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex justify-end">
                                <Link href="#" className="text-xs text-cosmic-purple hover:text-nebula-pink transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-white rounded-xl font-bold shadow-lg shadow-cosmic-purple/25 hover:shadow-cosmic-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-space-gray-400 text-sm">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-cosmic-purple font-semibold hover:text-nebula-pink transition-colors"
                            >
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10">
                        <div className="flex justify-center gap-4">
                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                                <Github className="w-5 h-5 text-white" />
                            </button>
                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                                <Twitter className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
