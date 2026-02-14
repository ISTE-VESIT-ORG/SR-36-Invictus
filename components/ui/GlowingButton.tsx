'use client';

import { motion, HTMLMotionProps } from 'framer-motion';

interface GlowingButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
}

export function GlowingButton({ children, className = "", variant = 'primary', ...props }: GlowingButtonProps) {
    const baseStyles = "relative px-6 py-3 rounded-full font-semibold transition-all duration-300 overflow-hidden group";

    const variants = {
        primary: "bg-gradient-to-r from-cosmic-purple to-nebula-pink text-white shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(124,58,237,0.8)]",
        secondary: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]",
        outline: "border-2 border-cosmic-purple text-cosmic-purple hover:bg-cosmic-purple hover:text-white shadow-[0_0_10px_rgba(124,58,237,0.2)] hover:shadow-[0_0_20px_rgba(124,58,237,0.6)]"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />

            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </motion.button>
    );
}
