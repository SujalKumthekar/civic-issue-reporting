import IllegalReport from '../models/IllegalReport.js';
import BlockchainRecord from '../models/BlockchainRecord.js';

// @desc    Submit an illegal activity report
// @route   POST /api/illegal
// @access  Protected (citizen)
export const submitIllegalReport = async (req, res) => {
  try {
    const { title, category, location, description, isAnonymous, taluka, nagarpalika } = req.body;

    if (!title || !category || !location || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const mediaUrls = req.files ? req.files.map((f) => f.path) : [];

    const report = await IllegalReport.create({
      title,
      category,
      description,
      location,
      taluka: taluka || 'N/A',
      nagarpalika: nagarpalika || 'Enforcement',
      citizenId: req.user._id,
      mediaUrls,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      updates: [{ status: 'SUBMITTED', note: 'Report submitted by citizen.' }],
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('submitIllegalReport error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get logged-in citizen's illegal reports
// @route   GET /api/illegal/my
// @access  Protected (citizen)
export const getMyIllegalReports = async (req, res) => {
  try {
    const reports = await IllegalReport.find({ citizenId: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get illegal reports by nagarpalika (sorted by supporters)
// @route   GET /api/illegal/nagarpalika?name=xxx
// @access  Protected (citizen)
export const getIllegalByNagarpalika = async (req, res) => {
  try {
    const { name } = req.query;
    const reports = await IllegalReport.find({ nagarpalika: name })
      .populate('citizenId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Sort by supporter count descending
    reports.sort((a, b) => (b.supporters?.length || 0) - (a.supporters?.length || 0));

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Support an illegal report
// @route   POST /api/illegal/:id/support
// @access  Protected (citizen)
export const supportIllegalReport = async (req, res) => {
  try {
    const report = await IllegalReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const alreadySupported = report.supporters.includes(req.user._id);
    const isOwner = report.citizenId.toString() === req.user._id.toString();

    if (isOwner) return res.status(400).json({ message: 'You cannot support your own report' });
    if (alreadySupported) return res.status(400).json({ message: 'You have already supported this report' });

    report.supporters.push(req.user._id);
    await report.save();

    res.json({ supportCount: report.supporters.length });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all illegal reports (admin)
// @route   GET /api/illegal/admin/all
// @access  Protected (admin)
export const getAllIllegalReports = async (req, res) => {
  try {
    const { nagarpalika, status } = req.query;
    const filter = {};
    if (nagarpalika) filter.nagarpalika = nagarpalika;
    if (status) filter.status = status;

    const reports = await IllegalReport.find(filter)
      .populate('citizenId', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get single illegal report by ID (admin)
// @route   GET /api/illegal/admin/:id
// @access  Protected (admin)
export const getIllegalReportById = async (req, res) => {
  try {
    const report = await IllegalReport.findById(req.params.id).populate('citizenId', 'name email');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Update illegal report status (Nagarpalika only — no district approval needed)
// @route   PUT /api/illegal/admin/:id/status
// @access  Protected (admin — Nagarpalika)
export const updateIllegalStatus = async (req, res) => {
  try {
    const { status, note, transactionHash, legalAction } = req.body;

    if (!['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Illegal reports can only be: SUBMITTED, IN_PROGRESS, or RESOLVED.',
      });
    }

    const report = await IllegalReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status;
    report.updates.push({ status, note: note || `Status updated to ${status}`, transactionHash });

    // Store legal action details when resolving
    if (status === 'RESOLVED' && legalAction) {
      report.legalAction = {
        ...legalAction,
        blockchainTransactionHash: transactionHash || '',
      };
    }

    await report.save();

    if (transactionHash) {
      await BlockchainRecord.create({
        issueId: report._id,
        recordType: `ILLEGAL_${status}`,
        transactionHash: transactionHash,
        verified: true,
        verificationTimestamp: new Date()
      });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
