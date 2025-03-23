const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

// Register User
const register = async (req, res) => {
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
    user = await JobSeeker.create({ email, password, userName, role });
  } else {
    const { email, password, companyName } = req.body;
    if (!email || !password || !companyName) {
      throw new BadRequestError('Please provide all required fields');
    }
    user = await Employer.create({ email, password, companyName, role });
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
const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }
  
  const user = await User.findOne({ email });
  
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

module.exports = {
  register,
  login
};
