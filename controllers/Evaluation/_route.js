const express = require('express');
const router = express.Router();
const evaluationController = require('./evaluation');
const auth = require('../../middleware/auth');
const { Roles } = require('../../middleware/auth');


router.get('/', evaluationController.getAllEvaluations);
router.get('/view/:sessionId', evaluationController.getEvaluationBySessionId);
router.post('/', auth.authorize(Roles.Admin), evaluationController.createOrUpdateEvaluation);
router.delete('/delete/:sessionId', evaluationController.deleteEvaluationBySessionId);

module.exports = router;
