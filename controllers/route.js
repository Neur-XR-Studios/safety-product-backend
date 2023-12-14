const express = require('express');
const router = express.Router();

const dashboardRoute = require('./Dashboard/_route')
const traineeRoute = require('./Trainee/_route')
const companyRoute = require('./Company/_route')
const learningRoute = require('./Learning/_route')
const evaluationRoute = require('./Evaluation/_route')
const trainingType = require('./TrainingType/_route')
const workAtHeightEvaluation = require('./HeightEvaluation/_route')
const user = require('./User/_route')

router.use('/dashboard', dashboardRoute);
router.use('/trainee', traineeRoute);
router.use('/company', companyRoute);
router.use('/learning', learningRoute);
router.use('/evaluation', evaluationRoute);
router.use('/product', trainingType);
router.use('/work-at-height-evaluation', workAtHeightEvaluation);
router.use('/auth', user);

module.exports = router;