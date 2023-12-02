const express = require('express');
const LearningController = require('./learning');
const auth = require('../../middleware/auth');
const { Roles } = require('../../middleware/auth');

const router = express.Router();


router.get('/', LearningController.getAllLearning);
router.get('/:sessionId', LearningController.getLearningById);
router.post('/', auth.authorize(Roles.Admin), LearningController.createLearning);
router.delete('/:sessionId', LearningController.deleteLearningById);

module.exports = router;
