import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X } from 'lucide-react';
import { getContract } from '../../utils/blockchain';

const RecordExpenseForm = ({ issueId, fundApprovalId, onExpenseAdded, onClose }) => {
  const [formData, setFormData] = useState({
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'MATERIALS',
    description: '',
    amountSpent: 0,
    vendorSupplier: '',
    itemQuantity: 1,
    itemUnit: 'unit',
    invoiceReference: '',
    paymentMethod: 'BANK_TRANSFER',
    proofDocumentUrls: [],
    approvedBy: '',
    remarks: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleDocumentUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;

    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      try {
        const response = await axios.post('http://localhost:5000/api/upload', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrls.push(response.data.url);
      } catch (err) {
        setError(`Failed to upload document: ${err.message}`);
      }
    }

    setUploadedDocs([...uploadedDocs, ...uploadedUrls]);
    setFormData(prev => ({
      ...prev,
      proofDocumentUrls: [...prev.proofDocumentUrls, ...uploadedUrls]
    }));
  };

  const removeDocument = (index) => {
    setUploadedDocs(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      proofDocumentUrls: prev.proofDocumentUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (formData.amountSpent <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!formData.vendorSupplier.trim()) {
      setError('Vendor/Supplier name is required');
      return;
    }

    if (formData.proofDocumentUrls.length === 0) {
      setError('At least one proof document is required');
      return;
    }

    if (!formData.approvedBy.trim()) {
      setError('Approver name is required');
      return;
    }

    try {
      setLoading(true);

      // --- MetaMask Blockchain Transaction ---
      let txHash = '';
      try {
        const contract = await getContract();
        let bnIssueId = 1;
        try { bnIssueId = BigInt('0x' + issueId); } catch(e) {}
        const tx = await contract.recordExpense(
          bnIssueId,
          formData.description,
          Math.round(formData.amountSpent),
          formData.vendorSupplier,
          formData.proofDocumentUrls
        );
        await tx.wait();
        txHash = tx.hash;
      } catch (bcError) {
        console.error('Blockchain error:', bcError);
        if (bcError.message?.includes('MetaMask')) {
          alert(bcError.message);
          setLoading(false);
          return;
        }
        const proceed = window.confirm('Blockchain transaction failed. Continue saving to database anyway?');
        if (!proceed) { setLoading(false); return; }
      }

      // --- Backend Submission ---
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('http://localhost:5000/api/expenses', {
        issueId,
        fundApprovalId: fundApprovalId || null,
        ...formData,
        blockchainTransactionHash: txHash
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setError('');
      onExpenseAdded(response.data.expense);
      setFormData({
        expenseDate: new Date().toISOString().split('T')[0],
        category: 'MATERIALS',
        description: '',
        amountSpent: 0,
        vendorSupplier: '',
        itemQuantity: 1,
        itemUnit: 'unit',
        invoiceReference: '',
        paymentMethod: 'BANK_TRANSFER',
        proofDocumentUrls: [],
        approvedBy: '',
        remarks: ''
      });
      setUploadedDocs([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Record Expense</h2>
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

          {/* Expense Date & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Date *
              </label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
                <option value="MATERIALS">Materials</option>
                <option value="LABOR">Labor</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="PERMITS">Permits</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What was purchased or paid for?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
            />
          </div>

          {/* Amount & Vendor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Spent (₹) *
              </label>
              <input
                type="number"
                name="amountSpent"
                value={formData.amountSpent}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor/Supplier *
              </label>
              <input
                type="text"
                name="vendorSupplier"
                value={formData.vendorSupplier}
                onChange={handleInputChange}
                placeholder="Company or person name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="itemQuantity"
                value={formData.itemQuantity}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                name="itemUnit"
                value={formData.itemUnit}
                onChange={handleInputChange}
                placeholder="e.g., piece, bag, meter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Invoice Reference & Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Reference
              </label>
              <input
                type="text"
                name="invoiceReference"
                value={formData.invoiceReference}
                onChange={handleInputChange}
                placeholder="e.g., INV-2026-0456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHECK">Check</option>
                <option value="CREDIT_CARD">Credit Card</option>
              </select>
            </div>
          </div>

          {/* Approved By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approved By *
            </label>
            <input
              type="text"
              name="approvedBy"
              value={formData.approvedBy}
              onChange={handleInputChange}
              placeholder="Officer name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="Any additional details"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proof Documents (Invoice, Receipt, Photo) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-800 font-medium">
                  Click to upload documents
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-600 mt-1">
                ({uploadedDocs.length} documents uploaded)
              </p>
            </div>

            {/* Uploaded Documents */}
            {uploadedDocs.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedDocs.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <span className="text-sm text-gray-700 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-800"
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
              {loading ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordExpenseForm;
