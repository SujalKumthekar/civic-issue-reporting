import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../common/Button';

const puneData = {
    'Maval': ['Lonavala Municipal Council', 'Talegaon Dabhade Municipal Council', 'Vadgaon Maval Nagar Panchayat'],
    'Baramati': ['Baramati Municipal Council'],
    'Daund': ['Daund Municipal Council'],
    'Khed (Rajgurunagar)': ['Alandi Municipal Council', 'Rajgurunagar Municipal Council', 'Chakan Municipal Council'],
    'Junnar': ['Junnar Municipal Council'],
    'Shirur': ['Shirur Municipal Council'],
    'Purandar': ['Saswad Municipal Council', 'Jejuri Municipal Council'],
    'Indapur': ['Indapur Municipal Council'],
};


const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        taluka: '',
        area: '',
        password: '',
        confirmPassword: '',
    });

    const handleTalukaChange = (e) => {
        setFormData({ ...formData, taluka: e.target.value, area: '' });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        setIsLoading(true);
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            await axios.post(
                'http://localhost:5000/api/auth/register',
                { 
                    name: formData.fullName, 
                    email: formData.email, 
                    password: formData.password,
                    taluka: formData.taluka,
                    area: formData.area
                },
                config
            );
            
            // Redirect to login after successful registration
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong during registration');
            setIsLoading(false);
        }
    };

    const inputClass =
        'w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all duration-200';

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
        >
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
                    {error}
                </div>
            )}

            {/* Full Name */}
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Full Name
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User size={18} className="text-neutral-400" />
                    </div>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Email */}
            <div>
                <label htmlFor="regEmail" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Email Address
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail size={18} className="text-neutral-400" />
                    </div>
                    <input
                        id="regEmail"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="citizen@example.com"
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Taluka Selection */}
            <div>
                <label htmlFor="taluka" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Taluka <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <MapPin size={18} className="text-neutral-400" />
                    </div>
                    <select
                        id="taluka"
                        name="taluka"
                        required
                        value={formData.taluka}
                        onChange={handleTalukaChange}
                        className={`${inputClass} appearance-none cursor-pointer ${formData.taluka === "" ? "text-neutral-400" : "text-neutral-900"}`}
                    >
                        <option value="" disabled>Select your Taluka</option>
                        {Object.keys(puneData).map((taluka, index) => (
                            <option key={index} className="text-neutral-900" value={taluka}>{taluka} Taluka</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Area / Locality */}
            {formData.taluka && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label htmlFor="area" className="block text-sm font-medium text-neutral-700 mb-1.5 mt-2">
                        Nagar Palika / Urban Local Body <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <MapPin size={18} className="text-neutral-400" />
                        </div>
                        <select
                            id="area"
                            name="area"
                            required
                            value={formData.area}
                            onChange={handleChange}
                            className={`${inputClass} appearance-none cursor-pointer ${formData.area === "" ? "text-neutral-400" : "text-neutral-900"}`}
                        >
                            <option value="" disabled>Select your local body</option>
                            {puneData[formData.taluka].map((item, index) => (
                                <option key={index} className="text-neutral-900" value={item}>{item}</option>
                            ))}
                        </select>
                    </div>
                </motion.div>
            )}

            {/* Password */}
            <div>
                <label htmlFor="regPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock size={18} className="text-neutral-400" />
                    </div>
                    <input
                        id="regPassword"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 8 characters"
                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all duration-200"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {/* Confirm Password */}
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Confirm Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock size={18} className="text-neutral-400" />
                    </div>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all duration-200"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                    type="checkbox"
                    required
                    className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-secondary focus:ring-secondary/40 cursor-pointer"
                />
                <span className="text-sm text-neutral-600 leading-tight">
                    I agree to the{' '}
                    <a href="#" className="text-secondary hover:text-blue-700 font-medium transition-colors">
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-secondary hover:text-blue-700 font-medium transition-colors">
                        Privacy Policy
                    </a>
                </span>
            </label>

            {/* Submit */}
            <Button
                variant="primary"
                className={`w-full py-3.5 rounded-xl text-base mt-2 ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                    </div>
                ) : (
                    'Create Account'
                )}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-neutral-600 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-secondary hover:text-blue-700 transition-colors">
                    Sign in
                </Link>
            </p>
        </motion.form>
    );
};

export default RegisterForm;
