import JobSeeker from '../models/JobSeeker.model.js';
import bcrypt from 'bcryptjs';
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
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || 'An unexpected error occurred',
    });
    }
    // For other errors, throw a generic auth error
    throw new UnauthenticatedError('Authentication failed');
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password, currentPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ message: "Current password is required!" });
  }

  try {
    const user = await JobSeeker.findOne({ _id: id });
    if (!user) {
      return res.status(400).json({ message: "User not exists!" });
    }

    
    const isPasswordCorrect = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect!" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    await JobSeeker.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Delete user by ID
export const deleteUserById = async (req, res) => {
  const { id } = req.params;

  try {
    // Try to find and delete from both collections
    const deletedJobSeeker = await JobSeeker.findByIdAndDelete(id);
    const deletedEmployer = await Employer.findByIdAndDelete(id);

    if (!deletedJobSeeker && !deletedEmployer) {
      throw new BadRequestError('User not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

// Delete user by email
export const deleteUserByEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError('Please provide an email');
  }

  try {
    // Try to find and delete from both collections
    const deletedJobSeeker = await JobSeeker.findOneAndDelete({ email });
    const deletedEmployer = await Employer.findOneAndDelete({ email });

    if (!deletedJobSeeker && !deletedEmployer) {
      throw new BadRequestError('User not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};
