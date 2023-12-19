const Company = require('../../model/schema/company');
const User = require('../../model/schema/user');
const TrainingType = require('../../model/schema/trainingType')
const bcrypt = require('bcrypt');
const activationCode = require('../../model/schema/activationCode')
const Trainee = require('../../model/schema/trainee');
const mongoose = require('mongoose');
var ObjectID = require("mongodb").ObjectID

const createCompany = async (req, res) => {
    try {
        const { name, phoneNumber, username, password, products, activateCode } = req.body;


        if (!name || !phoneNumber || !username || !password) {
            return res.status(400).json({ message: `${!name ? 'Name' : !phoneNumber ? 'Phone Number' : !username ? 'Username' : 'Password'} is required.` });
        }


        // const isActivationCode = await activationCode.findOne({ code: activateCode });
        // const existingCode = await Company.findOne({ activateCode: activateCode });
        // if (isActivationCode == activateCode || existingCode) {
        //     return res.status(400).json({ message: 'Activation Code already exists.' });
        // }

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

        // const codeData = {
        //     code: savedCompany.activateCode
        // }
        // const newCode = new activationCode(codeData);
        // await newCode.save();

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
        var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$")
        const ValidObjectId = checkForHexRegExp.test(companyId)
        if (!ValidObjectId) {
            res.status(400).json({ error: 'Invalid company ID format' });
        }
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

        // Validate ObjectId
        const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
        const isValidObjectId = checkForHexRegExp.test(companyId);

        if (!isValidObjectId) {
            return res.status(400).json({ error: 'Invalid company ID format' });
        }

        const existingCompany = await Company.findById(companyId);

        if (!existingCompany) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Update company fields
        for (const key in updateData) {
            existingCompany[key] = updateData[key];
        }

        // Save the updated company
        const updatedCompany = await existingCompany.save();

        // Update products if provided
        if (updateData.products) {
            await TrainingType.updateMany(
                { _id: { $in: updateData.products } },
                { $set: { company: companyId } }
            );
        }

        // Update user data, including password hashing
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
        const providedPassword = req.body.superadminPassword;
        const superadminUser = await User.findOne({ username: 'superadmin' });

        if (!superadminUser) {
            return res.status(401).json({ error: 'Unauthorized: Superadmin not found' });
        }

        bcrypt.compare(providedPassword, superadminUser.password, async (err, passwordMatch) => {

            if (err || !passwordMatch) {
                return res.status(401).json({ error: 'Unauthorized: Superadmin password incorrect' });
            }

            const companyId = req.params.id;
            const checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            const isValidObjectId = checkForHexRegExp.test(companyId);

            if (!isValidObjectId) {
                return res.status(400).json({ error: 'Invalid company ID format' });
            }

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
        });
    } catch (error) {
        console.error('Failed to delete company:', error);
        return res.status(500).json({ message: 'Failed to delete company', error: error.message });
    }
};

const updateCompanySubscription = async (req, res) => {
    const companyId = req.params.id;
    const isSubscribed = req.body.isSubscribed;

    try {

        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({ error: 'Invalid company ID.' });
        }

        if (isSubscribed === undefined || typeof isSubscribed !== 'boolean') {
            return res.status(400).json({ error: 'Invalid value for isSubscribed. It must be a boolean.' });
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            { $set: { isSubscribed } },
            { new: true, runValidators: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ error: 'Company not found.' });
        }

        return res.json(updatedCompany);
    } catch (error) {

        console.error('Error updating company subscription:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const result = async (req, res) => {
    const sessionID = req.params.sessionId
    const sessionIdAsInteger = parseInt(sessionID, 10);

    try {
        const traineeResult = await Trainee.aggregate([
            {
                $match: {
                    sessionId: sessionIdAsInteger
                }
            },
            {
                $lookup: {
                    from: "learnings",
                    localField: "sessionId",
                    foreignField: "sessionId",
                    as: "learning"
                }
            },
            {
                $lookup: {
                    from: "sessiontimes",
                    localField: "sessionId",
                    foreignField: "sessionId",
                    as: "sessionTime"
                }
            },
            {
                $lookup: {
                    from: "evaluations",  // Default collection
                    localField: "sessionId",
                    foreignField: "sessionId",
                    as: "evaluation"
                }
            },
            {
                $lookup: {
                    from: "workatheigthevaluations",  // Work at Height collection
                    let: { type: "$type", sessionId: "$sessionId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$$type", "work-at-height"] },
                                        { $eq: ["$$sessionId", "$sessionId"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                timeTaken: 1,
                                score: 1,
                                completionStatus: 1
                            }
                        }
                    ],
                    as: "workAtHeightEvaluation"
                }
            },
            {
                $project: {
                    _id: 1,
                    sessionId: 1,
                    phoneNumber: 1,
                    company: 1,
                    CreatedOn: 1,
                    type: 1,
                    learning: {
                        timeTaken: 1,
                        languageSelected: 1,
                    },
                    sessionTime: {
                        timeTaken: 1
                    },
                    evaluation: {
                        $cond: {
                            if: { $eq: ["$type", "work-at-height"] },
                            then: "$workAtHeightEvaluation",
                            else: "$evaluation"
                        }
                    }
                }
            }
        ]);

        if (!traineeResult || traineeResult.length === 0) {
            return res.status(200).json({
                message: 'No Results Found',
            });
        }

        return res.status(200).json({
            message: 'Results retrieved successfully',
            data: traineeResult,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = {
    createCompany,
    getAllCompanies,
    viewCompanyById,
    updateCompany,
    deleteCompanyAndUsers,
    updateCompanySubscription,
    result
};
