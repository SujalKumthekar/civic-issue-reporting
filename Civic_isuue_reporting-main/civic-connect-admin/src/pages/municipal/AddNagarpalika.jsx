import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building2, User, Lock, MapPin, Eye, EyeOff, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';

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

const AddNagarpalika = () => {
  const { admin } = useAdminAuth();
  const [nagarpalikas, setNagarpalikas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', taluka: '', username: '', password: '' });

  const token = localStorage.getItem('adminToken');

  const fetchNagarpalikas = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/nagarpalikas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setNagarpalikas(data);
    } catch {}
  };

  useEffect(() => { fetchNagarpalikas(); }, []);

  const handleTalukaChange = (e) => {
    setFormData({ ...formData, taluka: e.target.value, name: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/nagarpalikas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(`Nagarpalika "${data.name}" added successfully.`);
      setFormData({ name: '', taluka: '', username: '', password: '' });
      fetchNagarpalikas();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Nagarpalikas</h1>
          <p className="text-slate-500 mt-1 text-sm">Add and manage local bodies under {admin?.districtName} District.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <Plus size={20} className="text-primary" /> Add New Nagarpalika
            </h2>

            {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
            {success && <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Taluka Dropdown */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Taluka</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPin size={17} className="text-slate-400" />
                  </div>
                  <select
                    value={formData.taluka}
                    onChange={handleTalukaChange}
                    required
                    className={`w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer ${formData.taluka === '' ? 'text-slate-400' : 'text-slate-900'}`}
                  >
                    <option value="" disabled>Select Taluka</option>
                    {Object.keys(puneData).map((t) => (
                      <option key={t} value={t} className="text-slate-900">{t} Taluka</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown size={16} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Nagarpalika Dropdown */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nagarpalika Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building2 size={17} className="text-slate-400" />
                  </div>
                  <select
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={!formData.taluka}
                    className={`w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${formData.name === '' ? 'text-slate-400' : 'text-slate-900'}`}
                  >
                    <option value="" disabled>
                      {formData.taluka ? 'Select Nagarpalika' : 'Select a taluka first'}
                    </option>
                    {formData.taluka && puneData[formData.taluka].map((np) => (
                      <option key={np} value={np} className="text-slate-900">{np}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown size={16} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Login Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User size={17} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    placeholder="e.g. pmc_admin"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={17} className="text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-primary text-white font-semibold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60 text-sm mt-2"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div> : 'Add Nagarpalika'}
              </button>
            </form>
          </div>

          {/* Registered List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Registered Nagarpalikas</h2>
            {nagarpalikas.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Building2 size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No nagarpalikas added yet.</p>
              </div>
            ) : (
              <ul className="space-y-3 overflow-y-auto max-h-96 pr-1">
                {nagarpalikas.map((np) => (
                  <motion.li
                    key={np._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{np.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{np.taluka} Taluka · @{np.username}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-full">Active</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddNagarpalika;
