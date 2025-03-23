import mongoose from "mongoose";
import Application from "../models/application.model.js";

// Get all applications
export const getApplications = async (req, res) => {
    try {
        // Allow filtering by jobId or applicantId
        const filter = {};
        if (req.query.jobId) filter.jobId = req.query.jobId;
        if (req.query.applicantId) filter.applicantId = req.query.applicantId;
        
        const applications = await Application.find(filter);
        res.status(200).json({ success: true, data: applications });
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
    const application = req.body;

    if(!application.jobId || !application.applicantId) {
        return res.status(400).json({ success: false, message: 'Please provide both job and applicant IDs' });
    }

    const newApplication = new Application({
        ...application,
        status: 'pending',
        appliedDate: new Date()
    });

    try {
        await newApplication.save();
        res.status(201).json({success: true, data: newApplication});
    }
    catch (error) {
        console.error("Error in Create Application:", error.message);
        res.status(500).json({ success: false, message: "Server Error"});
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
        const updatedApplication = await Application.findByIdAndUpdate(
            id, 
            updates,
            { new: true }
        );
        
        if (!updatedApplication) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }
        
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
        await Application.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Application deleted" });
    } catch (error) {
        console.error("Error in Delete Application:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};