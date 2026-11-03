import Issue from '../models/Issue.js';
import ActionPoint from '../models/ActionPoint.js';
import BlockchainRecord from '../models/BlockchainRecord.js';

// @desc    Report a civic issue
// @route   POST /api/issues/civic
// @access  Protected (citizen)
export const reportCivicIssue = async (req, res) => {
  try {
    const { issueType, description, location, taluka, nagarpalika } = req.body;

    if (!issueType || !description || !location || !taluka || !nagarpalika) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const mediaUrls = req.files ? req.files.map((f) => f.path) : [];

    const issue = await Issue.create({
      issueType,
      title: `${issueType} issue at ${location}`,
      description,
      location,
      taluka,
      nagarpalika,
      citizenId: req.user._id,
      mediaUrls,
      category: 'civic',
      updates: [{ status: 'SUBMITTED', note: 'Report submitted by citizen.' }],
    });

    res.status(201).json(issue);
  } catch (error) {
    console.error('reportCivicIssue error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};


// @desc    Get logged-in citizen's issues
// @route   GET /api/issues/my
// @access  Protected (citizen)
export const getMyCivicIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ citizenId: req.user._id, category: 'civic' }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all issues for a nagarpalika (sorted by supporters)
// @route   GET /api/issues/nagarpalika?name=xxx&category=civic
// @access  Protected (citizen)
export const getIssuesByNagarpalika = async (req, res) => {
  try {
    const { name } = req.query;
    const filter = { nagarpalika: name, category: 'civic' };

    const issues = await Issue.find(filter)
      .populate('citizenId', 'name')
      .sort({ 'supporters': -1, createdAt: -1 })
      .lean();

    // Sort by supporter count descending
    issues.sort((a, b) => (b.supporters?.length || 0) - (a.supporters?.length || 0));

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Support an issue
// @route   POST /api/issues/:id/support
// @access  Protected (citizen)
export const supportIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const alreadySupported = issue.supporters.includes(req.user._id);
    const isOwner = issue.citizenId.toString() === req.user._id.toString();

    if (isOwner) return res.status(400).json({ message: 'You cannot support your own issue' });
    if (alreadySupported) return res.status(400).json({ message: 'You have already supported this issue' });

    issue.supporters.push(req.user._id);
    await issue.save();

    res.json({ supportCount: issue.supporters.length });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Check for duplicate issue before submitting
// @route   GET /api/issues/check-duplicate?issueType=xxx&nagarpalika=xxx
// @access  Protected (citizen)
export const checkDuplicate = async (req, res) => {
  try {
    const { issueType, nagarpalika } = req.query;
    const duplicate = await Issue.findOne({
      issueType,
      nagarpalika,
      status: { $ne: 'APPROVED' },
    })
      .populate('citizenId', 'name')
      .sort({ createdAt: -1 });

    if (duplicate) {
      return res.json({ found: true, issue: duplicate });
    }
    res.json({ found: false });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @access  Protected (admin)
export const getAllIssues = async (req, res) => {
  try {
    const { nagarpalika, status } = req.query;
    const filter = { category: 'civic' };
    if (nagarpalika) filter.nagarpalika = nagarpalika;
    if (status) filter.status = status;

    const issues = await Issue.find(filter)
      .populate('citizenId', 'name email')
      .sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get single issue by ID
// @route   GET /api/issues/:id
// @access  Protected
export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('citizenId', 'name email');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update issue status (nagarpalika/admin)
// @route   PUT /api/issues/:id/status
// @access  Protected (admin)
export const updateIssueStatus = async (req, res) => {
  try {
    const { status, note, transactionHash } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = status;
    issue.updates.push({ status, note: note || `Status updated to ${status}`, transactionHash });
    
    // Also mark the root issue as verified if this is the first transaction hash
    if (transactionHash && !issue.blockchainVerified) {
      issue.blockchainVerified = true;
      issue.blockchainTransactionHash = transactionHash;
    }
    
    await issue.save();

    const performedBy = req.admin?.name || req.admin?.nagarpalikaName || 'System/Admin';

    // Create ActionPoint so it shows up in Transparency Panel
    await ActionPoint.create({
      issueId: issue._id,
      actionDate: new Date(),
      actionDescription: note || `Status updated to ${status}`,
      category: 'OTHER',
      performedBy: performedBy,
      statusAfterAction: status === 'IN_PROGRESS' || status === 'PENDING_APPROVAL' ? status : 'COMPLETED',
      blockchainTransactionHash: transactionHash || ''
    });

    // Create BlockchainRecord if transactionHash is provided
    if (transactionHash) {
      await BlockchainRecord.create({
        issueId: issue._id,
        recordType: `STATUS_${status}`,
        transactionHash: transactionHash,
        verified: true,
        verificationTimestamp: new Date()
      });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
