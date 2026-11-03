import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ChevronDown, Car, Trash2, Droplets, Lightbulb, Construction, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReportTrackingTimeline from './ReportTrackingTimeline';

const getIconForType = (type) => {
    const normalizedType = typeof type === 'string' ? type.toLowerCase() : '';
    switch (normalizedType) {
        case 'road': return Car;
        case 'garbage': return Trash2;
        case 'water': return Droplets;
        case 'light': return Lightbulb;
        case 'drainage': return Construction;
        case 'illegal': return Shield;
        default: return FileText;
    }
};

const getColorForType = (type) => {
    const normalizedType = typeof type === 'string' ? type.toLowerCase() : '';
    switch (normalizedType) {
        case 'road': return 'bg-orange-100 text-orange-600';
        case 'garbage': return 'bg-green-100 text-green-600';
        case 'water': return 'bg-blue-100 text-blue-600';
        case 'light': return 'bg-yellow-100 text-yellow-600';
        case 'drainage': return 'bg-purple-100 text-purple-600';
        case 'illegal': return 'bg-red-100 text-red-600';
        default: return 'bg-gray-100 text-gray-600';
    }
};

const getStatusBadge = (statusIndex) => {
    switch (statusIndex) {
        case 0: return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-neutral-100 text-neutral-600">Submitted</span>;
        case 1: return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-600 tracking-wide">Under Review</span>;
        case 2: return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">In Progress</span>;
        case 3: return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-600">Pending</span>;
        case 4: return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 font-bold">Resolved</span>;
        default: return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 font-bold">Resolved</span>;
    }
};

const ReportCard = ({ report, delay = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const Icon = getIconForType(report.type);
    const colorClass = getColorForType(report.type);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                isExpanded ? 'border-secondary/40 shadow-xl shadow-secondary/5' : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'
            }`}
        >
            <div 
                className="p-5 sm:p-6 cursor-pointer select-none flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${colorClass} shrink-0 shadow-sm border border-black/5`}>
                        <Icon size={22} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-base font-bold text-neutral-900 truncate">{report.title}</h3>
                            <span className="text-xs text-neutral-400 font-medium px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 uppercase tracking-wider">
                                {report.id}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-500 mt-2 flex-wrap">
                            <span className="flex items-center gap-1 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100">
                                <Calendar size={14} className="text-neutral-400" />
                                {report.date}
                            </span>
                            <span className="flex items-center gap-1 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100 truncate max-w-[150px] sm:max-w-xs">
                                <MapPin size={14} className="text-neutral-400" />
                                {report.location}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0 pl-16 sm:pl-0">
                    {getStatusBadge(report.statusIndex)}
                    <button className={`p-1.5 rounded-full hover:bg-neutral-100 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-neutral-100' : ''}`}>
                        <ChevronDown size={20} className="text-neutral-500" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="border-t border-neutral-100 bg-neutral-50/50"
                    >
                        <div className="p-5 sm:p-6 sm:pl-20 border-b border-neutral-100">
                            <h4 className="text-sm font-semibold text-neutral-900 mb-2">Description</h4>
                            <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                                {report.description}
                            </p>
                            
                            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Tracking Status</h4>
                            <div className="bg-white p-4 sm:p-6 rounded-xl border border-neutral-200 shadow-sm">
                                <ReportTrackingTimeline currentStatusIndex={report.statusIndex} />
                            </div>
                        </div>
                        
                        <div className="px-5 py-3 sm:px-6 sm:pl-20 bg-neutral-50 flex items-center justify-between">
                            <span className="text-xs text-neutral-500">Last updated: {report.lastUpdated}</span>
                            <Link to={`/issues/${report.id}`} className="text-sm text-secondary font-medium hover:text-primary transition-colors hover:underline">
                                View Full Details →
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ReportCard;
