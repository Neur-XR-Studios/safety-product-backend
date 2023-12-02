const express = require('express');
const CompanyController = require('./company');
const router = express.Router();
const auth = require('../../middleware/auth');
const { authorize, Roles } = require('../../middleware/auth');

router.get('/', CompanyController.getAllCompanies);
router.get('/view/:id', CompanyController.getCompanyById);
router.post('/add', auth.authorize(Roles.superAdmin), CompanyController.createCompany);
router.put('/update/:id', CompanyController.updateCompanyById);
router.delete('/delete/:id', CompanyController.deleteCompanyById);

module.exports = router;
