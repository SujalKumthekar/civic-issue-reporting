import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    FileText, 
    Settings, 
    LogOut, 
    Bell, 
    Search, 
    Menu, 
    X,
    Building2,
    CheckSquare,
    AlertTriangle,
    Users
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const DashboardLayout = ({ children }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    
    const { admin, logout: adminLogout, isDistrictAuthority } = useAdminAuth();
    const isSuperAdmin = isDistrictAuthority;

    // Build nav items dynamically based on role
    const getNavItems = () => {
        const baseItems = [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', exact: true },
        ];

        if (isSuperAdmin) {
            baseItems.push({ icon: FileText, label: 'District Reports', path: '/dashboard/district-reports' });
            baseItems.push({ icon: Building2, label: 'Nagarpalika Reports', path: '/dashboard/nagarpalika-reports' });
            baseItems.push({ icon: CheckSquare, label: 'Pending Funds', path: '/dashboard/pending-funds' });
            baseItems.push({ icon: CheckSquare, label: 'Pending Approvals', path: '/dashboard/approvals' });
            baseItems.push({ icon: Users, label: 'Nagarpalikas', path: '/dashboard/nagarpalikas' });
        } else {
            baseItems.push({ icon: FileText, label: 'Civic Issues', path: '/dashboard/workspace' });
            baseItems.push({ icon: AlertTriangle, label: 'Illegal Activities', path: '/dashboard/illegal-activities' });
        }

        baseItems.push({ icon: Settings, label: 'Settings', path: '/dashboard/settings' });
        return baseItems;
    };

    const navItems = getNavItems();

    const handleLogout = () => {
        adminLogout();
        navigate('/login');
    };

    const SidebarContent = ({ isMobile }) => (
        <>
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Building2 className="text-white" size={20} />
                </div>
                <div>
                    <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">Admin Portal</span>
                    <span className="text-xs font-semibold text-primary block">{isSuperAdmin ? 'District Authority' : 'Local Nagarpalika'}</span>
                </div>
            </div>

            <div className="px-4 py-2 flex flex-col gap-2 flex-1 mt-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu</div>
                {navItems.map((item) => {
                    // Check if path is exact or starts with (for nested routes)
                    const isActive = item.exact 
                        ? location.pathname === item.path 
                        : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            onClick={() => isMobile && setIsMobileOpen(false)}
                        >
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                                    isActive 
                                    ? 'bg-primary text-white font-medium shadow-md shadow-primary/10' 
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 font-medium'
                                }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                                <span>{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-200">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-all cursor-pointer"
                >
                    <LogOut size={20} />
                    <span>Logout Profile</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-200 shadow-sm z-20">
                <SidebarContent isMobile={false} />
            </aside>

            {/* Mobile Sidebar overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 lg:hidden flex flex-col"
                    >
                        <div className="absolute top-4 right-4">
                            <button onClick={() => setIsMobileOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <SidebarContent isMobile={true} />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        
                        <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2 w-72 border border-transparent focus-within:border-primary/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                            <Search size={18} className="text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search Report ID (e.g. CIV-492)" 
                                className="bg-transparent border-none outline-none ml-2 text-sm w-full placeholder:text-slate-400 text-slate-900 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
                        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl pr-3 transition-colors">
                            <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-primary rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
                                {admin?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-bold text-slate-900 leading-none mb-1">{admin?.name || 'Admin'}</p>
                                <p className="text-slate-500 font-medium text-xs leading-none">{isSuperAdmin ? admin?.districtName + ' District' : admin?.taluka + ' Taluka'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
