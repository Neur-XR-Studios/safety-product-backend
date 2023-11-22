const express = require('express');
const workAtHeigtEvaluation = require('./HeightEvaluation');

const router = express.Router();

router.get('/:sessionId', workAtHeigtEvaluation.viewById);
router.get('/', workAtHeigtEvaluation.viewAll);
router.post('/', workAtHeigtEvaluation.createOrUpdate);
router.delete('/:sessionId', workAtHeigtEvaluation.deleteById);

module.exports = router