import express from 'express';
import { fetchUniversities } from '../controllers/universitiesdata.controller.js';

const router = express.Router();

// Route to get all universities
router.get('/', async (req, res) => {
  try {
    const universities = await fetchUniversities();
    if (!universities) {
      return res.status(404).json({ message: 'Universities not found' });
    }
    res.status(200).json({ universities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;