import jwt from 'jsonwebtoken';
import DistrictAuthority from '../models/DistrictAuthority.js';
import Nagarpalika from '../models/Nagarpalika.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @desc    Register district authority (only one allowed)
// @route   POST /api/admin/register
// @access  Public
export const registerDistrictAuthority = async (req, res) => {
  try {
    const existing = await DistrictAuthority.findOne();
    if (existing) {
      return res.status(400).json({ message: 'District authority already registered. Only one is allowed.' });
    }

    const { name, email, password, districtName } = req.body;
    const authority = await DistrictAuthority.create({ name, email, password, districtName });

    res.status(201).json({
      _id: authority._id,
      name: authority.name,
      email: authority.email,
      districtName: authority.districtName,
      role: 'DISTRICT_AUTHORITY',
      token: generateToken(authority._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Login district authority
// @route   POST /api/admin/login
// @access  Public
export const loginDistrictAuthority = async (req, res) => {
  try {
    const { email, password } = req.body;
    const authority = await DistrictAuthority.findOne({ email }).select('+password');

    if (authority && (await authority.matchPassword(password))) {
      res.json({
        _id: authority._id,
        name: authority.name,
        email: authority.email,
        districtName: authority.districtName,
        role: 'DISTRICT_AUTHORITY',
        token: generateToken(authority._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Add a nagarpalika (district authority only)
// @route   POST /api/admin/nagarpalikas
// @access  Protected (district authority)
export const addNagarpalika = async (req, res) => {
  try {
    const { name, taluka, username, password } = req.body;

    const existingUsername = await Nagarpalika.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already taken' });

    const existingName = await Nagarpalika.findOne({ name });
    if (existingName) return res.status(400).json({ message: `${name} is already registered` });

    const nagarpalika = await Nagarpalika.create({
      name,
      taluka,
      username,
      password,
      createdBy: req.admin._id,
    });

    res.status(201).json({
      _id: nagarpalika._id,
      name: nagarpalika.name,
      taluka: nagarpalika.taluka,
      username: nagarpalika.username,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get all nagarpalikas (district authority only)
// @route   GET /api/admin/nagarpalikas
// @access  Protected (district authority)
export const getNagarpalikas = async (req, res) => {
  try {
    const nagarpalikas = await Nagarpalika.find().select('-password');
    res.json(nagarpalikas);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Login nagarpalika
// @route   POST /api/nagarpalika/login
// @access  Public
export const loginNagarpalika = async (req, res) => {
  try {
    const { username, password } = req.body;
    const nagarpalika = await Nagarpalika.findOne({ username }).select('+password');

    if (nagarpalika && (await nagarpalika.matchPassword(password))) {
      res.json({
        _id: nagarpalika._id,
        name: nagarpalika.name,
        taluka: nagarpalika.taluka,
        username: nagarpalika.username,
        role: 'NAGARPALIKA',
        token: jwt.sign({ id: nagarpalika._id, role: 'NAGARPALIKA' }, process.env.JWT_SECRET, { expiresIn: '30d' }),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
