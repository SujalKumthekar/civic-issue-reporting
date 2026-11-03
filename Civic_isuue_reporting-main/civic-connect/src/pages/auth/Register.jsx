import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import RegisterForm from '../../components/auth/RegisterForm';

const Register = () => {
    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-secondary relative overflow-hidden">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-accent rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center items-center w-full px-16 text-white">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-3 mb-8"
                    >
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/30">
                            <span className="text-white font-bold text-2xl">C</span>
                        </div>
                        <span className="text-3xl font-bold tracking-tight">CivicConnect</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-bold text-center mb-4 leading-tight"
                    >
                        Join Your<br />Community
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="text-white/70 text-center text-lg max-w-sm leading-relaxed"
                    >
                        Create your citizen account and start making a real difference in your area.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 space-y-3 w-full max-w-xs"
                    >
                        {['Report issues in your locality', 'Track resolution in real-time', 'Connect with local authorities'].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                                </div>
                                <p className="text-sm text-white/80">{text}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-neutral-50 px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:hidden flex items-center gap-2 mb-8 justify-center"
                    >
                        <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-primary">CivicConnect</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Create your account</h1>
                        <p className="text-neutral-500 mb-8">Register as a citizen to get started</p>
                    </motion.div>

                    <RegisterForm />

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center text-xs text-neutral-400 mt-8"
                    >
                        <Link to="/" className="hover:text-secondary transition-colors">
                            ← Back to Home
                        </Link>
                    </motion.p>
                </div>
            </div>
        </div>
    );
};

export default Register;
