import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    MapPin, Car, Trash2, Droplets, Lightbulb, Construction, HelpCircle,
    FileText, Upload, X, Image, Video, Send, CheckCircle2
} from 'lucide-react';
import Button from '../../components/common/Button';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';
import { useAuth } from '../../context/AuthContext';

const issueTypes = [
    { id: 'road', label: 'Road & Potholes', icon: Car, color: 'bg-orange-100 text-orange-600 border-orange-200', active: 'bg-orange-500 text-white border-orange-500' },
    { id: 'garbage', label: 'Garbage', icon: Trash2, color: 'bg-green-100 text-green-600 border-green-200', active: 'bg-green-500 text-white border-green-500' },
    { id: 'water', label: 'Water Supply', icon: Droplets, color: 'bg-blue-100 text-blue-600 border-blue-200', active: 'bg-blue-500 text-white border-blue-500' },
    { id: 'streetlight', label: 'Street Light', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-600 border-yellow-200', active: 'bg-yellow-500 text-white border-yellow-500' },
    { id: 'drainage', label: 'Drainage', icon: Construction, color: 'bg-purple-100 text-purple-600 border-purple-200', active: 'bg-purple-500 text-white border-purple-500' },
    { id: 'other', label: 'Other', icon: HelpCircle, color: 'bg-gray-100 text-gray-600 border-gray-200', active: 'bg-gray-600 text-white border-gray-600' },
];

const ReportCivicIssue = () => {
    const { user } = useAuth();
    const [issueType, setIssueType] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [complaintId, setComplaintId] = useState('');
    const fileInputRef = useRef(null);

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
        if (!issueType) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const fd = new FormData();
            fd.append('issueType', issueType);
            fd.append('description', description);
            fd.append('location', location);
            fd.append('taluka', user.taluka);
            fd.append('nagarpalika', user.area);
            files.forEach((f) => fd.append('media', f.file));

            const res = await fetch('http://localhost:5000/api/issues/civic', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setComplaintId(data._id.slice(-8).toUpperCase());
            setIsSubmitted(true);
        } catch (err) {
            alert(err.message || 'Submission failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
                    <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Complaint Submitted!</h2>
                    <p className="text-neutral-500 mb-2">Your complaint has been filed successfully. You will receive updates on its status.</p>
                    <p className="text-sm text-secondary font-semibold mb-8">Complaint ID: CIV-{complaintId}</p>
                    <div className="flex gap-3 justify-center">
                        <Link to="/dashboard"><Button variant="secondary">Go to Dashboard</Button></Link>
                        <Button variant="primary" onClick={() => { setIsSubmitted(false); setIssueType(''); setDescription(''); setLocation(''); setFiles([]); }}>
                            File Another
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Decorative Panel */}
            <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-secondary via-blue-600 to-primary relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-32 right-16 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-yellow-300 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-center items-center w-full px-14 text-white">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="flex items-center gap-3 mb-10">
                        <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">C</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">CivicConnect</span>
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="text-4xl font-bold text-center mb-4 leading-tight">
                        Report a<br />Civic Issue
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-white/70 text-center text-lg max-w-xs leading-relaxed">
                        Help us improve your neighborhood. Report roads, garbage, water, and other civic problems in your area.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-14 space-y-4 w-full max-w-xs">
                        {[
                            { icon: MapPin, text: `${user?.taluka} · ${user?.area}` },
                            { icon: FileText, text: 'Describe the issue clearly' },
                            { icon: Image, text: 'Attach photos or videos' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                                <item.icon size={20} className="text-accent flex-shrink-0" />
                                <span className="text-sm text-white/80">{item.text}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="w-full lg:w-[58%] flex items-start justify-center bg-neutral-50 px-6 py-10 overflow-y-auto">
                <div className="w-full max-w-xl">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="lg:hidden flex items-center gap-2 mb-6 justify-center">
                        <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-primary">CivicConnect</span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Report Civic Issue</h1>
                        <p className="text-neutral-500 mb-6">Fill in the details below to submit your complaint.</p>
                    </motion.div>

                    {/* Auto-filled Nagarpalika Info */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
                        <MapPin size={18} className="text-secondary flex-shrink-0" />
                        <div>
                            <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Reporting to</p>
                            <p className="text-sm font-bold text-neutral-800">{user?.area} <span className="font-normal text-neutral-500">· {user?.taluka} Taluka</span></p>
                        </div>
                    </motion.div>

                    <motion.form onSubmit={handleSubmit} variants={stagger} initial="hidden" animate="visible" className="space-y-6">

                        {/* Issue Type */}
                        <motion.div variants={fadeUp}>
                            <label className="block text-sm font-medium text-neutral-700 mb-2.5">
                                Issue Type <span className="text-red-400">*</span>
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {issueTypes.map((type) => {
                                    const isActive = issueType === type.id;
                                    return (
                                        <motion.button
                                            key={type.id}
                                            type="button"
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => setIssueType(type.id)}
                                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${isActive ? type.active + ' shadow-md' : type.color + ' hover:shadow-sm'}`}
                                        >
                                            <type.icon size={18} />
                                            <span>{type.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Location */}
                        <motion.div variants={fadeUp}>
                            <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-1.5">
                                Exact Location <span className="text-red-400">*</span>
                            </label>
                            <LocationAutocomplete
                                id="location"
                                value={location}
                                onChange={setLocation}
                                required
                                placeholder="e.g. Near SBI Bank, Main Road, Sector 4"
                                accentColor="secondary"
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
                                    rows={4}
                                    maxLength={500}
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the issue in detail — severity, how long it's been a problem..."
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all duration-200 resize-none"
                                />
                                <span className="absolute bottom-3 right-3 text-xs text-neutral-400">{description.length}/500</span>
                            </div>
                        </motion.div>

                        {/* File Upload */}
                        <motion.div variants={fadeUp}>
                            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Upload Photo / Video</label>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragOver ? 'border-secondary bg-blue-50/60 scale-[1.01]' : 'border-neutral-200 bg-white hover:border-secondary/40 hover:bg-blue-50/30'}`}
                            >
                                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                        <Upload size={22} className="text-secondary" />
                                    </div>
                                    <p className="text-sm text-neutral-600 font-medium">Drag & drop files here or <span className="text-secondary">browse</span></p>
                                    <p className="text-xs text-neutral-400">Images & videos accepted (max 5 files)</p>
                                </div>
                            </div>
                            <AnimatePresence>
                                {files.length > 0 && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-3 mt-4">
                                        {files.map((f, i) => (
                                            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                                                {f.type === 'image' ? (
                                                    <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                                                        <Video size={24} className="text-neutral-400" />
                                                    </div>
                                                )}
                                                <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X size={12} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Submit */}
                        <motion.div variants={fadeUp} className="pt-2">
                            <Button variant="primary" className={`w-full py-3.5 rounded-xl text-base ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}>
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </div>
                                ) : (
                                    <><Send size={18} /> Submit Complaint</>
                                )}
                            </Button>
                        </motion.div>
                    </motion.form>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center text-xs text-neutral-400 mt-8 mb-4">
                        <Link to="/" className="hover:text-secondary transition-colors">← Back to Home</Link>
                    </motion.p>
                </div>
            </div>
        </div>
    );
};

export default ReportCivicIssue;
