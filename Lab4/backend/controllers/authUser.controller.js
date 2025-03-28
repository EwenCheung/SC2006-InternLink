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
    // Add role and pass entire req.body to create
    user = await JobSeeker.create({ ...req.body, role });
  } else {
    const { email, password, companyName } = req.body;
    if (!email || !password || !companyName) {
      throw new BadRequestError('Please provide all required fields');
    }
    // Add role and pass entire req.body to create
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

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }
  
  // Check both employer and jobseeker collections
  const user = await Promise.any([
    Employer.findOne({ email }),
    JobSeeker.findOne({ email })
  ]);
  
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials');
  }
  
  const isPasswordCorrect = await user.comparePassword(password);
  
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid credentials');
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
};
