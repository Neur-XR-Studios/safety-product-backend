const Company = require('../../model/schema/company');
const User = require('../../model/schema/user');
const bcrypt = require('bcrypt');

const createCompany = async (req, res) => {
    try {
        const companyData = req.body;
        const uerName = req.body.username;
        const password = req.body.password;
        const newCompany = new Company(companyData);
        const savedCompany = await newCompany.save();

        // Create a default admin user
        const adminUserData = {
            username: uerName,
            password: await bcrypt.hash(password, 10),
            role: 'admin',
            company: savedCompany._id,
        };

        const newAdminUser = new User(adminUserData);
        await newAdminUser.save();

        res.status(201).json(savedCompany);
    } catch (error) {
        console.error('Failed to create company:', error);
        res.status(400).json({ message: 'Failed to create company', error: error.message });
    }
};


const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json(companies);
    } catch (error) {
        console.error('Failed to fetch companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
};


const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params

        const company = await Company.findOne({ _id: id });
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json(company);
    } catch (error) {
        console.error('Failed to fetch company:', error);
        res.status(500).json({ error: 'Failed to fetch company' });
    }
};


const updateCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const updates = req.body;
        const updatedCompany = await Company.findByIdAndUpdate(companyId, updates, { new: true });
        if (!updatedCompany) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json(updatedCompany);
    } catch (error) {
        console.error('Failed to update company:', error);
        res.status(400).json({ error: 'Failed to update company' });
    }
};


const deleteCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const deletedCompany = await Company.findByIdAndDelete(companyId);
        if (!deletedCompany) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json({ message: 'Company deleted successfully', name: deletedCompany.name });
    } catch (error) {
        console.error('Failed to delete company:', error);
        res.status(500).json({ error: 'Failed to delete company' });
    }
};

module.exports = {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompanyById,
    deleteCompanyById
};
