import { motion } from 'framer-motion';
import { CheckCircle2, Clock, CircleDot, Activity } from 'lucide-react';

const steps = [
    { id: 'submitted', label: 'Submitted', description: 'Report received', icon: Clock },
    { id: 'review', label: 'Under Review', description: 'Authorities reviewing', icon: CircleDot },
    { id: 'progress', label: 'In Progress', description: 'Action being taken', icon: Activity },
    { id: 'resolved', label: 'Resolved', description: 'Issue fixed', icon: CheckCircle2 }
];

const ReportTrackingTimeline = ({ currentStatusIndex = 0 }) => {
    return (
        <div className="w-full py-4">
            <div className="relative flex justify-between items-start">
                {/* Progress bar line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-neutral-200 rounded-full z-0" />
                <div 
                    className="absolute top-5 left-0 h-1 bg-secondary rounded-full z-0 transition-all duration-700 ease-in-out" 
                    style={{ width: `${(currentStatusIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const StatusIcon = step.icon;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 transition-colors duration-500 bg-white ${
                                    isCompleted
                                        ? 'border-secondary bg-secondary text-white'
                                        : isCurrent
                                        ? 'border-secondary text-secondary shadow-lg shadow-secondary/30 ring-4 ring-secondary/20 bg-white'
                                        : 'border-neutral-300 text-neutral-400 bg-white'
                                }`}
                            >
                                <StatusIcon size={20} className={isCompleted ? 'text-white' : ''} />
                            </motion.div>
                            
                            <motion.div 
                                initial={{ y: 5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 + 0.1 }}
                                className="mt-3 text-center px-1"
                            >
                                <p className={`text-xs sm:text-sm font-semibold mb-0.5 ${
                                    isCompleted || isCurrent ? 'text-neutral-900' : 'text-neutral-500'
                                }`}>
                                    {step.label}
                                </p>
                                <p className={`text-[10px] sm:text-xs hidden sm:block ${
                                    isCurrent ? 'text-secondary font-medium' : 'text-neutral-400'
                                }`}>
                                    {step.description}
                                </p>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReportTrackingTimeline;
