import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, MapPin, Calendar, User, AlertCircle, CheckCircle, Clock, Scale, Shield } from 'lucide-react';

const IssueTrackingTimeline = ({ issueId }) => {
  const [issue, setIssue] = useState(null);
  const [actionPoints, setActionPoints] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [completion, setCompletion] = useState(null);
  const [isIllegal, setIsIllegal] = useState(false);
  const [legalAction, setLegalAction] = useState(null);
  const [blockchainRecords, setBlockchainRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIssueDetails();
  }, [issueId]);

  const fetchIssueDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:5000/api/issue-tracking/details/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      setIssue(data.issue);
      setActionPoints(data.actionPoints);
      setExpenses(data.expenses);
      setCompletion(data.completion);
      setIsIllegal(data.isIllegal || false);
      setLegalAction(data.legalAction || null);
      setBlockchainRecords(data.blockchainRecords || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading issue details...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>;
  if (!issue) return <div>Issue not found</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING_FUNDS': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_APPROVAL': return 'bg-purple-100 text-purple-800';
      case 'ACKNOWLEDGED': return 'bg-purple-100 text-purple-800';
      case 'SUBMITTED': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5" />;
      case 'RESOLVED': return <CheckCircle className="w-5 h-5" />;
      case 'APPROVED': return <CheckCircle className="w-5 h-5" />;
      case 'IN_PROGRESS': return <Clock className="w-5 h-5" />;
      case 'PENDING_FUNDS': return <AlertCircle className="w-5 h-5" />;
      case 'PENDING_APPROVAL': return <Clock className="w-5 h-5" />;
      case 'ACKNOWLEDGED': return <CheckCircle className="w-5 h-5" />;
      case 'SUBMITTED': return <Clock className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amountSpent, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Issue Header */}
      <div className="mb-8 pb-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
            <p className="text-gray-600 mt-2">{issue.description}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${getStatusColor(issue.status)}`}>
            {getStatusIcon(issue.status)}
            {issue.status}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4" />
            <span>{issue.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4" />
            <span>{issue.nagarpalika}</span>
          </div>
          <div className="text-gray-700">
            <span>Issue #{issue._id?.slice(-6).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Acknowledgment Section */}
      {issue.acknowledgedBy && (
        <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">Acknowledgment</h3>
          <p><strong>Acknowledged by:</strong> {issue.acknowledgedBy}</p>
          <p><strong>Date:</strong> {new Date(issue.acknowledgedAt).toLocaleString()}</p>
          {issue.acknowledgedNote && <p><strong>Note:</strong> {issue.acknowledgedNote}</p>}
          <p><strong>Priority:</strong> {issue.priorityLevel}</p>
          {issue.expectedResolutionDate && (
            <p><strong>Expected Resolution:</strong> {new Date(issue.expectedResolutionDate).toLocaleDateString()}</p>
          )}
        </div>
      )}

      {/* Action Points Timeline */}
      {actionPoints.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Actions Taken</h3>
          <div className="space-y-4">
            {actionPoints.map((action, idx) => (
              <div key={action._id} className="border-l-4 border-blue-500 pl-4 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{action.actionDescription}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Category: <span className="font-medium">{action.category}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Officer: <span className="font-medium">{action.performedBy}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(action.actionDate).toLocaleString()}
                    </p>
                    {action.notes && (
                      <p className="text-sm text-gray-700 mt-2"><strong>Notes:</strong> {action.notes}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    action.statusAfterAction === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {action.statusAfterAction}
                  </span>
                </div>

                {/* Photos */}
                {action.cloudinaryPhotoUrls && action.cloudinaryPhotoUrls.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Photos:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {action.cloudinaryPhotoUrls.map((url, idx) => (
                        <img key={idx} src={url} alt={`Action photo ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                      ))}
                    </div>
                  </div>
                )}

                {action.costIncurred > 0 && (
                  <p className="text-sm text-gray-700 mt-2"><strong>Cost:</strong> ₹{action.costIncurred}</p>
                )}
                {action.blockchainTransactionHash && (
                  <p className="text-xs text-blue-500 mt-2 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Blockchain TX: {action.blockchainTransactionHash.slice(0, 24)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legal Action Section (for illegal reports) */}
      {isIllegal && legalAction && (
        <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Legal Action Taken
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 font-medium">Action Type</p>
              <p className="font-semibold text-gray-900">{legalAction.actionType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">IPC Section</p>
              <p className="font-semibold text-gray-900">{legalAction.ipcSection}</p>
            </div>
            {legalAction.firNumber && (
              <div>
                <p className="text-xs text-gray-500 font-medium">FIR Number</p>
                <p className="font-semibold text-gray-900">{legalAction.firNumber}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 font-medium">Officer Name</p>
              <p className="font-semibold text-gray-900">{legalAction.officerName}</p>
            </div>
            {legalAction.penaltyAmount > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Penalty Amount</p>
                <p className="font-semibold text-orange-700">₹{legalAction.penaltyAmount.toLocaleString()}</p>
              </div>
            )}
            {legalAction.actionDate && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Action Date</p>
                <p className="font-semibold text-gray-900">{new Date(legalAction.actionDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
          {legalAction.actionDescription && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 font-medium">Action Description</p>
              <p className="text-sm text-gray-800 mt-1">{legalAction.actionDescription}</p>
            </div>
          )}
          {legalAction.additionalRemarks && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 font-medium">Additional Remarks</p>
              <p className="text-sm text-gray-700 mt-1">{legalAction.additionalRemarks}</p>
            </div>
          )}
          {legalAction.blockchainTransactionHash && (
            <div className="mt-4 p-3 bg-white border border-green-200 rounded-lg flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-green-800">Blockchain Verified</p>
                <p className="text-xs text-gray-500 mt-1 break-all">TX: {legalAction.blockchainTransactionHash}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fund Information */}
      {(issue.allocatedBudget > 0 || expenses.length > 0) && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-4">Fund Allocation & Utilization</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Allocated Budget</p>
              <p className="text-2xl font-bold text-green-700">₹{issue.allocatedBudget}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-blue-700">₹{totalExpenses}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-orange-700">₹{issue.allocatedBudget - totalExpenses}</p>
            </div>
          </div>

          {/* Expenses List */}
          {expenses.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Expenses Breakdown</h4>
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <div key={expense._id} className="text-sm py-3 border-t">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        <p className="text-gray-600">{expense.category} - By {expense.approvedBy}</p>
                        <p className="text-xs text-gray-500">{new Date(expense.expenseDate).toLocaleDateString()}</p>
                        {expense.vendorSupplier && (
                          <p className="text-xs text-gray-500">Vendor: {expense.vendorSupplier}</p>
                        )}
                        {expense.invoiceReference && (
                          <p className="text-xs text-gray-500">Invoice: {expense.invoiceReference}</p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">₹{expense.amountSpent}</p>
                    </div>
                    {/* Proof Documents */}
                    {expense.proofDocumentUrls && expense.proofDocumentUrls.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Proof Documents:</p>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {expense.proofDocumentUrls.map((url, idx) => {
                            const isImage = url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                            return (
                              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block">
                                {isImage ? (
                                  <img
                                    src={url}
                                    alt={`Proof ${idx + 1}`}
                                    className="w-full h-16 object-cover rounded border hover:opacity-80 transition"
                                  />
                                ) : (
                                  <div className="w-full h-16 flex items-center justify-center bg-gray-100 rounded border hover:bg-gray-200 transition text-sm">
                                    <span className="text-gray-600 truncate px-2">Doc {idx + 1}</span>
                                  </div>
                                )}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {expense.blockchainTransactionHash && (
                      <p className="text-xs text-gray-400 mt-1 break-all">🔗 TX: {expense.blockchainTransactionHash}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Section */}
      {completion && (
        <div className="mb-8 p-4 bg-green-50 border border-green-300 rounded-lg">
          <h3 className="text-lg font-bold text-green-900 mb-4">✓ Issue Completed</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Completion Date</p>
              <p className="font-medium">{new Date(completion.completionDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Work Summary</p>
              <p className="font-medium">{completion.workSummary}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quality Check</p>
              <p className={`font-medium ${completion.qualityCheckStatus === 'PASSED' ? 'text-green-700' : 'text-red-700'}`}>
                {completion.qualityCheckStatus}
              </p>
            </div>

            {/* Before/After Photos */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Before & After Photos</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Before</p>
                  <img src={completion.preWorkPhotoUrl} alt="Before" className="w-full h-40 object-cover rounded" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">After</p>
                  <img src={completion.postCompletionPhotoUrl} alt="After" className="w-full h-40 object-cover rounded" />
                </div>
              </div>
            </div>

            {/* Citizen Feedback */}
            <div>
              <p className="text-sm text-gray-600">Your Rating</p>
              <div className="flex items-center gap-1">
                <span className="text-2xl">{'⭐'.repeat(completion.citizenRating)}</span>
                <span className="text-sm text-gray-600">({completion.citizenRating}/5)</span>
              </div>
              {completion.citizenFeedback && (
                <p className="text-sm text-gray-700 mt-2">"{completion.citizenFeedback}"</p>
              )}
            </div>

            {/* Final Budget Summary */}
            <div className="mt-4 p-3 bg-white border border-green-200 rounded">
              <p className="text-sm font-medium text-gray-900 mb-2">Final Cost Summary</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Approved</p>
                  <p className="font-semibold">₹{completion.approvedBudget}</p>
                </div>
                <div>
                  <p className="text-gray-600">Actual</p>
                  <p className="font-semibold">₹{completion.actualCost}</p>
                </div>
                <div>
                  <p className="text-gray-600">Variance</p>
                  <p className={`font-semibold ${completion.actualCost <= completion.approvedBudget ? 'text-green-700' : 'text-red-700'}`}>
                    ₹{completion.approvedBudget - completion.actualCost}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Verification */}
      <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">🔗 Blockchain Verification</h3>
        {(issue.blockchainVerified || blockchainRecords.length > 0) ? (
          <div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span>Records verified on blockchain</span>
            </div>
            {blockchainRecords.length > 0 && (
              <div className="mt-3 space-y-2">
                {blockchainRecords.map((record, idx) => (
                  <div key={idx} className="text-xs bg-white p-2 rounded border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{record.recordType}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${record.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {record.verified ? '✓ Verified' : 'Pending'}
                      </span>
                    </div>
                    {record.transactionHash && (
                      <p className="text-gray-500 mt-1 break-all">TX: {record.transactionHash}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-700">
            <p>Blockchain verification pending...</p>
          </div>
        )}
        {issue.blockchainTransactionHash && blockchainRecords.length === 0 && (
          <p className="text-xs text-gray-600 mt-2 break-all">
            TX: {issue.blockchainTransactionHash}
          </p>
        )}
      </div>
    </div>
  );
};

export default IssueTrackingTimeline;
