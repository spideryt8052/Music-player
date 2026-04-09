const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const normalizeMobileNumber = (value) => (value || '').replace(/[^0-9+]/g, '').trim();

const generateOtpCode = () => String(crypto.randomInt(100000, 1000000));

const maskMobileNumber = (value) => {
  const mobileNumber = normalizeMobileNumber(value);
  if (mobileNumber.length <= 4) return mobileNumber;
  return `${mobileNumber.slice(0, 2)}****${mobileNumber.slice(-2)}`;
};

const sendOtpToMobile = async (mobileNumber, otpCode) => {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: mobileNumber,
        From: twilioFrom,
        Body: `Your MusicPlayer login OTP is ${otpCode}. It expires in 10 minutes.`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send OTP via Twilio: ${errorText}`);
    }

    return { sent: true, provider: 'twilio' };
  }

  console.log(`[OTP][DEV] ${mobileNumber}: ${otpCode}`);
  return { sent: true, provider: 'console' };
};

const register = async (req, res) => {
  try {
    const { username, email, password, mobileNumber } = req.body;

    // Validation
    if (!username || !email || !password || !mobileNumber) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);
    if (normalizedMobileNumber.length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid mobile number' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const existingMobileUser = await User.findOne({ mobileNumber: normalizedMobileNumber });
    if (existingMobileUser) {
      return res.status(400).json({ success: false, message: 'Mobile number already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      mobileNumber: normalizedMobileNumber,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        mobileNumber: newUser.mobileNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      username: user.username,
      isAdmin: user.isAdmin,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobileNumber: user.mobileNumber,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestMobileOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);

    if (!normalizedMobileNumber || normalizedMobileNumber.length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid mobile number' });
    }

    const user = await User.findOne({ mobileNumber: normalizedMobileNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that mobile number' });
    }

    const otpCode = generateOtpCode();
    const otpHash = await bcrypt.hash(otpCode, 10);
    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpToMobile(normalizedMobileNumber, otpCode);

    res.status(200).json({
      success: true,
      message: `OTP sent to ${maskMobileNumber(normalizedMobileNumber)}`,
      devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyMobileOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);

    if (!normalizedMobileNumber || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide mobile number and OTP' });
    }

    const user = await User.findOne({ mobileNumber: normalizedMobileNumber });
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: 'OTP not requested for this account' });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const isOtpValid = await bcrypt.compare(String(otp), user.otpHash);
    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      username: user.username,
      isAdmin: user.isAdmin,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobileNumber: user.mobileNumber,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email and new password' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, forgotPassword, requestMobileOtp, verifyMobileOtp };