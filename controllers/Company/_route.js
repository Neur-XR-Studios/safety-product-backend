const express = require('express');
const CompanyController = require('./company');
const router = express.Router();
const auth = require('../../middleware/auth');
const { Roles } = require('../../middleware/auth');

router.get('/', auth.authorize(Roles.superAdmin), CompanyController.getAllCompanies);
router.get('/view/:id', auth.authorize(Roles.superAdmin), CompanyController.viewCompanyById);
router.post('/add', auth.authorize(Roles.superAdmin), CompanyController.createCompany);
router.put('/update/:id', auth.authorize(Roles.superAdmin), CompanyController.updateCompany);
router.delete('/delete/:id', auth.authorize(Roles.superAdmin), CompanyController.deleteCompanyAndUsers);

module.exports = router;
