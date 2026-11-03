import { motion } from 'framer-motion';
import Card from '../common/Card';
import { Car, Lightbulb, Droplets, Trash2, ShieldAlert, Construction, ArrowRight } from 'lucide-react';

const categories = [
    { icon: Car, title: 'Roads & Potholes', desc: 'Report damaged roads, potholes, or uneven surfaces.' },
    { icon: Trash2, title: 'Garbage & Waste', desc: 'Uncollected trash, illegal dumping, or overflowing bins.' },
    { icon: Lightbulb, title: 'Street Lights', desc: 'Malfunctioning or broken street lights in your area.' },
    { icon: Droplets, title: 'Water Supply', desc: 'Leakages, contamination, or irregular water supply.' },
    { icon: ShieldAlert, title: 'Civic Violation', desc: 'Illegal parking, encroachments, or public nuisance.' },
    { icon: Construction, title: 'Drainage', desc: 'Clogged drains, waterlogging, or sewage issues.' }, // construction as placeholder for drainage tool
];

const ServicesGrid = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6 text-center">
                <div className="mb-16">
                    <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Report With Ease</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2">What would you like to report?</h2>
                    <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                        Select a category below to start your report. Our automated system ensures your complaint reaches the right department instantly.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((cat, index) => (
                        <Card key={index} className="group cursor-pointer hover:border-secondary/30 text-left">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                                <cat.icon size={24} className="text-secondary group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{cat.title}</h3>
                            <p className="text-gray-500 mb-6 text-sm leading-relaxed">{cat.desc}</p>
                            <div className="flex items-center text-secondary font-semibold text-sm group-hover:gap-2 transition-all">
                                Report Issue <ArrowRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesGrid;
