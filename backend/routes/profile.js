const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const User = require('../models/User');

// Use memory storage for processing PDF without saving to disk
const upload = multer({ storage: multer.memoryStorage() });

// List of predefined skills to extract via simple keyword matching
const SKILL_DICTIONARY = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 
  'Express', 'MongoDB', 'SQL', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'Docker', 'Kubernetes',
  'HTML', 'CSS', 'Tailwind', 'REST API', 'GraphQL', 'Machine Learning', 'Data Structures', 'Spring Boot'
];

router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    const { userId } = req.body; // user ID to attach details
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse the PDF buffer
    let data;
    try {
      data = await pdf(req.file.buffer);
    } catch (e) {
      return res.status(400).json({ error: 'Failed to parse PDF' });
    }

    const text = data.text;
    const extractedSkills = new Set();
    
    // Keyword matching logic
    const textLower = text.toLowerCase();
    SKILL_DICTIONARY.forEach(skill => {
      // Need word boundaries to avoid partial matches
      // using simple lowercase matching here for robust find
      if (textLower.includes(skill.toLowerCase())) {
        extractedSkills.add(skill);
      }
    });

    const skillsArray = Array.from(extractedSkills);

    // Update user profile
    const user = await User.findById(userId);
    if (!user) {
       return res.status(404).json({ error: 'User not found' });
    }

    // Append unique skills
    const currentSkills = user.skills || [];
    const newSkills = Array.from(new Set([...currentSkills, ...skillsArray]));
    user.skills = newSkills;
    await user.save();

    res.json({ message: 'Resume parsed successfully', skills: newSkills, parsedTextLength: text.length });
  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({ error: 'Server error parsing resume' });
  }
});

// Update standard profile details
router.post('/update', async (req, res) => {
  try {
    const { userId, cgpa, backlogs, branch, year, skills } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (cgpa !== undefined) user.cgpa = cgpa;
    if (backlogs !== undefined) user.backlogs = backlogs;
    if (branch !== undefined) user.branch = branch;
    if (year !== undefined) user.year = year;
    if (skills !== undefined) user.skills = skills;

    await user.save();
    
    res.json({ message: 'Profile updated successfully', user: { name: user.name, email: user.email, cgpa: user.cgpa, backlogs: user.backlogs, branch: user.branch, year: user.year, skills: user.skills } });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, cgpa: user.cgpa, backlogs: user.backlogs, branch: user.branch, year: user.year, skills: user.skills || [] } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
