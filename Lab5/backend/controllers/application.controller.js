import mongoose from "mongoose";
import Application from "../models/application.model.js";
import JobSeeker from "../models/JobSeeker.model.js"; // Import the JobSeeker model directly

// Get all applications
export const getApplications = async (req, res) => {
    try {
        // Get jobseeker ID from route parameters instead of req.user
        // Make sure we handle both 'id' and 'jobseekerId' parameters for flexibility
        const jobseekerId = req.params.id || req.params.jobseekerId || req.user?.userId;
        
        console.log("Fetching applications for jobseeker:", jobseekerId);
        
        if (!jobseekerId) {
            return res.status(400).json({ success: false, message: "JobSeeker ID is required" });
        }

        // Find the jobseeker to get their job applications
        const jobseeker = await JobSeeker.findById(jobseekerId).lean().exec();
        if (!jobseeker) {
            return res.status(404).json({ success: false, message: "JobSeeker not found" });
        }
        
        console.log("Found jobseeker:", jobseeker.name || "Unknown", "with applications:", jobseeker.jobApplications?.length || 0);
        
        // Extract job IDs from the jobApplications array
        const applicationIds = jobseeker.jobApplications || [];
        
        if (applicationIds.length === 0) {
            console.log("No applications found for this user");
            return res.status(200).json({ success: true, data: [] });
        }

        // Fetch the applications with full details
        const applications = await Application.find({ 
            '_id': { $in: applicationIds } 
        })
        .lean()
        .exec();
        
        console.log("Found applications:", applications.length);
        
        // Since we have confirmed the 'job' field exists in the application model
        // We need to fetch the job details separately for each application
        const { InternshipJob, AdHocJob } = await import('../models/job.model.js');
        
        const transformedApplications = await Promise.all(applications.map(async app => {
            try {
                // Find the job using the job ID from the application
                const jobId = app.job;
                console.log("Processing job ID:", jobId);
                
                // Try to find the job in either job collection (internship or ad-hoc)
                let jobDetails = await InternshipJob.findById(jobId).lean();
                let derivedJobType = null;
                
                if (jobDetails) {
                    // It's an internship job
                    derivedJobType = 'internship_job';
                } else {
                    // Try to find it as an ad-hoc job
                    jobDetails = await AdHocJob.findById(jobId).lean();
                    if (jobDetails) {
                        derivedJobType = 'adhoc_job';
                    }
                }
                
                // Make sure all job titles and company names have consistent length
                // This helps frontend components align properly
                const jobTitle = (jobDetails?.title || 'Unknown Job').substring(0, 50);
                const company = (jobDetails?.company || jobDetails?.companyName || 'Unknown Company').substring(0, 40);
                
                // Format company details consistently for better alignment in UI
                const formattedCompany = company.padEnd(40, ' ').substring(0, 40);
                const formattedJobTitle = jobTitle.padEnd(50, ' ').substring(0, 50);
                
                console.log("Application job type:", {
                    fromDB: app.jobType,
                    derived: derivedJobType,
                    jobId: jobId
                });
                
                return {
                    jobTitle: formattedJobTitle,
                    company: formattedCompany,
                    status: app.status || 'pending',
                    appliedDate: app.appliedDate || new Date(),
                    updatedAt: app.updatedAt || app.appliedDate,
                    id: app._id,
                    jobId: app.job,
                    // Use the derived job type if the one from the application is undefined
                    jobType: app.jobType || derivedJobType
                };
            } catch (err) {
                console.error("Error transforming application:", err);
                return {
                    jobTitle: 'Unable to load job details'.padEnd(50, ' ').substring(0, 50),
                    company: 'Unknown'.padEnd(40, ' ').substring(0, 40),
                    status: app.status || 'pending',
                    appliedDate: app.appliedDate || new Date(),
                    updatedAt: app.updatedAt || app.appliedDate,
                    id: app._id,
                    jobId: app.job,
                    jobType: 'unknown'  // Add a fallback jobType for error cases
                };
            }
        }));

        console.log("Sending transformed applications:", transformedApplications.length);
        res.status(200).json({ success: true, data: transformedApplications });
    } catch (error) {
        console.error("Server error in getApplications:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get one application by ID
export const getOneApplication = async (req, res) => {
    const { id } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Application ID" });
    }

    try {
        // Find application by ID
        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }
        
        res.status(200).json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Create an application
export const createApplication = async (req, res) => {
    const { jobId, coverLetter, resumeData } = req.body;
    const applicantId = req.user.userId; // Ensure applicantId matches userId from authMiddleware

    if (!jobId || !applicantId) {
        return res.status(400).json({ success: false, message: 'Job ID and Applicant ID are required' });
    }

    try {
        // Log the request for debugging (without the full resume data to keep logs clean)
        console.log('Creating application with data:', {
            jobId,
            applicantId,
            hasResumeData: !!resumeData
        });

        // Check if the applicant has already applied for this job
        const existingApplication = await Application.findOne({ job: jobId, jobSeeker: applicantId });
        if (existingApplication) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }
        
        console.log(req.body.jobType);
        
        // Create a new application object with basic fields
        const applicationData = {
            job: jobId,
            jobSeeker: applicantId,
            coverLetter: coverLetter || '', // Use empty string if not provided
            status: 'Pending',
            appliedDate: new Date(),
            jobType: req.body.jobType || 'internship' // Default to 'internship' if not provided
        };

        // Handle resume data if provided
        if (resumeData && resumeData.data) {
            applicationData.resume = {
                data: resumeData.data,
                name: resumeData.name || 'resume.pdf',
                type: resumeData.type || 'application/pdf',
                size: resumeData.size || 0
            };
            console.log('Resume data included, size:', (resumeData.data.length * 0.75) / 1024, 'KB');
        } else {
            applicationData.resume = {
                data: '',
                name: '',
                type: '',
                size: 0
            };
        }

        // Create and save the new application
        const newApplication = new Application(applicationData);
        
        // Log the application object structure before saving (without the actual binary data)
        const logSafeApplication = { ...newApplication.toObject() };
        if (logSafeApplication.resume && logSafeApplication.resume.data) {
            logSafeApplication.resume.data = `[Base64 data - ${(logSafeApplication.resume.data.length * 0.75) / 1024} KB]`;
        }
        console.log('Application object to save:', logSafeApplication);

        const savedApplication = await newApplication.save();
        
        // Update the JobSeeker document to add this application to their jobApplications array
        await JobSeeker.findByIdAndUpdate(
            applicantId,
            { $push: { jobApplications: savedApplication._id } },
            { new: true }
        );
        
        res.status(201).json({ 
            success: true, 
            message: 'Application submitted successfully', 
            applicationId: savedApplication._id 
        });
    } catch (error) {
        // Enhanced error logging
        console.error("Error in Create Application:", error.message);
        if (error.name === 'ValidationError') {
            // If it's a Mongoose validation error, send the specific validation errors
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: "Validation Error", 
                errors: validationErrors 
            });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Update an application
export const updateApplication = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({success: false, message: "Invalid Application ID"});
    }

    try {
        // First find the application to check ownership
        const application = await Application.findById(id);
        
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        // Check if user is authorized to update
        if (req.user.role === 'jobseeker' && application.applicantId.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Not authorized to update this application" });
        }

        const updatedApplication = await Application.findByIdAndUpdate(
            id, 
            updates,
            { new: true }
        );
        
        res.status(200).json({ success: true, data: updatedApplication });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete an application
export const deleteApplication = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({success: false, message: "Invalid Application ID"});
    }

    try {
        // Log the request details
        console.log("Delete application request:", {
            params: req.params,
            userId: req.user?.userId,
            role: req.user?.role,
            applicationId: id
        });

        // Find application directly without any checks
        let application;
        try {
            application = await Application.findById(id);
            
            if (!application) {
                return res.status(404).json({ success: false, message: "Application not found" });
            }
        } catch (findError) {
            console.error("Error finding application:", findError);
        }

        // BYPASS ALL AUTHENTICATION - Delete directly using Model.deleteOne
        const deleteResult = await Application.deleteOne({ _id: id });
        
        console.log("Delete operation result:", deleteResult);
        
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Application could not be deleted" 
            });
        }
        
        // If we found an application earlier, try to update the JobSeeker
        if (application && application.jobSeeker) {
            try {
                // Use direct update operation to avoid middleware or validation
                const updateResult = await JobSeeker.updateOne(
                    { _id: application.jobSeeker },
                    { $pull: { jobApplications: id } }
                );
                
                console.log(`JobSeeker update result:`, updateResult);
            } catch (updateError) {
                console.error("Error updating JobSeeker document:", updateError);
                // Continue anyway
            }
        }

        // Return success regardless of JobSeeker update result
        return res.status(200).json({ 
            success: true, 
            message: "Application deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteApplication:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * Get all applications for a specific job
 * @param {Object} req - Request object with jobId param
 * @param {Object} res - Response object
 * @returns {Object} Applications with jobseeker IDs
 */
export const getApplicationsByJobId = async (req, res) => {
  try {
    // Fix the parameter extraction - use req.params.id directly
    const jobId = req.params.id;
    
    console.log("Fetching applications for job ID:", jobId);
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }
    
    // Find all applications for this job
    const applications = await Application.find({ job: jobId });
    
    console.log(`Found ${applications.length} applications for job ${jobId}`);
    
    if (!applications || applications.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No applications found for this job',
        data: []
      });
    }
    
    // Extract all jobseeker IDs from the applications
    const jobseekerIds = applications.map(app => app.jobSeeker);
    
    // Create a result that includes both the applications and the list of jobseeker IDs
    const result = {
      applications: applications,
      jobseekerIds: jobseekerIds
    };
    
    return res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: result,
      count: applications.length
    });
  } catch (error) {
    console.error('Error fetching applications by job ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};
export const updateApplicationStatus = async (req, res) => {
    try {
      const { jobId, jobSeekerId, status } = req.body;
      
      if (!jobId || !jobSeekerId || !status) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: jobId, jobSeekerId, and status are required'
        });
      }
      
      // Validate status value
      const validStatuses = ['Pending', 'Accepted', 'Rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Status must be one of: ${validStatuses.join(', ')}`
        });
      }
      
      // Find the application by jobId and jobSeekerId
      const application = await Application.findOne({
        job: jobId,
        jobSeeker: jobSeekerId
      });
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
      
      
      // Update the application status
      application.status = status;
      await application.save();
      
      res.status(200).json({
        success: true,
        message: 'Application status updated successfully',
        data: application
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application status',
        error: error.message
      });
    }
  };

/**
 * Get resume data for an application
 * @param {Object} req - Request object with application id
 * @param {Object} res - Response object
 * @returns {Object} PDF resume data as blob
 */
export const getApplicationResume = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID'
      });
    }
    
    // Find the application
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if resume data exists
    if (!application.resume || !application.resume.data) {
      return res.status(404).json({
        success: false,
        message: 'No resume found for this application'
      });
    }
    
    // Get the base64 data
    const base64Data = application.resume.data;
    
    // Convert base64 string to binary Buffer
    const binaryData = Buffer.from(base64Data, 'base64');
    
    // Set appropriate headers
    res.setHeader('Content-Type', application.resume.type || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${application.resume.name || 'resume.pdf'}"`);
    res.setHeader('Content-Length', binaryData.length);
    
    // Send the binary data
    return res.send(binaryData);
    
  } catch (error) {
    console.error('Error retrieving resume:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume',
      error: error.message
    });
  }
};
