import mongoose from "mongoose";
import Application from "../models/application.model.js";

// Get all applications
export const getApplications = async (req, res) => {
    try {
        // Allow filtering by jobId or applicantId
        // Create filter based on user role and ID
        const filter = {};
        if (req.user.role === 'jobseeker') {
            filter.applicantId = req.user.userId;
        }
        // Add additional filters from query params
        if (req.query.jobId) filter.jobId = req.query.jobId;
        
        const applications = await Application.find(filter)
            .populate('jobId', 'title companyName')  // Populate job details
            .lean()
            .exec();

        // Transform data to match frontend expectations
        const transformedApplications = applications.map(app => ({
            jobTitle: app.jobId?.title || 'Unknown Job',
            company: app.jobId?.companyName || 'Unknown Company',
            status: app.status,
            appliedDate: app.appliedDate,
            id: app._id
        }));
        res.status(200).json({ success: true, data: transformedApplications });
    } catch (error) {
        console.log("Error in Fetch Applications:", error.message);
        res.status(500).json({ success: false, message: "Server Error"});
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
        console.error("Error in Fetch Application:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Create an application
export const createApplication = async (req, res) => {
    const { jobId, coverLetter, resume } = req.body;
    const applicantId = req.user.userId; // Ensure applicantId matches userId from authMiddleware

    if (!jobId || !applicantId) {
        return res.status(400).json({ success: false, message: 'Job ID and Applicant ID are required' });
    }

    try {
        console.log('Request Body:', req.body);
        console.log('Authenticated User:', req.user);
        // Check if the applicant has already applied for this job
        const existingApplication = await Application.findOne({ job: jobId, jobSeeker: applicantId });
        if (existingApplication) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }

        // Create a new application
        const newApplication = new Application({
            jobSeeker: applicantId,
            job: jobId,
            coverLetter,
            resume,
            status: 'pending',
            appliedDate: new Date(),
        });

        await newApplication.save();
        res.status(201).json({ success: true, data: newApplication });
    } catch (error) {
        console.error('Error in Create Application:', error.message, error.stack);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
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
        console.error("Error in Update Application:", error.message);
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
        // First find the application to check ownership
        const application = await Application.findById(id);
        
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        // Check if user is authorized to delete
        if (req.user.role === 'jobseeker' && application.applicantId.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this application" });
        }

        await Application.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Application deleted" });
    } catch (error) {
        console.error("Error in Delete Application:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
