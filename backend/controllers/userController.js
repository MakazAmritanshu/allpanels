import crypto from 'crypto';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import betModel from '../models/betModel.js';
import betHistoryModel from '../models/betHistoryModel.js';
import LoginHistory from '../models/loginHistory.js';
import passwordHistory from '../models/passwordHistory.js';
import SubAdmin from '../models/subAdminModel.js';
import TransactionHistory from '../models/transtionHistoryModel.js';
import { calculateAllExposure } from '../utils/exposureUtils.js';

const DEMO_BALANCE = 1500;
/** Demo accounts not logged out are deleted after this many ms (default 24 hours). */
const DEMO_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await SubAdmin.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const subAdmin = await SubAdmin.create({ name, email, password });
    res
      .status(201)
      .json({ message: 'SubAdmin registered successfully', data: subAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveLoginHistory = async (userName, id, status, req) => {
  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      'IP not found';

    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const { city, region, country_name: country, org: isp } = response.data;

    const now = new Date();
    const formattedDateTime = now
      .toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(',', '');

    await LoginHistory.create({
      userName,
      userId: id,
      status: status === 'Success' ? 'Login Successful' : 'Login Failed',
      dateTime: formattedDateTime,
      ip,
      isp,
      city,
      region,
      country,
    });
  } catch (error) {
    console.error(' Login history error:', error.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { userName, password } = req.body;
    if (!userName || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide both username and password.' });
    }

    const user = await SubAdmin.findOne({ userName: userName.toLowerCase() });
    if (!user) {
      await saveLoginHistory(
        userName,
        'user not found',
        'Invalid UserName.',
        req
      );
      return res.status(400).json({ message: 'Username not found.' });
    }
    if (user.status !== 'active') {
      return res
        .status(400)
        .json({ message: `Your Account is ${user.status}...` });
    }

    if (user.role !== 'user') {
      await saveLoginHistory(userName, user._id, 'Login With Admin Id', req);
      return res
        .status(400)
        .json({ message: 'This Dashboard is for User Dashboard...' });
    }

    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await saveLoginHistory(userName, user._id, 'Invalid Password.', req);
      return res.status(400).json({ message: 'Incorrect password.' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await saveLoginHistory(userName, user._id, 'Success', req);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: user,
      isPasswordChanged: user.isPasswordChanged,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/** Demo login: creates a fresh demo user per session (1500 balance, 0 exposure, no bets). */
export const demoLogin = async (req, res) => {
  try {
    const sessionId = crypto.randomUUID();
    const demoUserName = `demo_${sessionId}`;

    const demoUser = await SubAdmin.create({
      name: 'Demo User',
      userName: demoUserName,
      account: 'demo',
      code: 'demo',
      phone: 0,
      password: 'demo',
      balance: DEMO_BALANCE,
      baseBalance: DEMO_BALANCE,
      totalBalance: DEMO_BALANCE,
      avbalance: DEMO_BALANCE,
      agentAvbalance: 0,
      totalAvbalance: DEMO_BALANCE,
      exposure: 0,
      totalExposure: 0,
      exposureLimit: DEMO_BALANCE,
      status: 'active',
      role: 'user',
      isPasswordChanged: true,
      isDemo: true,
    });

    const token = jwt.sign(
      { id: demoUser._id, role: demoUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const userObj = demoUser.toObject();
    delete userObj.password;
    delete userObj.masterPassword;

    res.status(200).json({
      success: true,
      message: 'Demo login successful',
      token,
      data: { ...userObj, exposure: 0 },
      isPasswordChanged: true,
      isDemo: true,
    });
  } catch (error) {
    console.error('Demo Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req;

    if (!id) {
      return res.status(400).json({ message: 'Admin ID is required' });
    }
    const user = await SubAdmin.findById(id).select(
      '-password -masterPassword'
    );

    if (!user) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }
    const updatedPendingBets = await betModel.find({ userId: id, status: 0 });
    const currentExposure = calculateAllExposure(updatedPendingBets);

    const userWithExposure = {
      ...user.toObject(),
      exposure: currentExposure,
    };

    res.status(200).json({
      message: 'Sub-admin details retrieved successfully',
      data: userWithExposure, // ← Send the new object, not the modified user
    });
  } catch (error) {
    console.error('Error fetching sub-admin:', error);
    res
      .status(500)
      .json({ error: 'Internal server error', details: error.message });
  }
};
export const changePasswordByUserSelf = async (req, res) => {
  const { id } = req;
  try {
    const { oldPassword, newPassword } = req.body;

    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, subAdmin.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Old Password Wrong !' });
    }

    // Validate new password: must contain letters AND numbers, NO special characters
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters with both letters and numbers. Special characters are not allowed.',
      });
    }

    // Assign plaintext - pre-save hook will hash it
    subAdmin.password = newPassword;

    await subAdmin.save();
    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: 'Password Changed By Self.',
      userId: id,
    });
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',

      data: subAdmin,
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const changePasswordByFirstLogin = async (req, res) => {
  const { id } = req;
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    console.log('oldPassword', oldPassword);
    console.log('newPassword', newPassword);
    console.log('confirmPassword', confirmPassword);

    const subAdmin = await SubAdmin.findById(id);
    if (!subAdmin) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New Password and Password Confirmation should be same',
      });
    }
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters with both letters and numbers. Special characters are not allowed.',
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, subAdmin.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Old Password Has Not Matched!' });
    }
    subAdmin.password = newPassword;

    //Also i have to match the newPassword and the confirmPassword
    if (!subAdmin.isPasswordChanged) {
      subAdmin.isPasswordChanged = true;
    }

    await subAdmin.save();

    // Create password history record
    await passwordHistory.create({
      userName: subAdmin.userName,
      remark: 'Password Changed By First Login.',
      userId: id,
    });
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      isPasswordChanged: true,
      data: subAdmin,
    });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export const getPasswordHistoryByUserId = async (req, res) => {
  const { id } = req;
  try {
    // passed in route as /credit-ref-history/:userId
    const { page = 1, limit = 10, searchQuery = '' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {
      userId: id,
    };

    const data = await passwordHistory
      .find(filter)
      .sort({ createdAt: -1 }) // optional: latest first
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await passwordHistory.countDocuments(filter);

    return res.status(200).json({
      message: 'Password History fetched successfully',
      data,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching creditRefHistory:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      success: false,
    });
  }
};
export const getLoginHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await LoginHistory.find({ userId });
    res.status(200).json({
      message: 'Login history fetched successfully',
      data,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const user_logout = async (req, res) => {
  const userId = req.id;

  if (userId) {
    const user = await SubAdmin.findById(userId);
    if (user?.isDemo) {
      const idStr = userId.toString();
      await Promise.all([
        betModel.deleteMany({ userId: idStr }),
        betHistoryModel.deleteMany({ userId: idStr }),
        TransactionHistory.deleteMany({ userId: idStr }),
      ]);
      await SubAdmin.findByIdAndDelete(userId);
    }
  }

  res.clearCookie('auth', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/',
  });

  res.status(200).json({ message: 'Logout success' });
};

/** Deletes demo users (and their bets/history) that were created more than DEMO_MAX_AGE_MS ago. Call from cron so forgotten demo sessions don't stay in DB forever. */
export const cleanupStaleDemoUsers = async () => {
  const cutoff = new Date(Date.now() - DEMO_MAX_AGE_MS);
  const staleDemos = await SubAdmin.find({
    isDemo: true,
    createdAt: { $lt: cutoff },
  }).select('_id');

  for (const user of staleDemos) {
    const idStr = user._id.toString();
    await Promise.all([
      betModel.deleteMany({ userId: idStr }),
      betHistoryModel.deleteMany({ userId: idStr }),
      TransactionHistory.deleteMany({ userId: idStr }),
    ]);
    await SubAdmin.findByIdAndDelete(user._id);
  }

  if (staleDemos.length > 0) {
    console.log(`[cleanupStaleDemoUsers] Removed ${staleDemos.length} abandoned demo account(s)`);
  }
};

export const updateQuickStakes = async (req, res) => {
  try {
    const { id } = req;
    const { quickStakes } = req.body;

    if (!Array.isArray(quickStakes) || quickStakes.length !== 8) {
      return res
        .status(400)
        .json({ message: 'Please provide exactly 8 stake values' });
    }

    // Validate all values are positive numbers
    const isValid = quickStakes.every(
      (val) => typeof val === 'number' && val > 0
    );
    if (!isValid) {
      return res
        .status(400)
        .json({ message: 'All stake values must be positive numbers' });
    }

    const user = await SubAdmin.findByIdAndUpdate(
      id,
      { quickStakes },
      { new: true }
    ).select('-password -masterPassword');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Quick stakes updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update Quick Stakes Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const updateTheme = async (req, res) => {
  try {
    const { id } = req;
    const { theme } = req.body;

    // Define allowed themes (must match your theme config)
    const allowedThemes = [
      'blueGreen',
      'blackOrange',
      'tealDarkteal',
      'grayBlack',
      'greenBlack',
    ];

    if (!theme || !allowedThemes.includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme selection' });
    }

    const user = await SubAdmin.findByIdAndUpdate(
      id,
      { theme },
      { new: true }
    ).select('-password -masterPassword');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Theme updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update Theme Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
