import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X } from 'lucide-react';

const CompleteIssueForm = ({ issueId, allocatedBudget, utilizedBudget, onIssueCompleted, onClose }) => {
  const [formData, setFormData] = useState({
    completionDate: new Date().toISOString().split('T')[0],
    workSummary: '',
    qualityCheckStatus: 'PASSED',
    qualityOfficer: '',
    qualityCheckDate: new Date().toISOString().split('T')[0],
    qualityCheckReportUrl: '',
    preWorkPhotoUrl: '',
    duringWorkPhotoUrl: '',
    postCompletionPhotoUrl: '',
    completionCertificateUrl: '',
    responsibleOfficer: '',
    approvedBy: '',
    citizenFeedback: '',
    citizenRating: 5,
    approvedBudget: allocatedBudget || 0,
    actualCost: utilizedBudget || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState({
    preWork: '',
    during: '',
    postCompletion: '',
    certificate: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handlePhotoUpload = async (e, photoType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const photoUrl = response.data.url;
      setUploadedPhotos(prev => ({
        ...prev,
        [photoType]: photoUrl
      }));

      // Map photoType to form field
      const fieldMap = {
        'preWork': 'preWorkPhotoUrl',
        'during': 'duringWorkPhotoUrl',
        'postCompletion': 'postCompletionPhotoUrl',
        'certificate': 'completionCertificateUrl'
      };

      setFormData(prev => ({
        ...prev,
        [fieldMap[photoType]]: photoUrl
      }));
    } catch (err) {
      setError(`Failed to upload photo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.workSummary.trim()) {
      setError('Work summary is required');
      return;
    }

    if (!formData.preWorkPhotoUrl) {
      setError('Before photo is required');
      return;
    }

    if (!formData.postCompletionPhotoUrl) {
      setError('After photo is required');
      return;
    }

    if (!formData.qualityOfficer.trim()) {
      setError('Quality officer name is required');
      return;
    }

    if (!formData.responsibleOfficer.trim()) {
      setError('Responsible officer name is required');
      return;
    }

    if (!formData.approvedBy.trim()) {
      setError('Approver name is required');
      return;
    }

    if (formData.citizenRating < 1 || formData.citizenRating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/completions`, {
        issueId,
        ...formData
      });

      setError('');
      onIssueCompleted(response.data.completion);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Complete Issue</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Completion Date & Work Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Date *
              </label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Check Date *
              </label>
              <input
                type="date"
                name="qualityCheckDate"
                value={formData.qualityCheckDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Work Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Summary *
            </label>
            <textarea
              name="workSummary"
              value={formData.workSummary}
              onChange={handleInputChange}
              placeholder="What work was completed?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          {/* Quality Check Status & Officer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Check Status *
              </label>
              <select
                name="qualityCheckStatus"
                value={formData.qualityCheckStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Officer *
              </label>
              <input
                type="text"
                name="qualityOfficer"
                value={formData.qualityOfficer}
                onChange={handleInputChange}
                placeholder="Officer name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Responsible Officer & Approved By */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsible Officer *
              </label>
              <input
                type="text"
                name="responsibleOfficer"
                value={formData.responsibleOfficer}
                onChange={handleInputChange}
                placeholder="Officer name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approved By *
              </label>
              <input
                type="text"
                name="approvedBy"
                value={formData.approvedBy}
                onChange={handleInputChange}
                placeholder="Approver name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Photos */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Before & After Photos</h3>
            
            {/* Before Photo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Before Photo *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {uploadedPhotos.preWork ? (
                  <img src={uploadedPhotos.preWork} alt="Before" className="w-full h-40 object-cover rounded" />
                ) : (
                  <label className="cursor-pointer text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-blue-600 hover:text-blue-800 font-medium">Upload before photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'preWork')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* During Photo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                During Work Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {uploadedPhotos.during ? (
                  <img src={uploadedPhotos.during} alt="During" className="w-full h-40 object-cover rounded" />
                ) : (
                  <label className="cursor-pointer text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-blue-600 hover:text-blue-800 font-medium">Upload during photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'during')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* After Photo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                After Photo *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {uploadedPhotos.postCompletion ? (
                  <img src={uploadedPhotos.postCompletion} alt="After" className="w-full h-40 object-cover rounded" />
                ) : (
                  <label className="cursor-pointer text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <span className="text-blue-600 hover:text-blue-800 font-medium">Upload after photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'postCompletion')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Budget Summary */}
          <div className="border-t pt-4 grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
            <div>
              <p className="text-sm text-gray-600">Approved Budget</p>
              <p className="text-2xl font-bold text-gray-900">₹{formData.approvedBudget}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Actual Cost</p>
              <p className="text-2xl font-bold text-blue-700">₹{formData.actualCost}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Variance</p>
              <p className={`text-2xl font-bold ${formData.actualCost <= formData.approvedBudget ? 'text-green-700' : 'text-red-700'}`}>
                ₹{formData.approvedBudget - formData.actualCost}
              </p>
            </div>
          </div>

          {/* Feedback & Rating */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Citizen Feedback</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback
              </label>
              <textarea
                name="citizenFeedback"
                value={formData.citizenFeedback}
                onChange={handleInputChange}
                placeholder="Any feedback from citizen"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (1-5 stars) *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, citizenRating: star }))}
                    className={`text-3xl transition ${
                      formData.citizenRating >= star ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    {'⭐'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end border-t pt-6">
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Completing...' : 'Complete Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteIssueForm;
