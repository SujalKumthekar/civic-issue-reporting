import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X, Shield } from 'lucide-react';

const INVESTIGATION_TYPES = [
  'Evidence Collection',
  'Official Notice',
  'FIR Filing',
  'Order Issued',
  'Demolition',
  'Fine'
];

const DEPARTMENTS = [
  'Police',
  'Corporate',
  'NGO',
  'Fire Brigade',
  'Revenue Department',
  'Environmental Agency'
];

const COMPLIANCE_STATUSES = [
  'No Violation',
  'Violation Confirmed',
  'Action Recommended'
];

const NEXT_LEGAL_STEPS = [
  'Court Case',
  'Appellate',
  'Enforcement',
  'Monitoring',
  'Resolved'
];

const AddLegalActionForm = ({ issueId, onActionAdded, onClose }) => {
  const [formData, setFormData] = useState({
    investigationType: 'Evidence Collection',
    actionDescription: '',
    legalOfficer: '',
    involvedDepartments: [],
    legalReferences: '',
    evidenceCollected: '',
    cloudinaryPhotoUrls: [],
    noticeFirDetails: '',
    complianceStatus: 'No Violation',
    nextLegalStep: 'Monitoring',
    officerNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDepartment = (dept) => {
    setFormData(prev => ({
      ...prev,
      involvedDepartments: prev.involvedDepartments.includes(dept)
        ? prev.involvedDepartments.filter(d => d !== dept)
        : [...prev.involvedDepartments, dept]
    }));
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;

    const uploadedUrls = [];
    for (let i = 0; i < files.length && i < 10; i++) {
      const file = files[i];
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.post('http://localhost:5000/api/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
        });
        uploadedUrls.push(response.data.url);
      } catch (err) {
        setError(`Failed to upload photo: ${err.message}`);
      }
    }

    setUploadedPhotos([...uploadedPhotos, ...uploadedUrls]);
    setFormData(prev => ({
      ...prev,
      cloudinaryPhotoUrls: [...prev.cloudinaryPhotoUrls, ...uploadedUrls]
    }));
  };

  const removePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      cloudinaryPhotoUrls: prev.cloudinaryPhotoUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.actionDescription.trim()) {
      setError('Action description is required');
      return;
    }
    if (!formData.legalOfficer.trim()) {
      setError('Legal officer name is required');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('http://localhost:5000/api/action-points', {
        issueId,
        actionDescription: `[${formData.investigationType}] ${formData.actionDescription}`,
        category: 'LEGAL_ACTION',
        performedBy: formData.legalOfficer,
        cloudinaryPhotoUrls: formData.cloudinaryPhotoUrls,
        statusAfterAction: 'IN_PROGRESS',
        notes: [
          formData.involvedDepartments.length > 0 ? `Departments: ${formData.involvedDepartments.join(', ')}` : '',
          formData.legalReferences ? `Legal Refs: ${formData.legalReferences}` : '',
          formData.evidenceCollected ? `Evidence: ${formData.evidenceCollected}` : '',
          formData.noticeFirDetails ? `Notice/FIR: ${formData.noticeFirDetails}` : '',
          `Compliance: ${formData.complianceStatus}`,
          `Next Step: ${formData.nextLegalStep}`,
          formData.officerNotes ? `Officer Notes: ${formData.officerNotes}` : ''
        ].filter(Boolean).join(' | '),
        isLegalAction: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setError('');
      onActionAdded(response.data.actionPoint);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add legal action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Add Legal Action</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Investigation Type & Legal Officer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investigation Type *
              </label>
              <select
                name="investigationType"
                value={formData.investigationType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {INVESTIGATION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legal Officer *
              </label>
              <input
                type="text"
                name="legalOfficer"
                value={formData.legalOfficer}
                onChange={handleInputChange}
                placeholder="Assigned legal officer name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Description *
            </label>
            <textarea
              name="actionDescription"
              value={formData.actionDescription}
              onChange={handleInputChange}
              placeholder="Detailed description of the legal action taken"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="3"
            />
          </div>

          {/* Involved Departments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Involved Departments
            </label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => toggleDepartment(dept)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    formData.involvedDepartments.includes(dept)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Legal References */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legal References
            </label>
            <input
              type="text"
              name="legalReferences"
              value={formData.legalReferences}
              onChange={handleInputChange}
              placeholder="e.g., Land Acquisition Act 1894, Section 3.2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Evidence Collected */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence Collected
            </label>
            <textarea
              name="evidenceCollected"
              value={formData.evidenceCollected}
              onChange={handleInputChange}
              placeholder="GPS coordinates, property documents, witness statements, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="2"
            />
          </div>

          {/* Notice/FIR Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notice / FIR / Order Details
            </label>
            <input
              type="text"
              name="noticeFirDetails"
              value={formData.noticeFirDetails}
              onChange={handleInputChange}
              placeholder="e.g., Notice issued on 2026-03-19 - Ref: NO/2026/345"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Compliance Status & Next Step */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compliance Status
              </label>
              <select
                name="complianceStatus"
                value={formData.complianceStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {COMPLIANCE_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Legal Step
              </label>
              <select
                name="nextLegalStep"
                value={formData.nextLegalStep}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {NEXT_LEGAL_STEPS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Officer Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidential Officer Notes
            </label>
            <textarea
              name="officerNotes"
              value={formData.officerNotes}
              onChange={handleInputChange}
              placeholder="Internal notes (not visible to citizens)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="2"
            />
          </div>

          {/* Photo/Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence Photos/Videos (max 10)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-red-600 hover:text-red-800 font-medium">
                  Click to upload evidence
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadedPhotos.length >= 10}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-600 mt-1">
                ({uploadedPhotos.length}/10 files uploaded)
              </p>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                {uploadedPhotos.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit Legal Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLegalActionForm;
