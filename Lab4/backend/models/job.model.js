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

},{
    timestamps: true //Automatically adds createdAt and updatedAt
});

const Job = mongoose.model('Job', jobSchema);

export default Job;