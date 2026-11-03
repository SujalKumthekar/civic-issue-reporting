import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

const MunicipalLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        departmentId: '',
        password: ''
    });
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulating API call for login
        setTimeout(() => {
            setIsLoading(false);
            // Mock routing based on ID to demonstrate roles
            if (formData.departmentId.toLowerCase().includes('super')) {
                 localStorage.setItem('userRole', 'SUPER_ADMIN');
            } else {
                 localStorage.setItem('userRole', 'LOCAL_ADMIN');
            }
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-secondary/10 blur-[100px]"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                            <Building2 className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-center">
                            Municipal Portal
                        </h1>
                        <p className="text-slate-500 mt-2 text-center text-sm font-medium">
                            Authorized personnel only
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">
                                Department ID or Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="departmentId"
                                    value={formData.departmentId}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    placeholder="e.g. ward04_admin"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <a href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="w-full py-3 text-base shadow-lg shadow-primary/20 mt-2 bg-primary hover:bg-primary/90"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    'Access Portal'
                                )}
                            </Button>
                        </div>
                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
                         <span className="text-xs text-slate-400 font-medium">Pune Municipal Corporation System</span>
                    </div>
                </div>
                
                {/* Mock instructions for development testing */}
                <div className="mt-6 text-center text-xs text-slate-400">
                    <p>Demo accounts: Use ID <span className="font-semibold text-slate-500">"super_admin"</span> for Central Authority,</p>
                    <p>or any other ID for Local Admin.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default MunicipalLogin;
