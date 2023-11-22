const express = require('express');
const router = express.Router();
const evaluationController = require('./evaluation');


router.get('/', evaluationController.getAllEvaluations);
router.get('/view/:sessionId', evaluationController.getEvaluationBySessionId);
router.post('/', evaluationController.createOrUpdateEvaluation);
router.delete('/delete/:sessionId', evaluationController.deleteEvaluationBySessionId);

module.exports = router;
