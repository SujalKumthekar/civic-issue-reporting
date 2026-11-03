import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, TrendingUp, Users } from 'lucide-react';

const StatItem = ({ icon: Icon, value, label, color }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100"
    >
        <div className={`p-3 rounded-full ${color} bg-opacity-10 mb-3`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        <span className="text-3xl font-bold text-gray-800">{value}</span>
        <span className="text-sm text-gray-500 font-medium">{label}</span>
    </motion.div>
);

const StatsBanner = () => {
    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatItem
                        icon={CheckCircle}
                        value="12,450"
                        label="Issues Resolved"
                        color="bg-green-500"
                    />
                    <StatItem
                        icon={AlertCircle}
                        value="543"
                        label="Active Reports"
                        color="bg-orange-500"
                    />
                    <StatItem
                        icon={TrendingUp}
                        value="89%"
                        label="Resolution Rate"
                        color="bg-blue-500"
                    />
                    <StatItem
                        icon={Users}
                        value="45k+"
                        label="Active Citizens"
                        color="bg-purple-500"
                    />
                </div>
            </div>
        </section>
    );
};

export default StatsBanner;
