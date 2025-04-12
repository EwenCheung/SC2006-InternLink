const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');

// For debugging purposes, add a route log
console.log('Available job routes:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).join(', ')} ${r.route.path}`);
  }
});

// Define job-related routes
router.post('/adhoc', jobController.createAdHocJob);
router.get('/adhoc', jobController.getAdHocJobs);
router.put('/adhoc/:id', jobController.updateAdHocJob);
router.delete('/adhoc/:id', jobController.deleteAdHocJob);

router.post('/drafts', jobController.saveDraft);
router.get('/drafts', jobController.getDrafts);
router.put('/drafts/:id', jobController.updateDraft);
router.delete('/drafts/:id', jobController.deleteDraft);

module.exports = router;