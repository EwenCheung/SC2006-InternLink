import mongoose from "mongoose";

// Define the schema for the job model
const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        enum: ['internship', 'adhoc'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        type: String
    },
    courseStudy:{
        type: String,
        required: true
    },

    yearRequired:{
        type: String,
        required: true
    },

    // Different fields based on job type
    // For internships
    stipend: {
        type: String,
        default: null
    },
    // For ad-hoc jobs
    compensation: {
        type: String,
        default: null
    },
    duration: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        default: null
    },
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'filled', 'closed'],
        default: 'active'
    },
    numberApplied:{
        type: Number,
        default: 0
    }
},{
    timestamps: true //Automatically adds createdAt and updatedAt
});

const Job = mongoose.model('Job', jobSchema);

export default Job;