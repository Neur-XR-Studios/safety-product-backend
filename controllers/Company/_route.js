const express = require('express');
const CompanyController = require('./company');
const router = express.Router();

router.get('/', CompanyController.getAllCompanies);
router.get('/view/:id', CompanyController.getCompanyById);
router.post('/add', CompanyController.createCompany);
router.put('/update/:id', CompanyController.updateCompanyById);
router.delete('/delete/:id', CompanyController.deleteCompanyById);

module.exports = router;
