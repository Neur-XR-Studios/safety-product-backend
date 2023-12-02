const express = require('express');
const TrainingType = require('./trainingType');
const router = express.Router();

router.get('/', TrainingType.getTrainingTypes);
router.post('/add', TrainingType.createTrainingType);
router.put('/update/:id', TrainingType.updateTrainingType);
router.delete('/delete/:id', TrainingType.deleteTrainingType);

module.exports = router