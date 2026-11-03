import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={twMerge("bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300", className)}
        >
            {children}
        </motion.div>
    );
};

export default Card;
