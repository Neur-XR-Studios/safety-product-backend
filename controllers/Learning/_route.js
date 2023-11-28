const express = require('express');
const LearningController = require('./learning');

const router = express.Router();


router.get('/', LearningController.getAllLearning);
router.get('/:sessionId', LearningController.getLearningById);
router.post('/', LearningController.createLearning);
router.delete('/:sessionId', LearningController.deleteLearningById);

module.exports = router;
