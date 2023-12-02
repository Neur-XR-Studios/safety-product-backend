const express = require('express');
const Dashboard = require('./dashboard');
const auth = require('../../middleware/auth');
const { Roles } = require('../../middleware/auth');


const router = express.Router();

// Fire Extinguisher
router.get('/fire-extinguisher/', auth.authorize(Roles.Admin), Dashboard.fireExtinguisherIndex)
router.post('/fire-extinguisher/excel/', auth.authorize(Roles.Admin), Dashboard.fireExtinguisherExcel)

// Work At Height
router.get('/work-at-height/', auth.authorize(Roles.Admin), Dashboard.workAtHeightIndex)
router.post('/work-at-height/excel/', auth.authorize(Roles.Admin), Dashboard.workAtHeightExcel)

module.exports = router