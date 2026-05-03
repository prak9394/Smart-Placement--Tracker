const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User');

// Helper to calculate match percentage and reasons
const calculateEligibility = (user, job) => {
  let score = 0;
  let totalScore = 4; // CGPA, Backlogs, Branch, Skills
  let reasons = [];
  let isEligible = true;

  // 1. CGPA
  if (user.cgpa >= job.cgpaRequired) {
    score += 1;
  } else {
    isEligible = false;
    reasons.push(`CGPA too low (Required: ${job.cgpaRequired}, Yours: ${user.cgpa || 0})`);
  }

  // 2. Backlogs
  if (user.backlogs <= job.maxBacklogs) {
    score += 1;
  } else {
    isEligible = false;
    reasons.push(`Too many backlogs (Allowed: ${job.maxBacklogs}, Yours: ${user.backlogs})`);
  }

  // 3. Branch
  if (job.allowedBranches.length === 0 || job.allowedBranches.includes(user.branch)) {
    score += 1;
  } else {
    isEligible = false;
    reasons.push(`Branch not allowed (Your branch: ${user.branch || 'None'})`);
  }

  // 4. Skills match percentage
  let skillsMatch = 0;
  let missingSkills = [];
  if (job.requiredSkills.length > 0) {
    const userSkillsSuperString = (user.skills || []).join(' ').toLowerCase();
    
    job.requiredSkills.forEach(reqSkill => {
      // Much more robust: check if the required skill exists anywhere in the user's combined skill string
      if (userSkillsSuperString.includes(reqSkill.toLowerCase().trim())) {
        skillsMatch++;
      } else {
        missingSkills.push(reqSkill);
      }
    });
    
    const skillScore = skillsMatch / job.requiredSkills.length;
    score += skillScore;
    
    if (skillScore < 0.5) { // Assuming 50% skills match required
      isEligible = false;
      reasons.push(`Missing key skills: ${missingSkills.join(', ')}`);
    } else if (missingSkills.length > 0) {
      reasons.push(`Missing some skills: ${missingSkills.join(', ')}`);
    }
  } else {
    score += 1; // full marks if no specific skills required
  }

  const matchPercentage = Math.round((score / totalScore) * 100);

  return {
    job,
    matchPercentage,
    isEligible,
    reasons
  };
};

router.get('/recommendations/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // In a real app we'd fetch actual jobs from DB. For now, if DB is empty we can seed some mock jobs.
    let jobs = await Job.find();
    
    if (jobs.length < 10) {
      await Job.deleteMany({}); // Clear old jobs to re-seed with new expanded list
      // Seed extended mock jobs
      const mockJobs = [
        // Product Based
        { companyName: 'Amazon', role: 'SDE-1', cgpaRequired: 8.0, maxBacklogs: 0, allowedBranches: ['Computer Science', 'Information Technology'], requiredSkills: ['Java', 'Data Structures', 'AWS'] },
        { companyName: 'Google', role: 'Software Engineer', cgpaRequired: 8.5, maxBacklogs: 0, allowedBranches: ['Computer Science'], requiredSkills: ['C++', 'Data Structures', 'Machine Learning'] },
        
        // Service Based (Easier Criteria)
        { companyName: 'Infosys', role: 'System Engineer', cgpaRequired: 6.0, maxBacklogs: 2, allowedBranches: [], requiredSkills: ['HTML', 'CSS', 'Java', 'SQL'] },
        { companyName: 'TCS', role: 'Ninja', cgpaRequired: 6.0, maxBacklogs: 1, allowedBranches: [], requiredSkills: ['C++', 'Python', 'SQL'] },
        { companyName: 'Wipro', role: 'Project Engineer', cgpaRequired: 6.0, maxBacklogs: 2, allowedBranches: [], requiredSkills: ['HTML', 'CSS', 'JavaScript'] },
        { companyName: 'Cognizant', role: 'Programmer Analyst', cgpaRequired: 6.0, maxBacklogs: 2, allowedBranches: [], requiredSkills: ['C++', 'HTML', 'Java'] },
        { companyName: 'Accenture', role: 'Associate Software Engineer', cgpaRequired: 6.5, maxBacklogs: 1, allowedBranches: [], requiredSkills: ['HTML', 'CSS', 'SQL', 'C++'] },
        { companyName: 'Capgemini', role: 'Software Analyst', cgpaRequired: 6.0, maxBacklogs: 2, allowedBranches: [], requiredSkills: ['Python', 'HTML', 'CSS'] },
        { companyName: 'Tech Mahindra', role: 'Software Engineer', cgpaRequired: 6.0, maxBacklogs: 2, allowedBranches: [], requiredSkills: ['C++', 'HTML', 'CSS', 'JavaScript'] },
        { companyName: 'IBM', role: 'Associate System Engineer', cgpaRequired: 6.5, maxBacklogs: 1, allowedBranches: [], requiredSkills: ['Java', 'SQL', 'Cloud'] }
      ];
      await Job.insertMany(mockJobs);
      jobs = await Job.find();
    }

    const recommendations = jobs.map(job => calculateEligibility(user, job));
    
    // Sort by match percentage
    recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({ recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Server error fetching recommendations' });
  }
});

module.exports = router;
