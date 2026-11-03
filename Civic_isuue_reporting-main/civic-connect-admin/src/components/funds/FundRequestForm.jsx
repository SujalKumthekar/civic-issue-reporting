import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Upload, X, Shield, Loader2 } from 'lucide-react';
import { getContract } from '../../utils/blockchain';

const FundRequestForm = ({ issueId, issueTitle, onFundRequested, onClose }) => {
  const [formData, setFormData] = useState({
    totalAmountRequested: 0,
    justification: '',
    submittedBy: '',
    requestedTimeline: '',
    budgetLineItem: '',
    breakdown: []
  });
  const [currentBreakdownItem, setCurrentBreakdownItem] = useState({
    itemName: '',
    amount: 0,
    purpose: ''
  });
  const [supportDocuments, setSupportDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalAmountRequested' ? Number(value) : value
    }));
  };

  const handleBreakdownItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentBreakdownItem(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  const addBreakdownItem = () => {
    if (!currentBreakdownItem.itemName.trim()) {
      setError('Item name is required');
      return;
    }
    if (currentBreakdownItem.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (!currentBreakdownItem.purpose.trim()) {
      setError('Purpose is required');
      return;
    }

    const newBreakdown = [...formData.breakdown, currentBreakdownItem];
    const total = newBreakdown.reduce((sum, item) => sum + item.amount, 0);

    setFormData(prev => ({
      ...prev,
      breakdown: newBreakdown,
      totalAmountRequested: total
    }));

    setCurrentBreakdownItem({
      itemName: '',
      amount: 0,
      purpose: ''
    });
    setError('');
  };

  const removeBreakdownItem = (index) => {
    const newBreakdown = formData.breakdown.filter((_, i) => i !== index);
    const total = newBreakdown.reduce((sum, item) => sum + item.amount, 0);

    setFormData(prev => ({
      ...prev,
      breakdown: newBreakdown,
      totalAmountRequested: total
    }));
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSupportDocuments(prev => [...prev, response.data.url]);
    } catch (err) {
      setError(`Failed to upload document: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.justification.trim()) {
      setError('Justification is required');
      return;
    }

    if (!formData.submittedBy.trim()) {
      setError('Submitted by name is required');
      return;
    }

    if (!formData.requestedTimeline.trim()) {
      setError('Requested timeline is required');
      return;
    }

    if (formData.breakdown.length === 0) {
      setError('At least one breakdown item is required');
      return;
    }

    if (formData.totalAmountRequested <= 0) {
      setError('Total amount must be greater than 0');
      return;
    }

    if (supportDocuments.length === 0) {
      setError('At least one support document is required');
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

        // Record fund request on blockchain as an action point
        const breakdownSummary = formData.breakdown.map(b => `${b.itemName}: ₹${b.amount}`).join(', ');
        const blockchainDescription = `FUND_REQUEST: ₹${formData.totalAmountRequested} | ${formData.justification} | Breakdown: ${breakdownSummary}`;
        const tx = await contract.addActionPoint(
          bnIssueId,
          blockchainDescription,
          formData.submittedBy || 'Officer',
          supportDocuments
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
      const response = await axios.post(`http://localhost:5000/api/funds`, {
        issueId,
        totalAmountRequested: formData.totalAmountRequested,
        justification: formData.justification,
        breakdown: formData.breakdown,
        submittedBy: formData.submittedBy,
        supportDocumentsUrls: supportDocuments,
        requestedTimeline: formData.requestedTimeline,
        budgetLineItem: formData.budgetLineItem,
        blockchainTransactionHash: txHash
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setError('');
      onFundRequested(response.data.fundRequest);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit fund request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Request Funds</h2>
            <p className="text-sm text-gray-600">{issueTitle}</p>
          </div>
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

          {/* Basic Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fund Request Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justification *
                </label>
                <textarea
                  name="justification"
                  value={formData.justification}
                  onChange={handleInputChange}
                  placeholder="Why are funds needed for this issue?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submitted By *
                  </label>
                  <input
                    type="text"
                    name="submittedBy"
                    value={formData.submittedBy}
                    onChange={handleInputChange}
                    placeholder="Officer name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requested Timeline (Deadline) *
                  </label>
                  <input
                    type="date"
                    name="requestedTimeline"
                    value={formData.requestedTimeline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Line Item
                </label>
                <input
                  type="text"
                  name="budgetLineItem"
                  value={formData.budgetLineItem}
                  onChange={handleInputChange}
                  placeholder="e.g., Infrastructure Development"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h3>

            {/* Add New Item */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={currentBreakdownItem.itemName}
                  onChange={handleBreakdownItemChange}
                  placeholder="e.g., Cement, Equipment rental, Labor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={currentBreakdownItem.amount}
                    onChange={handleBreakdownItemChange}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose
                  </label>
                  <input
                    type="text"
                    name="purpose"
                    value={currentBreakdownItem.purpose}
                    onChange={handleBreakdownItemChange}
                    placeholder="e.g., Foundation work"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addBreakdownItem}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {/* Breakdown Items List */}
            {formData.breakdown.length > 0 && (
              <div className="space-y-2">
                {formData.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.itemName}</p>
                      <p className="text-sm text-gray-600">{item.purpose}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-semibold text-gray-900">₹{item.amount}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBreakdownItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between bg-blue-50 p-4 border border-blue-200 rounded-lg mt-4">
                  <p className="font-semibold text-gray-900">Total Amount Requested</p>
                  <p className="text-2xl font-bold text-blue-700">₹{formData.totalAmountRequested}</p>
                </div>
              </div>
            )}
          </div>

          {/* Support Documents */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Documents</h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
              <label className="cursor-pointer text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-blue-600 hover:text-blue-800 font-medium block">Upload supporting documents</span>
                <span className="text-sm text-gray-500">Quotations, bills, estimates, etc.</span>
                <input
                  type="file"
                  onChange={handleDocumentUpload}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>

            {supportDocuments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{supportDocuments.length} document(s) uploaded</p>
                {supportDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                    <span className="text-sm text-gray-700">Document {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setSupportDocuments(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Request Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Line Items</p>
                <p className="text-2xl font-bold text-blue-700">{formData.breakdown.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-700">₹{formData.totalAmountRequested}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-blue-700">{supportDocuments.length}</p>
              </div>
            </div>
          </div>

          {/* Blockchain Notice */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700">
              <span className="font-bold">Blockchain Transparency:</span> This fund request will be recorded on the blockchain
              via MetaMask before being sent to the District Authority. The transaction serves as an immutable proof of the request.
            </p>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording on Blockchain...
                </>
              ) : 'Submit Fund Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FundRequestForm;
