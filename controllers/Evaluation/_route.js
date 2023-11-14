const express = require('express');
const router = express.Router();
const evaluationController = require('./evaluation');


router.get('/', evaluationController.getAllEvaluations);
router.get('/view/:sessionId', evaluationController.getEvaluationBySessionId);
router.post('/add', evaluationController.createOrUpdateEvaluation);
router.put('/update/:sessionId', evaluationController.updateEvaluationBySessionId);
router.delete('/delete/:sessionId', evaluationController.deleteEvaluationBySessionId);

module.exports = router;
