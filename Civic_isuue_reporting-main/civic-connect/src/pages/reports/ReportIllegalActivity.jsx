import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    MapPin, ChevronDown, AlertTriangle, Upload, X, Image, Video, Send,
    ShieldAlert, FileText, Eye, EyeOff, CheckCircle2, Building2, HardHat,
    Megaphone, HelpCircle, Lock
} from 'lucide-react';
import Button from '../../components/common/Button';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';
import { useAuth } from '../../context/AuthContext';

const issueCategories = [
    { value: '', label: 'Select a category' },
    { value: 'corruption', label: 'Corruption' },
    { value: 'encroachment', label: 'Encroachment' },
    { value: 'illegal_construction', label: 'Illegal Construction' },
    { value: 'public_nuisance', label: 'Public Nuisance' },
    { value: 'environmental', label: 'Environmental Violation' },
    { value: 'other', label: 'Other' },
];

const ReportIllegalActivity = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        location: '',
        description: '',
    });
    const [files, setFiles] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [reportId, setReportId] = useState('');
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileUpload = (newFiles) => {
        const fileArray = Array.from(newFiles);
        const previews = fileArray.map(file => ({
            file,
            name: file.name,
            type: file.type.startsWith('video') ? 'video' : 'image',
            preview: URL.createObjectURL(file),
        }));
        setFiles(prev => [...prev, ...previews].slice(0, 5));
    };

    const removeFile = (index) => {
        setFiles(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileUpload(e.dataTransfer.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('category', formData.category);
            fd.append('location', formData.location);
            fd.append('description', formData.description);
            fd.append('isAnonymous', isAnonymous);
            fd.append('taluka', user.taluka);
            fd.append('nagarpalika', user.area);
            files.forEach((f) => fd.append('media', f.file));

            const res = await fetch('http://localhost:5000/api/illegal', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setReportId(data._id.slice(-8).toUpperCase());
            setIsSubmitted(true);
        } catch (err) {
            alert(err.message || 'Submission failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const stagger = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    };
    const fadeUp = {
        hidden: { opacity: 0, y: 18 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Report Submitted!</h2>
                    <p className="text-neutral-500 mb-2">
                        Your report has been filed {isAnonymous ? 'anonymously ' : ''}successfully. Authorities will investigate promptly.
                    </p>
                    <p className="text-sm text-secondary font-semibold mb-8">
                        Report ID: ILA-{reportId}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link to="/">
                            <Button variant="secondary">Go Home</Button>
                        </Link>
                        <Button variant="primary" onClick={() => { setIsSubmitted(false); setFormData({ title: '', category: '', location: '', description: '' }); setFiles([]); setIsAnonymous(false); }}>
                            File Another
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Decorative Panel – Warning-toned */}
            <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-red-700 via-amber-600 to-red-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-16 left-16 w-72 h-72 bg-yellow-200 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-24 right-10 w-80 h-80 bg-red-300 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-orange-200 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center items-center w-full px-14 text-white">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-3 mb-10"
                    >
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <ShieldAlert size={24} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">CivicConnect</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6"
                    >
                        <AlertTriangle size={32} className="text-yellow-300" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-bold text-center mb-4 leading-tight"
                    >
                        Report Illegal<br />Activity
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="text-white/70 text-center text-lg max-w-xs leading-relaxed"
                    >
                        Stand against corruption and illegal activities. Your identity can remain confidential.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-14 space-y-4 w-full max-w-xs"
                    >
                        {[
                            { icon: Lock, text: 'Option to report anonymously' },
                            { icon: FileText, text: 'Upload proof and evidence' },
                            { icon: MapPin, text: 'Pinpoint the exact location' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                                <item.icon size={20} className="text-yellow-300 flex-shrink-0" />
                                <span className="text-sm text-white/80">{item.text}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="w-full lg:w-[58%] flex items-start justify-center bg-neutral-50 px-6 py-10 overflow-y-auto">
                <div className="w-full max-w-xl">
                    {/* Mobile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:hidden flex items-center gap-2 mb-6 justify-center"
                    >
                        <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
                            <ShieldAlert size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-primary">CivicConnect</span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-neutral-900">Report Illegal Activity</h1>
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Confidential</span>
                        </div>
                        <p className="text-neutral-500 mb-6">Provide details and evidence. Your report helps build a safer community.</p>
                    </motion.div>

                    {/* Auto-filled Nagarpalika Info */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                        <MapPin size={18} className="text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-red-500 font-semibold uppercase tracking-wide">Reporting to</p>
                            <p className="text-sm font-bold text-neutral-800">{user?.area} <span className="font-normal text-neutral-500">· {user?.taluka} Taluka</span></p>
                        </div>
                    </motion.div>

                    <motion.form
                        onSubmit={handleSubmit}
                        variants={stagger}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6"
                    >
                        {/* Anonymous Toggle */}
                        <motion.div variants={fadeUp}>
                            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                                <div className="flex items-center gap-3">
                                    {isAnonymous ? <EyeOff size={20} className="text-amber-600" /> : <Eye size={20} className="text-amber-600" />}
                                    <div>
                                        <p className="text-sm font-medium text-amber-900">Anonymous Reporting</p>
                                        <p className="text-xs text-amber-600">Your identity will not be disclosed</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAnonymous(!isAnonymous)}
                                    className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${isAnonymous ? 'bg-amber-500' : 'bg-neutral-300'}`}
                                >
                                    <motion.div
                                        layout
                                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                                        style={{ left: isAnonymous ? '26px' : '4px' }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>
                        </motion.div>

                        {/* Issue Title */}
                        <motion.div variants={fadeUp}>
                            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Issue Title <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <AlertTriangle size={18} className="text-neutral-400" />
                                </div>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Brief title for the issue"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition-all duration-200"
                                />
                            </div>
                        </motion.div>

                        {/* Category Dropdown */}
                        <motion.div variants={fadeUp}>
                            <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Category <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Megaphone size={18} className="text-neutral-400" />
                                </div>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-10 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition-all duration-200 appearance-none"
                                >
                                    {issueCategories.map(cat => (
                                        <option key={cat.value} value={cat.value} disabled={cat.value === ''}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                    <ChevronDown size={18} className="text-neutral-400" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Proof Upload */}
                        <motion.div variants={fadeUp}>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Upload Proof
                            </label>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragOver ? 'border-red-400 bg-red-50/60 scale-[1.01]' : 'border-neutral-200 bg-white hover:border-red-300 hover:bg-red-50/30'}`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*,.pdf,.doc,.docx"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                                        <Upload size={22} className="text-red-500" />
                                    </div>
                                    <p className="text-sm text-neutral-600 font-medium">
                                        Drag & drop evidence here or <span className="text-red-500">browse</span>
                                    </p>
                                    <p className="text-xs text-neutral-400">Photos, videos, or documents (max 5 files)</p>
                                </div>
                            </div>

                            <AnimatePresence>
                                {files.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex flex-wrap gap-3 mt-4"
                                    >
                                        {files.map((f, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="relative group w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 shadow-sm"
                                            >
                                                {f.type === 'image' ? (
                                                    <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                                                        <Video size={24} className="text-neutral-400" />
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Location */}
                        <motion.div variants={fadeUp}>
                            <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Location <span className="text-red-400">*</span>
                            </label>
                            <LocationAutocomplete
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={(val) => setFormData({ ...formData, location: val })}
                                required
                                placeholder="Address, landmark, or area name"
                                accentColor="red"
                                userArea={user?.area}
                                userTaluka={user?.taluka}
                            />
                        </motion.div>

                        {/* Description */}
                        <motion.div variants={fadeUp}>
                            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Description <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    maxLength={500}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Provide detailed information about the illegal activity — what you observed, when, and any persons involved..."
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400 transition-all duration-200 resize-none"
                                />
                                <span className="absolute bottom-3 right-3 text-xs text-neutral-400">
                                    {formData.description.length}/500
                                </span>
                            </div>
                        </motion.div>

                        {/* Submit */}
                        <motion.div variants={fadeUp} className="pt-2">
                            <Button
                                variant="primary"
                                className={`w-full py-3.5 rounded-xl text-base bg-red-600 hover:bg-red-700 focus:ring-red-500/50 ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting Report...
                                    </div>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Report
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </motion.form>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-center text-xs text-neutral-400 mt-8 mb-4"
                    >
                        <Link to="/" className="hover:text-red-500 transition-colors">
                            ← Back to Home
                        </Link>
                    </motion.p>
                </div>
            </div>
        </div>
    );
};

export default ReportIllegalActivity;
