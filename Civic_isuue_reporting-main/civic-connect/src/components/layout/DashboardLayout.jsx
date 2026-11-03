import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    FileText, 
    Settings, 
    LogOut, 
    Bell, 
    Search, 
    Menu, 
    X,
    Users,
    Home
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Community Issues', path: '/issues' },
    { icon: FileText, label: 'My Reports', path: '/dashboard/reports' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

const DashboardLayout = ({ children }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex bg-neutral-50 font-sans text-neutral-900">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-neutral-200 shadow-sm z-20">
                <Link to="/" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-lg shadow-secondary/20">
                        <span className="text-white font-bold text-xl">C</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-primary">CivicConnect</span>
                </Link>

                <div className="px-4 py-2 flex flex-col gap-2 flex-1">
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-2">Menu</div>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                                        isActive 
                                        ? 'bg-secondary/10 text-secondary font-medium' 
                                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                                    }`}
                                >
                                    <item.icon size={20} className={isActive ? 'text-secondary' : 'text-neutral-400'} />
                                    <span>{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-neutral-200">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-all">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-neutral-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: isMobileOpen ? 0 : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 lg:hidden flex flex-col"
            >
                <div className="p-6 flex items-center justify-between">
                    <Link to="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">C</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-primary">CivicConnect</span>
                    </Link>
                    <button onClick={() => setIsMobileOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-4 py-2 flex flex-col gap-2 flex-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link key={item.path} to={item.path} onClick={() => setIsMobileOpen(false)}>
                                <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                                        isActive 
                                        ? 'bg-secondary/10 text-secondary font-medium' 
                                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                                    }`}>
                                    <item.icon size={20} className={isActive ? 'text-secondary' : 'text-neutral-400'} />
                                    <span>{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                
                <div className="p-4 border-t border-neutral-200">
                    <button onClick={() => { setIsMobileOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-all">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button 
                            className="lg:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        
                        <div className="hidden md:flex items-center bg-neutral-100 rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-secondary/30 focus-within:bg-white transition-all">
                            <Search size={18} className="text-neutral-400" />
                            <input 
                                type="text" 
                                placeholder="Search reports..." 
                                className="bg-transparent border-none outline-none ml-2 text-sm w-full placeholder:text-neutral-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="w-px h-6 bg-neutral-200 hidden md:block"></div>
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-1.5 rounded-full pr-4 transition-colors">
                            <div className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center font-medium shadow-sm">
                                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-medium text-neutral-900 leading-none mb-1">{user?.name || 'Citizen'}</p>
                                <p className="text-neutral-500 text-xs leading-none">Citizen</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
