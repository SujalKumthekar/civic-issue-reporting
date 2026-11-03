import { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Menu, X, Bell, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    // Change navbar style on scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navClasses = isScrolled
        ? "bg-primary/95 backdrop-blur-md shadow-lg py-4"
        : "bg-transparent py-6";

    const textClass = isScrolled ? "text-white" : "text-white";

    return (
        <motion.nav
            className={`fixed w-full z-50 transition-all duration-300 ${navClasses}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo Section */}
                <div className="flex items-center gap-4 md:w-1/4">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <span className={`text-xl font-bold tracking-tight ${textClass} hidden md:block`}>CivicConnect</span>
                    </Link>
                </div>

                {/* Desktop Menu - Centered */}
                <div className="hidden md:flex flex-1 justify-center items-center gap-8">
                    <Link to="/" className={`font-medium hover:text-secondary transition-colors ${textClass}`}>Home</Link>
                    <Link to="/report-civic-issue" className={`font-medium hover:text-secondary transition-colors ${textClass}`}>Report Issue</Link>
                    <Link to="/report-illegal-activity" className={`font-medium hover:text-secondary transition-colors ${textClass}`}>Report Illegal</Link>
                    <a href="#" className={`font-medium hover:text-secondary transition-colors ${textClass}`}>Track Status</a>
                </div>

                {/* Right side actions */}
                <div className="hidden md:flex items-center justify-end gap-4 md:w-1/4">
                    <button className={`p-2 rounded-full hover:bg-white/10 transition-colors ${textClass}`}>
                        <Bell size={20} />
                    </button>
                    
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard" className="flex items-center gap-2 group">
                                <div className="w-9 h-9 bg-secondary/20 border border-secondary/50 rounded-full flex items-center justify-center transition-colors group-hover:bg-secondary">
                                    <UserIcon size={16} className="text-white" />
                                </div>
                                <span className={`font-medium text-sm hidden lg:block ${textClass}`}>
                                    {user?.name?.split(' ')[0] || 'Profile'}
                                </span>
                            </Link>
                            <div className="w-px h-6 bg-white/20 mx-1"></div>
                            <button 
                                onClick={handleLogout}
                                className={`font-medium hover:text-red-400 transition-colors ${textClass} text-sm px-1`}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login">
                            <Button variant="secondary" className="py-2 px-5 text-sm">
                                Login
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className={`md:hidden p-2 ${textClass}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden bg-primary border-t border-white/10"
                >
                    <div className="px-6 py-4 flex flex-col gap-4">
                        <Link to="/" className="text-white font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                        <Link to="/report-civic-issue" className="text-white font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Report Issue</Link>
                        <Link to="/report-illegal-activity" className="text-white font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Report Illegal</Link>
                        <Link to="#" className="text-white font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Track Status</Link>
                        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                            {isAuthenticated ? (
                                <div className="flex flex-col w-full gap-3">
                                    <Link to="/dashboard" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="secondary" className="w-full justify-center flex items-center gap-2">
                                            <UserIcon size={16} /> {user?.name || 'Profile'}
                                        </Button>
                                    </Link>
                                    <Button variant="outline" className="w-full justify-center" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <Link to="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="secondary" className="w-full justify-center">Login</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default Navbar;
