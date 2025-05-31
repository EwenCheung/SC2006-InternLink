import express from 'express';
import { fetchSkillsData } from '../controllers/skillsdata.controller.js';

const router = express.Router();

// Route to get all skills
router.get('/', async (req, res) => {
  try {
    const skills = await fetchSkillsData();
    if (!skills) {
      return res.status(404).json({ message: 'Skills not found' });
    }
    res.status(200).json({ skills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;