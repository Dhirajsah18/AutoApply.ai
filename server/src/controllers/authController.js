import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ENV } from '../config/env.js';

const generateToken = (id) => {
  return jwt.sign({ id }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });
};

export const register = async (req, res, next) => {
  try {
    let { name, email, password, title, skills } = req.body;

    // Strict type check to prevent NoSQL operator injection
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Name, email, and password must be valid text.' },
      });
    }

    name = name.trim();
    email = email.trim().toLowerCase();

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Name, email, and password (min 6 characters) are required.' },
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMAIL_IN_USE', message: 'An account with this email already exists.' },
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      title: title || 'Full Stack Developer',
      skills: Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map(s => s.trim()) : ['JavaScript', 'React', 'Node.js', 'MongoDB']),
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        title: user.title,
        skills: user.skills,
        links: user.links,
        emailConfig: user.getDecryptedEmailConfig ? user.getDecryptedEmailConfig() : user.emailConfig,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    // Strict type check to prevent NoSQL operator injection
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email and password must be valid text strings.' },
      });
    }

    email = email.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Email and password are required.' },
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        title: user.title,
        skills: user.skills,
        links: user.links,
        emailConfig: user.getDecryptedEmailConfig ? user.getDecryptedEmailConfig() : user.emailConfig,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const userObj = user.toObject();
    userObj.emailConfig = user.getDecryptedEmailConfig ? user.getDecryptedEmailConfig() : user.emailConfig;

    res.json({
      success: true,
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, title, skills, links, emailConfig } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    if (name && typeof name === 'string') user.name = name.trim();
    if (title && typeof title === 'string') user.title = title.trim();
    if (skills) user.skills = Array.isArray(skills) ? skills : String(skills).split(',').map(s => s.trim());
    if (links && typeof links === 'object') user.links = { ...user.links, ...links };
    if (emailConfig && typeof emailConfig === 'object') user.emailConfig = { ...user.emailConfig, ...emailConfig };

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        title: user.title,
        skills: user.skills,
        links: user.links,
        emailConfig: user.getDecryptedEmailConfig ? user.getDecryptedEmailConfig() : user.emailConfig,
      },
    });
  } catch (err) {
    next(err);
  }
};
