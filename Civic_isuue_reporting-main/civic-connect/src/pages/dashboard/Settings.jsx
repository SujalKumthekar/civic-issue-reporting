import React from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const Settings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                   <button
                     onClick={() => navigate(-1)}
                     className="flex items-center gap-2 text-primary hover:text-secondary font-medium mb-4 transition-colors"
                   >
                     <ArrowLeft className="w-4 h-4" />
                     Back to Dashboard
                   </button>
                    <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
                    <p className="text-neutral-500 mt-1 text-sm">Manage your account preferences and user settings.</p>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                    <div className="p-6 sm:p-8 space-y-8">
                        {/* Profile Section */}
                        <section>
                            <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <User className="text-secondary" size={20} />
                                Profile Information
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={user?.name || ''} 
                                        readOnly 
                                        className="w-full px-4 py-2 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-500 focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={user?.email || ''} 
                                        readOnly 
                                        className="w-full px-4 py-2 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-500 focus:outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </section>

                        <hr className="border-neutral-200" />

                        {/* Notifications Section */}
                        <section>
                            <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Bell className="text-secondary" size={20} />
                                Notification Preferences
                            </h2>
                            <div className="space-y-4">
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="w-4 h-4 text-secondary rounded focus:ring-secondary/30 accent-secondary" defaultChecked />
                                    <span className="text-sm font-medium text-neutral-700">Email notifications for issue updates</span>
                                </label>
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="w-4 h-4 text-secondary rounded focus:ring-secondary/30 accent-secondary" defaultChecked />
                                    <span className="text-sm font-medium text-neutral-700">Push notifications for new community issues in my area</span>
                                </label>
                            </div>
                        </section>

                        <hr className="border-neutral-200" />

                        {/* Security Section */}
                        <section>
                            <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Shield className="text-secondary" size={20} />
                                Security
                            </h2>
                            <p className="text-sm text-neutral-500 mb-4">Update your password or configure two-factor authentication.</p>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Lock size={16} /> Change Password
                            </Button>
                        </section>

                    </div>
                    <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex justify-end gap-3">
                        <Button variant="outline">Cancel</Button>
                        <Button variant="primary">Save Changes</Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
