import jwt from 'jsonwebtoken';
import DistrictAuthority from '../models/DistrictAuthority.js';
import Nagarpalika from '../models/Nagarpalika.js';

// Protects district authority routes only
const adminAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await DistrictAuthority.findById(decoded.id);
    if (!req.admin) return res.status(401).json({ message: 'Not authorized' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Protects routes accessible by BOTH district authority AND nagarpalika
export const anyAdminAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'NAGARPALIKA') {
      const nag = await Nagarpalika.findById(decoded.id);
      if (!nag) return res.status(401).json({ message: 'Not authorized' });
      req.admin = nag;
      req.adminRole = 'NAGARPALIKA';
    } else {
      const authority = await DistrictAuthority.findById(decoded.id);
      if (!authority) return res.status(401).json({ message: 'Not authorized' });
      req.admin = authority;
      req.adminRole = 'DISTRICT_AUTHORITY';
    }
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

export default adminAuth;
