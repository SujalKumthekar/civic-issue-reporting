import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-primary text-white pt-20 pb-10 border-t border-white/10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <span className="text-2xl font-bold tracking-tight">CivicConnect</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Empowering citizens to build better communities through transparent and efficient issue reporting.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary transition-colors"><Facebook size={16} /></a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary transition-colors"><Twitter size={16} /></a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary transition-colors"><Instagram size={16} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Transparency Report</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Categories</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Roads & Traffic</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Waste Management</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Water & Drainage</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Public Safety</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Parks & Recreation</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-secondary shrink-0" />
                                <span>123 Civic Center Drive,<br />Metropolis, NY 10012</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-secondary shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-secondary shrink-0" />
                                <span>support@civicconnect.gov</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; 2026 CivicConnect. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
