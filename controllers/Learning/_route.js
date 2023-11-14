const express = require('express');
const LearningController = require('./learning');

const router = express.Router();


router.get('/', LearningController.getAllLearning);
router.get('/view/:id', LearningController.getLearningById);
router.post('/add', LearningController.createLearning);
router.put('/update/:id', LearningController.updateLearningById);
router.delete('/delete/:id', LearningController.deleteLearningById);

module.exports = router;
