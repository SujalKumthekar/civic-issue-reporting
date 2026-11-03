import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, variant = "primary", className, onClick }) => {
    const baseStyles = "px-6 py-3 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-secondary text-white hover:bg-blue-700 hover:shadow-lg focus:ring-secondary/50",
        secondary: "bg-white text-primary border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-200/50",
        outline: "bg-transparent text-white border border-white/50 hover:bg-white/10 focus:ring-white/50",
        ghost: "bg-transparent text-primary hover:bg-gray-100 focus:ring-gray-200/50"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={twMerge(baseStyles, variants[variant], className)}
            onClick={onClick}
        >
            {children}
        </motion.button>
    );
};

export default Button;
