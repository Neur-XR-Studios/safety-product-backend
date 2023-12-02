const Company = require('../../model/schema/company');
const User = require('../../model/schema/user');
const TrainingType = require('../../model/schema/trainingType')
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const createCompany = async (req, res) => {
    try {
        const { name, phoneNumber, username, password, products, activateCode } = req.body;

        const existingCompanyByName = await Company.findOne({ name });
        if (existingCompanyByName) {
            return res.status(400).json({ message: 'Company with the same name already exists.' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User with the same username already exists.' });
        }

        const existingCompanyByPhoneNumber = await Company.findOne({ phoneNumber });
        if (existingCompanyByPhoneNumber) {
            return res.status(400).json({ message: 'Company with the same phone number already exists.' });
        }

        const companyData = req.body;
        const newCompany = new Company(companyData);
        const savedCompany = await newCompany.save();
        await newCompany.validate();

        const adminUserData = {
            username: username,
            password: await bcrypt.hash(password, 10),
            role: 'admin',
            company: savedCompany._id
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
        const result = await Company.aggregate([
            {
                $lookup: {
                    from: 'trainingtypes',
                    localField: 'products',
                    foreignField: '_id',
                    as: 'productsData',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'company',
                    as: 'userData',
                },
            },
            {
                $project: {
                    name: 1,
                    phoneNumber: 1,
                    isSubscribed: 1,
                    subscriptionStartedOn: 1,
                    subscriptionEndingOn: 1,
                    deleted: 1,
                    createdOn: 1,
                    productsData: {
                        $map: {
                            input: '$productsData',
                            as: 'product',
                            in: {
                                _id: '$$product._id',
                                name: '$$product.name',
                            },
                        },
                    },
                    userData: {
                        $map: {
                            input: '$userData',
                            as: 'user',
                            in: {
                                _id: '$$user._id',
                                username: '$$user.username',
                            },
                        },
                    },
                },
            },
        ]);

        res.status(200).json(result);

    } catch (error) {
        console.error('Failed to fetch companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
};


const viewCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;

        const result = await Company.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(companyId) },
            },
            {
                $lookup: {
                    from: 'trainingtypes',
                    localField: 'products',
                    foreignField: '_id',
                    as: 'productsData',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'company',
                    as: 'userData',
                },
            },
            {
                $project: {
                    name: 1,
                    phoneNumber: 1,
                    isSubscribed: 1,
                    subscriptionStartedOn: 1,
                    subscriptionEndingOn: 1,
                    deleted: 1,
                    createdOn: 1,
                    productsData: {
                        $map: {
                            input: '$productsData',
                            as: 'product',
                            in: {
                                _id: '$$product._id',
                                name: '$$product.name',
                            },
                        },
                    },
                    userData: {
                        $map: {
                            input: '$userData',
                            as: 'user',
                            in: {
                                _id: '$$user._id',
                                username: '$$user.username',
                            },
                        },
                    },
                },
            },
        ]);

        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }

        return res.status(200).json({
            message: 'Company retrieved successfully',
            data: result[0],
        });
    } catch (error) {
        console.error('Failed to retrieve company:', error);
        res.status(500).json({ message: 'Failed to retrieve company', error: error.message });
    }
};


const updateCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const updateData = req.body;

        const existingCompany = await Company.findById(companyId);
        if (!existingCompany) {
            return res.status(404).json({ message: 'Company not found' });
        }

        for (const key in updateData) {
            existingCompany[key] = updateData[key];
        }

        const updatedCompany = await existingCompany.save();

        if (updateData.products) {

            const updatedProducts = await TrainingType.updateMany(
                { _id: { $in: updateData.products } },
                { $set: { company: companyId } }
            );
        }


        if (updateData.userData) {
            for (const userData of updateData.userData) {
                const userId = userData._id;

                if (userData.password) {
                    userData.password = await bcrypt.hash(userData.password, 10);
                }

                const updateUser = await User.findByIdAndUpdate(userId, { $set: userData }, { new: true });
            }
        }

        return res.status(200).json({
            message: 'Company updated successfully',
            data: updatedCompany,
        });
    } catch (error) {
        console.error('Failed to update company:', error);
        res.status(500).json({ message: 'Failed to update company', error: error.message });
    }
};



const deleteCompanyAndUsers = async (req, res) => {
    try {
        const companyId = req.params.id;

        const deletedCompany = await Company.findByIdAndDelete(companyId);

        if (!deletedCompany) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const deletedUsers = await User.deleteMany({ company: companyId });

        return res.status(200).json({
            message: 'Company and associated users deleted successfully',
            data: {
                deletedCompany,
                deletedUsers,
            },
        });
    } catch (error) {
        console.error('Failed to delete company:', error);
        res.status(500).json({ message: 'Failed to delete company', error: error.message });
    }
};


module.exports = {
    createCompany,
    getAllCompanies,
    viewCompanyById,
    updateCompany,
    deleteCompanyAndUsers
};
