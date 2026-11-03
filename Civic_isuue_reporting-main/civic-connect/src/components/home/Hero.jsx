import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import { ArrowRight, MapPin } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 bg-gray-900">
                <img
                    src="https://www.smartcity311.com/_s311/static/media/hero-banner.4a7e9cb0.webp?fm=webp&q=75&w=1920"
                    alt="Civic Issue Reporting Process"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/bg.svg"; // Fallback to local SVG if external image fails
                    }}
                />
                {/* Dark overlay to ensure text readability against the illustration */}
                <div className="absolute inset-0 bg-gray-900/80" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-secondary/20 border border-secondary/30 text-blue-200 text-sm font-semibold mb-6 backdrop-blur-sm">
                        Civic Issue Reporting System
                    </span>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                        Building a Better <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">City Together</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Empowering citizens to report infrastructure issues, track progress, and ensure transparent governance. Your voice matters.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/report-civic-issue">
                            <Button variant="primary" className="w-full sm:w-auto text-lg shadow-blue-500/25 shadow-xl">
                                Report an Issue <ArrowRight size={20} />
                            </Button>
                        </Link>
                        <Link to="/dashboard/reports">
                            <Button variant="outline" className="w-full sm:w-auto text-lg">
                                Track Complaint
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-8 text-gray-400 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-secondary" />
                            <span>Location Verified</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                        <div>24/7 Support</div>
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                        <div>Secure & Private</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
