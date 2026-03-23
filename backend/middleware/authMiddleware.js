import jwt from 'jsonwebtoken';

import SubAdmin from '../models/subAdminModel.js';

export const authMiddleware = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.auth) {
    token = req.cookies.auth;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decodedToken.role;

    if (!userRole || userRole !== 'user') {
      return res
        .status(403)
        .json({ message: 'Access denied, Only user can access' });
    }

    req.role = decodedToken.role;
    req.user = decodedToken.user;
    req.id = decodedToken.id;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const adminAuthMiddleware = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.auth) {
      token = req.cookies.auth;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decodedToken.role;

    const allowedRoles = [
      'supperadmin',
      'admin',
      'white',
      'super',
      'master',
      'agent',
    ];
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }

    const user = await SubAdmin.findById(decodedToken.id);
    if (user.sessionToken !== decodedToken.sessionToken) {
      return res.status(401).json({
        message: 'Session expired. Please login again.',
        code: 'SESSION_EXPIRED',
      });
    }

    req.role = userRole;
    req.id = decodedToken.id;
    req.admin = decodedToken.user;
    next();
  } catch (error) {
    console.error('Admin Auth Error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
