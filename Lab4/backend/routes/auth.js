const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../middleware/upload');

// Handle the update route - the logs show this is the problematic endpoint
router.patch('/update', authenticateToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Convert description array to string if it exists
    if (req.body.description && Array.isArray(req.body.description)) {
      console.log("Converting description array to string:", req.body.description);
      req.body.description = req.body.description.join('\n');
    }
    
    // Log the processed body after conversion
    console.log("Processed request body:", req.body);
    
    // Rest of the update logic
    // ...existing code...
  } catch (error) {
    console.error("Error in /update route:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;