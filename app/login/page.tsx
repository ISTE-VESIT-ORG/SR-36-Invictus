'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Mail, Lock, User, ArrowRight, Github, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen bg-space-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('/images/stars-bg.png')] opacity-50 animate-pulse" />
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

                    <form className="space-y-4">
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

                        <button className="w-full py-3 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-white rounded-xl font-bold shadow-lg shadow-cosmic-purple/25 hover:shadow-cosmic-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
