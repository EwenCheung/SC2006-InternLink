import JobSeeker from '../models/JobSeeker.model.js';
import Employer from '../models/Employer.model.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';

// Register User
export const register = async (req, res) => {
  const { role } = req.body;
  
  if (!role || !['jobseeker', 'employer'].includes(role)) {
    throw new BadRequestError('Please provide a valid role');
  }
  
  let user;
  
  if (role === 'jobseeker') {
    const { email, password, userName } = req.body;
    if (!email || !password || !userName) {
      throw new BadRequestError('Please provide all required fields');
    }
    user = await JobSeeker.create({ ...req.body, role });
  } else {
    const { email, password, companyName } = req.body;
    if (!email || !password || !companyName) {
      throw new BadRequestError('Please provide all required fields');
    }
    user = await Employer.create({ ...req.body, role });
  }
  
  const token = user.createJWT();
  
  res.status(StatusCodes.CREATED).json({
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: role === 'jobseeker' ? user.userName : user.companyName
    },
    token
  });
};

// Update User Profile
export const updateUser = async (req, res) => {
  const { role } = req.user;
  const userId = req.user.userId;
  
  const updates = { ...req.body };
  delete updates.password;
  delete updates.email;
  delete updates.role;
  
  let user;
  
  try {
    if (role === 'jobseeker') {
      user = await JobSeeker.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!user) {
        throw new BadRequestError('JobSeeker not found');
      }
    } else {
      user = await Employer.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      if (!user) {
        throw new BadRequestError('Employer not found');
      }
    }
    
    res.status(StatusCodes.OK).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: role === 'jobseeker' ? user.userName : user.companyName,
        ...updates
      }
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }
  
  try {
    // Check both collections sequentially instead of using Promise.any
    let user = await JobSeeker.findOne({ email });
    if (!user) {
      user = await Employer.findOne({ email });
    }
    
    if (!user) {
      throw new UnauthenticatedError('Invalid email or password');
    }
    
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError('Invalid email or password');
    }
    
    const token = user.createJWT();
    
    res.status(StatusCodes.OK).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.role === 'jobseeker' ? user.userName : user.companyName
      },
      token
    });
  } catch (error) {
    // Check if it's our custom error
    if (error instanceof UnauthenticatedError) {
      throw error;
    }
    // For other errors, throw a generic auth error
    throw new UnauthenticatedError('Authentication failed');
  }
};

// Update sensitive information
export const updateSensitiveInfo = async (req, res) => {
  const { userId, role } = req.user;
  const { newEmail, newPassword, currentPassword } = req.body;

  if (!currentPassword) {
    throw new BadRequestError('Current password is required');
  }
  if (!newEmail && !newPassword) {
    throw new BadRequestError('Please provide either new email or new password');
  }

  let user;
  try {
    const UserModel = role === 'jobseeker' ? JobSeeker : Employer;
    user = await UserModel.findById(userId);

    if (!user) {
      throw new BadRequestError('User not found');
    }

    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError('Invalid current password');
    }

    if (newEmail) {
      const jobSeekerExists = await JobSeeker.findOne({ email: newEmail, _id: { $ne: userId } });
      const employerExists = await Employer.findOne({ email: newEmail, _id: { $ne: userId } });

      if (jobSeekerExists || employerExists) {
        throw new BadRequestError('Email already in use');
      }
      user.email = newEmail;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        throw new BadRequestError('Password must be at least 6 characters long');
      }
      user.password = newPassword;
    }

    await user.save();
    const token = user.createJWT();

    res.status(StatusCodes.OK).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: role === 'jobseeker' ? user.userName : user.companyName
      },
      message: 'Profile updated successfully',
      token
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new BadRequestError('Email already in use');
    }
    throw error;
  }
};
