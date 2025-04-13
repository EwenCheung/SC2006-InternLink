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

  try {
    let userData = { ...req.body };

    // Handle profile image upload
    if (req.file) {
      userData.profileImage = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
        uploadedAt: new Date(),
        size: req.file.size
      };
    }

    // Create user based on role
    const Model = role === 'jobseeker' ? JobSeeker : Employer;
    const user = await Model.create(userData);

    const token = user.createJWT();
    const userProfile = {
      id: user._id,
      role: role,
      name: role === 'jobseeker' ? user.userName : user.companyName,
      email: user.email,
      // Only add URLs, don't include binary data in response
      profileImageUrl: user.profileImage ? 
        `/api/auth/files/profileImage/${user._id}` : null
    };

    res.status(StatusCodes.CREATED).json({
      success: true,
      user: userProfile,
      token,
      message: 'Registration successful'
    });
  } catch (error) {
    // Check for MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    
    // Handle other registration errors
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }
    
    // Convert email to lowercase for case-insensitive lookup
    const normalizedEmail = email.toLowerCase();

    // Try JobSeeker first, then Employer
    let user = await JobSeeker.findOne({ email: normalizedEmail });
    let role = 'jobseeker';
    
    if (!user) {
      user = await Employer.findOne({ email: normalizedEmail });
      role = 'employer';
    }
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'No account found with this email'
      });
    }
    
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Incorrect password'
      });
    }
    
    const token = user.createJWT();
    const userProfile = {
      id: user._id,
      role: role,
      name: role === 'jobseeker' ? user.userName : user.companyName,
      email: user.email,
      profileImageUrl: user.profileImage?.data ? 
        `/api/auth/files/profileImage/${user._id}` : null
    };

    res.status(StatusCodes.OK).json({
      success: true,
      user: userProfile,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
};

// Get User Profile
export const getProfile = async (req, res) => {
  const { userId, role } = req.user;
  
  try {
    const Model = role === 'jobseeker' ? JobSeeker : Employer;
    console.log('Looking for user:', { userId, role });
    
    console.log('Looking for user in database:', {
      userId,
      role,
      model: Model.modelName,
      database: Model.db.name
    });
    
    const user = await Model.findById(userId);
    console.log('Database response:', {
      found: !!user,
      id: user?._id,
      role: user?.role,
      model: Model.modelName
    });

    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Transform user data
    const userProfile = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: role === 'jobseeker' ? user.userName : user.companyName,
      ...user.toObject(),
      // Don't include binary data in response
      profileImage: user.profileImage ? {
        contentType: user.profileImage.contentType,
        originalName: user.profileImage.originalName,
        uploadedAt: user.profileImage.uploadedAt,
        size: user.profileImage.size,
        url: `/api/auth/files/profileImage/${user._id}`
      } : null,
      resume: user.resume ? {
        contentType: user.resume.contentType,
        originalName: user.resume.originalName,
        uploadedAt: user.resume.uploadedAt,
        size: user.resume.size,
        url: `/api/auth/files/resume/${user._id}`
      } : null
    };

    // Remove binary data and password from response
    delete userProfile.profileImage?.data;
    delete userProfile.resume?.data;
    delete userProfile.password;

    res.status(StatusCodes.OK).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    throw new BadRequestError(error.message);
  }
};

// Get Job Seeker Profile by ID
export const getJobSeekerProfile = async (req, res) => {
  const { id } = req.params;
  
  try {
    let user = await JobSeeker.findById(id);
    
    // If user not found, return 404
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    // Get profile image and resume info if they exist
    if (user.profileImage?.fileId) {
      const fileInfo = await getFileInfo(user.profileImage.fileId, 'profileImages');
      if (fileInfo) {
        user.profileImage = {
          ...user.profileImage,
          contentType: fileInfo.metadata?.contentType || 'image/jpeg',
          originalName: fileInfo.metadata?.originalName || fileInfo.filename,
          filename: fileInfo.filename,
          size: fileInfo.length || 0
        };
      }
    }
    
    if (user.resume?.fileId) {
      const resumeInfo = await getFileInfo(user.resume.fileId, 'resumes');
      if (resumeInfo) {
        user.resume = {
          ...user.resume,
          contentType: resumeInfo.metadata?.contentType || 'application/pdf',
          originalName: resumeInfo.metadata?.originalName || resumeInfo.filename,
          filename: resumeInfo.filename,
          size: resumeInfo.length || 0
        };
      }
    }

    // Transform resume information
    const userObj = user.toObject();
    const { password, ...userProfile } = userObj;

    // Add URLs for profile image and resume
    if (userProfile.profileImage?.fileId) {
      userProfile.profileImage.url = `/api/auth/files/profileImage/${userProfile.profileImage.fileId}`;
    }

    if (userProfile.resume?.fileId) {
      const resumeInfo = await getFileInfo(userProfile.resume.fileId, 'resumes');
      if (resumeInfo) {
        userProfile.resume = {
          ...userProfile.resume,
          url: `/api/auth/files/resume/${userProfile.resume.fileId}`,
          contentType: resumeInfo.metadata?.contentType || 'application/pdf',
          originalName: resumeInfo.metadata?.originalName || resumeInfo.filename,
          filename: resumeInfo.filename,
          size: resumeInfo.length || 0
        };
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};


// Update User
export const updateUser = async (req, res) => {
  try {
    const { userId, role } = req.user;
    
    const Model = role === 'jobseeker' ? JobSeeker : Employer;
    
    console.log('Updating user:', { userId, role });
    console.log('Request body:', req.body);
    console.log('Files received:', req.files);
    
    let updates = {};

    // Handle regular fields
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (!['password', 'email', 'role', '_id'].includes(key)) {
          updates[key] = req.body[key];
        }
      });
    }

    // Check if resume should be deleted (if resumeDeleted flag is present)
    if (req.body && req.body.resumeDeleted === 'true') {
      console.log('Resume deletion requested');
      updates.$unset = { resume: "" };
    }

    // Handle file uploads
    if (req.files) {
      // Handle profile image
      if (req.files.profileImage && req.files.profileImage[0]) {
        const profileFile = req.files.profileImage[0];
        console.log('Processing profile image:', profileFile);
        
        updates.profileImage = {
          data: profileFile.buffer,
          contentType: profileFile.mimetype,
          originalName: profileFile.originalname,
          uploadedAt: new Date(),
          size: profileFile.size
        };
      }

      // Handle resume upload (only if not deleting)
      if (req.files.resume && req.files.resume[0] && !req.body.resumeDeleted) {
        const resumeFile = req.files.resume[0];
        console.log('Processing resume:', resumeFile);
        
        updates.resume = {
          data: resumeFile.buffer,
          contentType: resumeFile.mimetype,
          originalName: resumeFile.originalname,
          uploadedAt: new Date(),
          size: resumeFile.size
        };
      }
    } else if (req.file) {
      // Handle single file upload
      const fieldname = req.file.fieldname;
      updates[fieldname] = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
        uploadedAt: new Date(),
        size: req.file.size
      };
    }

    const user = await Model.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    );

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Transform response data
    const userProfile = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: role === 'jobseeker' ? user.userName : user.companyName,
      ...user.toObject()
    };

    // Don't include binary data in the response
    if (userProfile.profileImage?.data) {
      userProfile.profileImage = {
        contentType: user.profileImage.contentType,
        originalName: user.profileImage.originalName,
        uploadedAt: user.profileImage.uploadedAt,
        size: user.profileImage.size,
        url: `/api/auth/files/profileImage/${user._id}`
      };
    }
    
    if (userProfile.resume?.data) {
      userProfile.resume = {
        contentType: user.resume.contentType,
        originalName: user.resume.originalName,
        uploadedAt: user.resume.uploadedAt,
        size: user.resume.size,
        url: `/api/auth/files/resume/${user._id}`
      };
    }

    delete userProfile.password;

    res.status(StatusCodes.OK).json({
      success: true,
      data: userProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

// Update contact list
export const updateContactList = async (req, res) => {
  const { userId, role } = req.user;
  const { contactList } = req.body;

  if (!Array.isArray(contactList)) {
    throw new BadRequestError('Contact list must be an array');
  }

  try {
    // Choose the correct model based on user role
    const Model = role === 'jobseeker' ? JobSeeker : Employer;
    
    const user = await Model.findByIdAndUpdate(
      userId,
      { contactList },
      { new: true }
    );

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: { contactList: user.contactList }
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

// Serve File - Send profile image or resume file
export const serveFile = async (req, res) => {
  try {
    const { userId, type } = req.params;
    const isResume = type === 'resume';
    
    // Determine which model to query based on explicit role parameter or infer from URL
    const role = req.query.role;
    let Model;
    
    if (role && role === 'employer') {
      Model = Employer;
    } else {
      // Try JobSeeker first, then Employer if not found
      const jobseeker = await JobSeeker.findById(userId);
      if (jobseeker) {
        Model = JobSeeker;
      } else {
        Model = Employer;
      }
    }
    
    const user = await Model.findById(userId);
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const fileField = isResume ? 'resume' : 'profileImage';
    const file = user[fileField];
    
    // If profile image is requested but not found, redirect to default image
    if (!isResume && (!file || !file.data)) {
      return res.redirect('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png');
    }
    
    // For resume, return 404 if not found
    if (isResume && (!file || !file.data)) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'File not found'
      });
    }
    
    const contentType = file.contentType || 
                        (isResume ? 'application/pdf' : 'image/jpeg');
    
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `${isResume ? 'attachment' : 'inline'}; filename="${file.originalName || 'file'}"`,
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(file.data);
    
  } catch (error) {
    console.error('Error serving file:', error);
    // For profile images, redirect to default on error
    if (req.params.type === 'profileImage') {
      return res.redirect('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png');
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error serving file'
    });
  }
};

// Delete File (resume or profile image)
export const deleteFile = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { type } = req.params;
    
    if (!type || !['profileImage', 'resume'].includes(type)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Invalid file type specified'
      });
    }
    
    const Model = role === 'jobseeker' ? JobSeeker : Employer;
    
    // For profile images, set to null instead of removing field
    // For resumes, completely remove the field
    const update = type === 'profileImage' 
      ? { $unset: { [`${type}.data`]: "", [`${type}.contentType`]: "", [`${type}.originalName`]: "", [`${type}.uploadedAt`]: "", [`${type}.size`]: "" } }
      : { $unset: { [type]: "" } };
    
    const user = await Model.findByIdAndUpdate(
      userId,
      update,
      { new: true }
    );
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: `${type === 'profileImage' ? 'Profile image' : 'Resume'} deleted successfully`
    });
    
  } catch (error) {
    console.error(`Error deleting file:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Error deleting file'
    });
  }
};

// Update work experience
export const updateWorkExperience = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { workExperience } = req.body;

    // Only JobSeekers can update work experience
    if (role !== 'jobseeker') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only job seekers can update work experience'
      });
    }

    if (!Array.isArray(workExperience)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Work experience must be an array'
      });
    }

    const user = await JobSeeker.findByIdAndUpdate(
      userId,
      { workExperience },
      { new: true }
    );

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Profile not found'
      });
    }

    console.log('Work experience updated successfully:', workExperience.length);

    res.status(StatusCodes.OK).json({
      success: true,
      data: { workExperience: user.workExperience }
    });
  } catch (error) {
    console.error('Error updating work experience:', error);
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message || 'Failed to update work experience'
    });
  }
};

// Update academic history
export const updateAcademicHistory = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { academicHistory } = req.body;

    // Only JobSeekers can update academic history
    if (role !== 'jobseeker') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Only job seekers can update academic history'
      });
    }

    if (!Array.isArray(academicHistory)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Academic history must be an array'
      });
    }

    console.log('Updating academic history:', {
      userId,
      itemCount: academicHistory.length,
      items: academicHistory
    });

    const user = await JobSeeker.findByIdAndUpdate(
      userId,
      { academicHistory },
      { new: true }
    );

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Profile not found'
      });
    }

    console.log('Academic history updated successfully');

    res.status(StatusCodes.OK).json({
      success: true,
      data: { academicHistory: user.academicHistory }
    });
  } catch (error) {
    console.error('Error updating academic history:', error);
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message || 'Failed to update academic history'
    });
  }
};
