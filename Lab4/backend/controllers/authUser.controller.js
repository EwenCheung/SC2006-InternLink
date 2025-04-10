import mongoose from 'mongoose';
import JobSeeker from '../models/JobSeeker.model.js';
import bcrypt from 'bcryptjs';
import Employer from '../models/Employer.model.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';
import { getFileInfo, deleteFile, getFileStream } from '../config/gridfs.js';

// Helper functions for file handling
const cleanupUserFiles = async (user) => {
  if (user?.profileImage?.fileId) {
    await cleanupFile(user.profileImage.fileId, 'profileImages');
  }
  if (user?.resume?.fileId) {
    await cleanupFile(user.resume.fileId, 'resumes');
  }
};

const validateFileType = (mimetype, fileType) => {
  const allowedTypes = {
    resume: {
      'application/pdf': true
    },
    profileImage: {
      'image/jpeg': true,
      'image/png': true
    }
  };

  if (!allowedTypes[fileType]?.[mimetype]) {
    if (fileType === 'resume') {
      throw new BadRequestError('Invalid file type. Only PDF files are allowed for resumes.');
    } else {
      throw new BadRequestError('Invalid file type. Only PNG, JPG and JPEG files are allowed for profile photos.');
    }
  }
  return true;
};

const cleanupFile = async (fileId, bucket) => {
  if (fileId) {
    try {
      const result = await deleteFile(fileId, bucket);
      if (!result) {
        console.error(`Failed to delete file ${fileId} from ${bucket}`);
      }
    } catch (error) {
      console.error(`Error cleaning up file ${fileId} from ${bucket}:`, error);
    }
  }
};


// Register User
export const register = async (req, res) => {
  const { role } = req.body;
  
  if (!role || !['jobseeker', 'employer'].includes(role)) {
    throw new BadRequestError('Please provide a valid role');
  }
  
  let user;
  let profileData = { ...req.body };

<<<<<<< HEAD
=======


// Update User Profile
export const updateUser = async (req, res) => {
  const { role } = req.user;
  const userId = req.user.userId;
  
  const updates = { ...req.body };
  delete updates.password;
  delete updates.email;
  delete updates.role;
  
  let user;
  
>>>>>>> Alvin-Branch
  try {
    // Handle profile image upload if provided
    if (req.file) {
      const fileInfo = await getFileInfo(req.file.filename, 'profileImages');
      if (!fileInfo) {
        throw new Error('Failed to process uploaded file');
      }
      
      const imageUrl = `/api/auth/files/profileImage/${fileInfo._id}`;
      profileData.profileImage = {
        fileId: fileInfo._id,
        url: imageUrl,
        uploadedAt: new Date(),
        contentType: fileInfo.metadata?.contentType || 'image/jpeg',
        originalName: fileInfo.metadata?.originalName,
        filename: fileInfo.filename,
        size: fileInfo.length || 0
      };
    } else {
      // Use default image URL if no image uploaded
      profileData.profileImage = {
        fileId: null,
        url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        uploadedAt: new Date(),
        contentType: 'image/jpeg',
        originalName: 'default-profile.jpg',
        filename: 'default-profile.jpg',
        size: 0
      };
    }
    
    if (role === 'jobseeker') {
      const { email, password, userName } = profileData;
      if (!email || !password || !userName) {
        throw new BadRequestError('Please provide all required fields');
      }
      user = await JobSeeker.create(profileData);
      // Populate the profile image data
      user = await JobSeeker.findById(user._id);
      
      // Get profile image info if exists
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
    } else {
      const { email, password, companyName } = profileData;
      if (!email || !password || !companyName) {
        throw new BadRequestError('Please provide all required fields');
      }
      user = await Employer.create(profileData);
      // Populate the profile image data
      user = await Employer.findById(user._id);
      
      // Get profile image info if exists
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
    }
    
    const token = user.createJWT();
    
    // Ensure profile image URL is set properly
    const userProfile = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: role === 'jobseeker' ? user.userName : user.companyName,
      profileImage: user.profileImage
    };

    if (userProfile.profileImage?.fileId) {
      userProfile.profileImage.url = `/api/auth/files/profileImage/${userProfile.profileImage.fileId}`;
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      user: userProfile,
      token,
      message: 'Registration successful'
    });
  } catch (error) {
    // Clean up uploaded file if user creation fails
    if (req.file && fileInfo?._id) {
      await cleanupFile(fileInfo._id, 'profileImages');
    }
    throw error;
  }
};

// Get User Profile
export const getProfile = async (req, res) => {
  const { userId, role } = req.user;
  
  try {
    let user;
    if (role === 'jobseeker') {
      user = await JobSeeker.findById(userId);
      
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
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'No profile found',
          data: {
            userName: 'New User',
            school: 'Select School',
            course: 'Select Course',
            yearOfStudy: 'Year 1',
            email: '',
            contact: '',
            profileImage: {
              fileId: null,
              url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
              uploadedAt: new Date(),
              contentType: 'image/jpeg',
              originalName: 'default-profile.jpg',
              filename: 'default-profile.jpg',
              size: 0
            }
          }
        });
      }
    } else {
      user = await Employer.findById(userId);
      
      // Get profile image info if exists
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
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'No profile found',
          data: {
            companyName: 'New Company',
            industry: 'Select Industry',
            companySize: 'Select Size',
            email: '',
            contact: '',
            profileImage: {
              fileId: null,
              url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
              uploadedAt: new Date(),
              contentType: 'image/jpeg',
              originalName: 'default-profile.jpg',
              filename: 'default-profile.jpg',
              size: 0
            }
          }
        });
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

// Update single field
export const updateField = async (req, res) => {
  const { field, value } = req.body;
  const { role, userId } = req.user;

  if (!field || value === undefined) {
    throw new BadRequestError('Field and value are required');
  }

  // Protected fields that can't be updated this way
  const protectedFields = ['password', 'email', 'role', '_id'];
  if (protectedFields.includes(field)) {
    throw new BadRequestError('This field cannot be updated directly');
  }

  try {
    const Model = role === 'jobseeker' ? JobSeeker : Employer;
    const update = { [field]: value };

    const user = await Model.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Transform response to match consistent format
    res.status(StatusCodes.OK).json({
      success: true,
      data: { [field]: user[field] },
      message: `${field} updated successfully`
    });
  } catch (error) {
<<<<<<< HEAD
    throw new BadRequestError(error.message);
  }
};

// Update multiple fields
export const updateUser = async (req, res) => {
  const { role, userId } = req.user;
  
  const updates = { ...req.body };
  const protectedFields = ['password', 'email', 'role', '_id'];
  protectedFields.forEach(field => delete updates[field]);
  
  try {
    const Model = role === 'jobseeker' ? JobSeeker : Employer;
    const user = await Model.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    )
    .populate({
      path: 'profileImage.fileId',
      select: 'filename metadata'
    })
    .populate({
      path: 'resume.fileId',
      select: 'filename metadata'
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }
    
    const { password, ...userProfile } = user.toObject();

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
      data: userProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

// Handle Resume Upload
export const handleResumeUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload a file'
        });
    }

    const { userId, role } = req.user;
    const { filename, mimetype } = req.file;
    let fileInfo;

    try {
        // Validate file type
        validateFileType(mimetype, 'resume');
        if (role !== 'jobseeker') {
            throw new Error('Only job seekers can upload resumes');
        }

        // Get the GridFS file information
        fileInfo = await getFileInfo(filename, 'resumes');
        if (!fileInfo) {
            throw new Error('Failed to process uploaded file');
        }

        // Delete old resume if it exists
        const user = await JobSeeker.findById(userId);
        if (user?.resume?.fileId) {
            await cleanupFile(user.resume.fileId, 'resumes');
        }
    
        const updatedUser = await JobSeeker.findByIdAndUpdate(
            userId,
            { 
                resume: {
                    fileId: fileInfo._id,
                    uploadedAt: new Date(),
                    contentType: fileInfo.metadata?.contentType || 'application/pdf',
                    originalName: fileInfo.metadata?.originalName,
                    filename: fileInfo.filename,
                    size: fileInfo.length || 0
                }
            },
            { new: true }
        ).populate({
            path: 'resume.fileId',
            select: 'filename metadata'
        });

        if (!updatedUser) {
            throw new Error('User not found');
        }

        const resumeUrl = `/api/auth/files/resume/${fileInfo._id}`;

        return res.status(StatusCodes.OK).json({
            success: true,
            resume: {
                fileId: fileInfo._id,
                uploadedAt: new Date(),
                url: resumeUrl,
                contentType: fileInfo.metadata?.contentType || 'application/pdf',
                originalName: fileInfo.metadata?.originalName || fileInfo.filename,
                filename: fileInfo.filename,
                size: fileInfo.length || 0
            },
            message: 'Resume uploaded successfully'
        });
    } catch (error) {
        // Clean up uploaded file if user update fails
        if (fileInfo?._id) {
            await cleanupFile(fileInfo._id, 'resumes');
        }
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to upload resume'
        });
    }
};

// Upload Profile Photo
export const uploadProfilePhoto = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload a file'
        });
    }

    const { userId, role } = req.user;
    const { filename, mimetype } = req.file;
    let fileInfo;
    
    try {
        // Validate file type
        validateFileType(mimetype, 'profileImage');
        const Model = role === 'jobseeker' ? JobSeeker : Employer;
        
        // Get the GridFS file information
        fileInfo = await getFileInfo(filename, 'profileImages');
        if (!fileInfo) {
            throw new Error('Failed to process uploaded file');
        }
        
        // Delete old profile image if it exists
        const user = await Model.findById(userId);
        if (user?.profileImage?.fileId) {
            await cleanupFile(user.profileImage.fileId, 'profileImages');
        }

        const updatedUser = await Model.findByIdAndUpdate(
            userId,
            { 
                profileImage: {
                    fileId: fileInfo._id,
                    uploadedAt: new Date(),
                    contentType: fileInfo.metadata?.contentType || 'image/jpeg',
                    originalName: fileInfo.metadata?.originalName,
                    filename: fileInfo.filename,
                    size: fileInfo.length || 0
                }
            },
            { new: true }
        ).populate({
            path: 'profileImage.fileId',
            select: 'filename metadata'
        });

        if (!updatedUser) {
            throw new Error('User not found');
        }

        // Add profile URL to response
        const imageUrl = `/api/auth/files/profileImage/${fileInfo._id}`;
        const profileImage = {
            fileId: fileInfo._id,
            uploadedAt: new Date(),
            url: imageUrl,
            contentType: fileInfo.metadata?.contentType || 'image/jpeg',
            originalName: fileInfo.metadata?.originalName || 'profile.jpg',
            filename: fileInfo.filename || 'profile.jpg',
            size: fileInfo.length || 0
        };

        return res.status(StatusCodes.OK).json({
            success: true,
            profileImage,
            message: 'Profile photo updated successfully'
        });
    } catch (error) {
        // Clean up uploaded file if user update fails
        if (fileInfo?._id) {
            await cleanupFile(fileInfo._id, 'profileImages');
        }
        return res.status(400).json({
            success: false,
            message: error.message || 'Failed to update profile photo'
        });
    }
};

// Stream File with proper headers
export const streamFile = async (req, res) => {
    try {
        const { fileId, type } = req.params;
        const bucketName = type === 'resume' ? 'resumes' : 'profileImages';
        
        // Get file info first
        const fileInfo = await getFileInfo(fileId, bucketName);
        if (!fileInfo) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Determine content type and validate file
        const fileType = bucketName === 'resumes' ? 'resume' : 'profileImage';
        const contentType = (() => {
            // First try to use metadata content type
            if (fileInfo.metadata?.contentType) {
                validateFileType(fileInfo.metadata.contentType, fileType);
                return fileInfo.metadata.contentType;
            }

            // Fallback to extension-based detection
            const ext = fileInfo.filename.split('.').pop().toLowerCase();
            const mimeType = ext === 'pdf' ? 'application/pdf' : 
                           ext === 'png' ? 'image/png' : 
                           'image/jpeg';
            validateFileType(mimeType, fileType);
            return mimeType;
        })();

        // Set cache control headers for better performance
        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${fileInfo.metadata?.originalName || fileInfo.filename}"`,
            'Cache-Control': 'public, max-age=3600',
            'Last-Modified': fileInfo.uploadDate.toUTCString()
        });
        
        // Stream file using helper function
        const stream = getFileStream(fileId, bucketName);
        stream.pipe(res);
        
        stream.on('error', (err) => {
            console.error('Streaming error:', err);
            // Only send error if headers haven't been sent
            if (!res.headersSent) {
                res.status(404).json({
                    success: false,
                    message: 'Error streaming file'
                });
            }
        });
    } catch (error) {
        console.error('File streaming error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Error streaming file',
                error: error.message
            });
        }
    }
};

// Update sensitive information
export const updateSensitiveInfo = async (req, res) => {
  const { userId, role } = req.user;
  const { newEmail, newPassword, currentPassword } = req.body;
=======
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
>>>>>>> Alvin-Branch

  if (!currentPassword) {
    return res.status(400).json({ message: "Current password is required!" });
  }

  try {
<<<<<<< HEAD
    const UserModel = role === 'jobseeker' ? JobSeeker : Employer;
    user = await UserModel.findById(userId)
      .populate({
        path: 'profileImage.fileId',
        select: 'filename metadata'
      })
      .populate({
        path: 'resume.fileId',
        select: 'filename metadata'
      });

=======
    const user = await JobSeeker.findOne({ _id: id });
>>>>>>> Alvin-Branch
    if (!user) {
      return res.status(400).json({ message: "User not exists!" });
    }

    
    const isPasswordCorrect = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect!" });
    }

<<<<<<< HEAD
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
    
    // Re-fetch user to get populated data
    user = await UserModel.findById(userId)
      .populate({
        path: 'profileImage.fileId',
        select: 'filename metadata'
      })
      .populate({
        path: 'resume.fileId',
        select: 'filename metadata'
      });
      
    const token = user.createJWT();

    // Add profile image data with consistent metadata
    const userProfile = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: role === 'jobseeker' ? user.userName : user.companyName,
      profileImage: user.profileImage?.fileId ? {
        fileId: user.profileImage.fileId,
        url: `/api/auth/files/profileImage/${user.profileImage.fileId}`,
        uploadedAt: user.profileImage.uploadedAt || new Date(),
        contentType: user.profileImage.contentType || 'image/jpeg',
        originalName: user.profileImage.originalName || 'profile.jpg',
        filename: user.profileImage.filename || 'profile.jpg',
        size: user.profileImage.size || 0
      } : {
        fileId: null,
        url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        uploadedAt: new Date(),
        contentType: 'image/jpeg',
        originalName: 'default-profile.jpg',
        filename: 'default-profile.jpg',
        size: 0
      }
    };

    res.status(StatusCodes.OK).json({
      success: true,
      user: userProfile,
      token,
      message: 'Profile updated successfully'
    });
=======
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
>>>>>>> Alvin-Branch
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
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
    let user = await JobSeeker.findOne({ email }).populate({
      path: 'profileImage.fileId',
      select: 'filename metadata'
    });
    if (!user) {
      user = await Employer.findOne({ email }).populate({
        path: 'profileImage.fileId',
        select: 'filename metadata'
      });
    }
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'There is no account with this email. Please sign up one.'
      });
    }
    
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }
    
    const token = user.createJWT();
    
    // Add profile image data
    const userProfile = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.role === 'jobseeker' ? user.userName : user.companyName,
      profileImage: user.profileImage?.fileId ? {
        fileId: user.profileImage.fileId,
        url: `/api/auth/files/profileImage/${user.profileImage.fileId}`,
        uploadedAt: user.profileImage.uploadedAt || new Date(),
        contentType: user.profileImage.contentType || 'image/jpeg',
        originalName: user.profileImage.originalName || 'profile.jpg',
        filename: user.profileImage.filename || 'profile.jpg',
        size: user.profileImage.size || 0
      } : {
        fileId: null,
        url: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        uploadedAt: new Date(),
        contentType: 'image/jpeg',
        originalName: 'default-profile.jpg',
        filename: 'default-profile.jpg',
        size: 0
      }
    };

    return res.status(StatusCodes.OK).json({
      success: true,
      user: userProfile,
      token
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

// Update contact list
export const updateContactList = async (req, res) => {
  const { userId, role } = req.user;
  const { contactList } = req.body;

  if (!Array.isArray(contactList)) {
    throw new BadRequestError('Contact list must be an array');
  }

  // Validate each contact
  contactList.forEach(contact => {
    if (!contact.type || !contact.value) {
      throw new BadRequestError('Each contact must have a type and value');
    }
    if (!['email', 'phone', 'github', 'linkedin', 'other'].includes(contact.type)) {
      throw new BadRequestError('Invalid contact type');
    }
  });

  try {
    const user = await JobSeeker.findByIdAndUpdate(
      userId,
      { contactList },
      { new: true, runValidators: true }
    ).select('contactList');

    if (!user) {
      throw new BadRequestError('User not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        contactList: user.contactList
      }
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

// Delete user by ID
export const deleteUserById = async (req, res) => {
  const { id } = req.params;

  try {
    // First find the user to get file references
    let user = await JobSeeker.findById(id);
    if (user) {
      // Delete associated files and user
      await cleanupUserFiles(user);
      await user.deleteOne();
    } else {
      user = await Employer.findById(id);
      if (!user) {
        throw new BadRequestError('User not found');
      }
      // Delete associated files and user
      await cleanupUserFiles(user);
      await user.deleteOne();
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
    // First find the user to get file references
    let user = await JobSeeker.findOne({ email });
    if (user) {
      // Delete associated files and user
      await cleanupUserFiles(user);
      await user.deleteOne();
    } else {
      user = await Employer.findOne({ email });
      if (!user) {
        throw new BadRequestError('User not found');
      }
      // Delete associated files and user
      await cleanupUserFiles(user);
      await user.deleteOne();
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};
