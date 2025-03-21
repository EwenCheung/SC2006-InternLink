import mongoose from "mongoose";
import Job from "../models/job.model.js";

// Get all jobs
export const getJobs = async (req, res) => {
    try{
        const jobs = await Job.find({});
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        console.log("Error in Fetch Jobs:", error.message);
        res.status(500).json({ success: false, message: "Server Error"});
    }
};

// Create a job
export const createJob = async (req, res) => {
    const job = req.body; // user will send this data

    if(!job.title || !job.company || !job.location) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    const newJob = new Job(job)

    try {
        await newJob.save();
        res.status(201).json({success: true, data: newJob});
    }
    catch (error) {
        console.error("Error in Create Job:", error.message);
        res.status(500).json({ success: false, message : "Server Error"});
    }
};

// Update a job
export const updateJob = async (req, res) => {
    const { id } = req.params;
    const job = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({success:false, message: "Invalid Job ID"});
    }

    try {
        const updatedJob = await Job.findByIdAndUpdate(id, job,{ new: true });
        res.status(200).json({ success: true, data: job });
    }
    catch (error) {
        console.error("Error in Update Job:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete a job
export const deleteJob = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({success:false, message: "Invalid Job ID"});
    }

    try {
        // If job exists, delete it
        await Job.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Job deleted" });

    } catch (error) {
        console.log("Error in Delete Job:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};