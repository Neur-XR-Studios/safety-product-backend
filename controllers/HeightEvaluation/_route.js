const express = require('express');
const workAtHeigtEvaluation = require('./HeightEvaluation');
const auth = require('../../middleware/auth');
const { Roles } = require('../../middleware/auth');

const router = express.Router();

router.get('/:sessionId', workAtHeigtEvaluation.viewById);
router.get('/', workAtHeigtEvaluation.viewAll);
router.post('/', auth.authorize(Roles.Admin), workAtHeigtEvaluation.createOrUpdate);
router.delete('/:sessionId', workAtHeigtEvaluation.deleteById);

module.exports = router