const User = require('../models/User');

// Update user information
exports.updateUser = async (req, res) => {
    try {
        // Handle description array - convert to string
        if (req.body.description && Array.isArray(req.body.description)) {
            req.body.description = req.body.description.join('\n');
            console.log("Converted description array to string:", req.body.description);
        }

        const userId = req.params.id;
        const updatedData = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};