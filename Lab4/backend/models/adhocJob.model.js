import mongoose from 'mongoose';
import { VALID_INDUSTRIES } from '../constants/courses.js';
import Job from './job.model.js';

const AdHocJobSchema = new mongoose.Schema({
  payPerHour: {
    type: Number,
    required: true,
    min: [0, 'Pay per hour cannot be negative']
  }
});

// Inherit from base Job schema
const AdHocJob = Job.discriminator('AdHocJob', AdHocJobSchema);

export default AdHocJob;
