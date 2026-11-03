import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Plus, X } from 'lucide-react';

const AddActionPointForm = ({ issueId, onActionAdded, onClose }) => {
  const [formData, setFormData] = useState({
    actionDescription: '',
    category: 'INSPECTION',
    performedBy: '',
    timeDuration: 0,
    resourcesUsed: '',
    locationDetails: '',
    cloudinaryPhotoUrls: [],
    costIncurred: 0,
    statusAfterAction: 'IN_PROGRESS',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;

    const uploadedUrls = [];
    for (let i = 0; i < files.length && i < 5; i++) {
      const file = files[i];

      // Create FormData for multipart upload (assuming your upload middleware handles this)
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      try {
        const response = await axios.post('http://localhost:5000/api/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
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

    if (formData.cloudinaryPhotoUrls.length === 0) {
      setError('At least one photo is required');
      return;
    }

    if (!formData.performedBy.trim()) {
      setError('Officer name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/action-points`, {
        issueId,
        ...formData
      });

      setError('');
      onActionAdded(response.data.actionPoint);
      setFormData({
        actionDescription: '',
        category: 'INSPECTION',
        performedBy: '',
        timeDuration: 0,
        resourcesUsed: '',
        locationDetails: '',
        cloudinaryPhotoUrls: [],
        costIncurred: 0,
        statusAfterAction: 'IN_PROGRESS',
        notes: ''
      });
      setUploadedPhotos([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add action point');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Add Action Point</h2>
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

          {/* Action Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Description *
            </label>
            <textarea
              name="actionDescription"
              value={formData.actionDescription}
              onChange={handleInputChange}
              placeholder="What action was taken?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          {/* Category & Officer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="INSPECTION">Inspection</option>
                <option value="REPAIR">Repair</option>
                <option value="PLANNING">Planning</option>
                <option value="COORDINATION">Coordination</option>
                <option value="LEGAL_ACTION">Legal Action</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Officer Name *
              </label>
              <input
                type="text"
                name="performedBy"
                value={formData.performedBy}
                onChange={handleInputChange}
                placeholder="Officer who performed action"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Duration & Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Duration (minutes)
              </label>
              <input
                type="number"
                name="timeDuration"
                value={formData.timeDuration}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Incurred (₹)
              </label>
              <input
                type="number"
                name="costIncurred"
                value={formData.costIncurred}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Resources Used */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resources Used
            </label>
            <input
              type="text"
              name="resourcesUsed"
              value={formData.resourcesUsed}
              onChange={handleInputChange}
              placeholder="e.g., Equipment, materials, personnel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Details
            </label>
            <input
              type="text"
              name="locationDetails"
              value={formData.locationDetails}
              onChange={handleInputChange}
              placeholder="Specific site information"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status After Action
            </label>
            <select
              name="statusAfterAction"
              value={formData.statusAfterAction}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="BLOCKED">Blocked</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional details"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photos (min 1, max 5) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-800 font-medium">
                  Click to upload photos
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadedPhotos.length >= 5}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-600 mt-1">
                ({uploadedPhotos.length}/5 photos uploaded)
              </p>
            </div>

            {/* Uploaded Photos */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                {uploadedPhotos.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
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

          {/* Submit Button */}
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Action Point'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActionPointForm;
