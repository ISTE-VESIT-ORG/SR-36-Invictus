'use client';

import { motion } from 'framer-motion';

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    colors?: string[]; // Array of tailwind text-color classes or gradient strings
    animate?: boolean;
}

export function GradientText({
    children,
    className = "",
    colors = ["from-cosmic-purple", "via-nebula-pink", "to-galaxy-cyan"],
    animate = true
}: GradientTextProps) {

    return (
        <span
            className={`bg-clip-text text-transparent bg-gradient-to-r ${colors.join(' ')} ${animate ? 'animate-gradient-text' : ''} ${className}`}
        >
            {children}
        </span>
    );
}
