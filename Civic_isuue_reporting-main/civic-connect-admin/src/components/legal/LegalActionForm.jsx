import React, { useState } from 'react';
import { X, Shield, Scale, AlertTriangle, Loader2 } from 'lucide-react';
import { getContract } from '../../utils/blockchain';

// Common IPC sections relevant to civic/illegal activities
const IPC_SECTIONS = [
  { code: '188', description: 'Disobedience to order duly promulgated by public servant' },
  { code: '268', description: 'Public nuisance' },
  { code: '269', description: 'Negligent act likely to spread infection of disease' },
  { code: '277', description: 'Fouling water of public spring or reservoir' },
  { code: '278', description: 'Making atmosphere noxious to health' },
  { code: '283', description: 'Danger or obstruction in public way or line of navigation' },
  { code: '290', description: 'Punishment for public nuisance' },
  { code: '336', description: 'Act endangering life or personal safety of others' },
  { code: '379', description: 'Punishment for theft' },
  { code: '403', description: 'Dishonest misappropriation of property' },
  { code: '420', description: 'Cheating and dishonestly inducing delivery of property' },
  { code: '425', description: 'Mischief' },
  { code: '426', description: 'Punishment for mischief' },
  { code: '427', description: 'Mischief causing damage of fifty rupees or above' },
  { code: '430', description: 'Mischief by injury to works of irrigation' },
  { code: '431', description: 'Mischief by injury to public road, bridge, river, or channel' },
  { code: '447', description: 'Punishment for criminal trespass' },
  { code: '448', description: 'Punishment for house trespass' },
  { code: 'Other', description: 'Other section (specify below)' },
];

const ACTION_TYPES = [
  'FIR Filed',
  'Notice Issued',
  'Demolition Order',
  'Fine Imposed',
  'Seizure of Property',
  'Encroachment Removed',
  'Warning Issued',
  'Case Forwarded to Police',
  'Environmental Cleanup Ordered',
  'License Revoked/Suspended',
  'Other',
];

const LegalActionForm = ({ reportId, reportTitle, onActionSubmitted, onClose }) => {
  const [formData, setFormData] = useState({
    actionType: '',
    ipcSection: '',
    customIpcSection: '',
    firNumber: '',
    actionDescription: '',
    actionDate: new Date().toISOString().split('T')[0],
    officerName: '',
    penaltyAmount: '',
    additionalRemarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.actionType) {
      setError('Please select the action taken');
      return;
    }
    if (!formData.ipcSection) {
      setError('Please select the IPC Section');
      return;
    }
    if (formData.ipcSection === 'Other' && !formData.customIpcSection.trim()) {
      setError('Please specify the IPC section');
      return;
    }
    if (!formData.actionDescription.trim()) {
      setError('Please provide action description');
      return;
    }
    if (!formData.officerName.trim()) {
      setError('Officer name is required');
      return;
    }

    const ipcDisplay = formData.ipcSection === 'Other'
      ? formData.customIpcSection
      : `IPC Section ${formData.ipcSection}`;

    const fullNote = `[LEGAL ACTION] ${formData.actionType} | ${ipcDisplay} | ${formData.actionDescription}${formData.firNumber ? ` | FIR No: ${formData.firNumber}` : ''}${formData.penaltyAmount ? ` | Penalty: ₹${formData.penaltyAmount}` : ''} | Officer: ${formData.officerName}${formData.additionalRemarks ? ` | Remarks: ${formData.additionalRemarks}` : ''}`;

    try {
      setLoading(true);

      // --- MetaMask Blockchain Transaction ---
      let txHash = '';
      try {
        const contract = await getContract();
        let bnIssueId = 1;
        try { bnIssueId = BigInt('0x' + reportId); } catch (e) { }

        // Use addActionPoint to record the legal action on blockchain
        const blockchainDescription = `Legal Action: ${formData.actionType} under ${ipcDisplay}. ${formData.actionDescription}`;
        const tx = await contract.addActionPoint(
          bnIssueId,
          blockchainDescription,
          formData.officerName,
          []
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

      // Submit the resolution to the backend
      onActionSubmitted({
        status: 'RESOLVED',
        note: fullNote,
        transactionHash: txHash,
        legalAction: {
          actionType: formData.actionType,
          ipcSection: ipcDisplay,
          firNumber: formData.firNumber,
          actionDescription: formData.actionDescription,
          actionDate: formData.actionDate,
          officerName: formData.officerName,
          penaltyAmount: formData.penaltyAmount ? Number(formData.penaltyAmount) : 0,
          additionalRemarks: formData.additionalRemarks,
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to submit legal action');
    } finally {
      setLoading(false);
    }
  };

  const selectedIpcInfo = IPC_SECTIONS.find(s => s.code === formData.ipcSection);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 rounded-t-2xl p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Scale size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Legal Action Report</h2>
              <p className="text-red-100 text-sm">{reportTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-6 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Required: Legal Action Details</p>
            <p className="text-xs text-amber-700 mt-1">
              Before resolving an illegal activity report, you must document the action taken and the applicable IPC section.
              This information will be recorded on the blockchain for transparency.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Action Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Action Taken *
            </label>
            <select
              name="actionType"
              value={formData.actionType}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-sm"
            >
              <option value="">-- Select action taken --</option>
              {ACTION_TYPES.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          {/* IPC Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Applicable IPC Section *
            </label>
            <select
              name="ipcSection"
              value={formData.ipcSection}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-sm"
            >
              <option value="">-- Select IPC Section --</option>
              {IPC_SECTIONS.map(section => (
                <option key={section.code} value={section.code}>
                  {section.code === 'Other' ? 'Other (Specify)' : `Section ${section.code} — ${section.description}`}
                </option>
              ))}
            </select>

            {/* Show description of selected section */}
            {selectedIpcInfo && selectedIpcInfo.code !== 'Other' && (
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <span className="font-bold">IPC Section {selectedIpcInfo.code}:</span> {selectedIpcInfo.description}
                </p>
              </div>
            )}

            {/* Custom IPC Section input */}
            {formData.ipcSection === 'Other' && (
              <input
                type="text"
                name="customIpcSection"
                value={formData.customIpcSection}
                onChange={handleInputChange}
                placeholder="Enter IPC Section (e.g., Section 304A)"
                className="w-full mt-2 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            )}
          </div>

          {/* FIR Number & Action Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                FIR Number (if applicable)
              </label>
              <input
                type="text"
                name="firNumber"
                value={formData.firNumber}
                onChange={handleInputChange}
                placeholder="e.g., FIR/2026/1234"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Action Date *
              </label>
              <input
                type="date"
                name="actionDate"
                value={formData.actionDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Action Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Detailed Action Description *
            </label>
            <textarea
              name="actionDescription"
              value={formData.actionDescription}
              onChange={handleInputChange}
              placeholder="Describe in detail what action was taken to resolve this illegal activity..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              rows="3"
            />
          </div>

          {/* Officer Name & Penalty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Officer Name *
              </label>
              <input
                type="text"
                name="officerName"
                value={formData.officerName}
                onChange={handleInputChange}
                placeholder="Name of the officer"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Penalty Amount (₹)
              </label>
              <input
                type="number"
                name="penaltyAmount"
                value={formData.penaltyAmount}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Additional Remarks */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Additional Remarks
            </label>
            <textarea
              name="additionalRemarks"
              value={formData.additionalRemarks}
              onChange={handleInputChange}
              placeholder="Any additional notes or follow-up actions required..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              rows="2"
            />
          </div>

          {/* Blockchain Notice */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <Shield size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700">
              <span className="font-bold">Blockchain Transparency:</span> This legal action will be recorded on the blockchain
              via MetaMask. The transaction hash will serve as an immutable proof of the action taken.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:bg-slate-400 transition-colors flex items-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Recording on Blockchain...
                </>
              ) : (
                <>
                  <Scale size={16} />
                  Submit Legal Action & Resolve
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LegalActionForm;
