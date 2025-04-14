const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/emailService');
const { 
    generateVerificationToken, 
    generatePasswordResetToken 
} = require('../utils/tokenService';

// Update user profile
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.user;
        console.log("Authenticated user:", req.user);
        console.log("Request body:", req.body);
        console.log("Files received:", req.files);

        // Convert description array to string if it exists
        if (req.body.description && Array.isArray(req.body.description)) {
            console.log("Converting description array to string");
            req.body.description = req.body.description.join('\n');
        }

        // Update user data in database
        const updateData = { ...req.body };
        
        // Handle profile image if uploaded
        if (req.file) {
            updateData.profileImage = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.log("Error in updateUser:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = router;