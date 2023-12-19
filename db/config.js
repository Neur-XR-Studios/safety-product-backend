const mongoose = require('mongoose');
const User = require('../model/schema/user');
const TrainingType = require('../model/schema/trainingType');
const Company = require('../model/schema/company');
const bcrypt = require('bcrypt');

const connectDB = async (DATABASE_URL, DATABASE) => {
    try {
        const DB_OPTIONS = {
            dbName: DATABASE
        };

        mongoose.set('strictQuery', false);
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);

        // Check if superadmin user already exists based on username
        let adminExisting = await User.findOne({ username: 'superadmin' });

        if (!adminExisting) {
            const phoneNumber = 7874263694;
            const firstName = 'Neur';
            const lastName = 'Industries';
            const username = 'superadmin';
            const password = 'superadmin@123';
            const is_superadmin = true;
            const role = 'superadmin';

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new superadmin user
            const user = new User({
                username,
                password: hashedPassword,
                firstName,
                lastName,
                is_superadmin,
                phoneNumber,
                role,
            });

            // Save the superadmin user to the database
            adminExisting = await user.save();
            console.log('Superadmin created successfully.');
        } else if (adminExisting.deleted === true) {
            // If superadmin exists but is marked as deleted, update the deleted flag
            await User.findByIdAndUpdate(adminExisting._id, { deleted: false });
            console.log('Superadmin updated successfully.');
        }

        // Create or retrieve product IDs
        const productNames = ['fire-extinguisher', 'work-at-height'];
        const productIds = await Promise.all(
            productNames.map(async (productName) => {
                const product = await TrainingType.findOne({ name: productName });

                if (!product) {
                    // Create the product if it doesn't exist
                    const newProduct = await TrainingType.create({ name: productName });
                    console.log(`${productName} created.`);
                    return newProduct._id;
                } else {
                    console.log(`Existing product: ${productName}.`);
                    return product._id;
                }
            })
        );

        // Check if guest company already exists based on name
        let companyExisting = await Company.findOne({ name: 'guest' });

        if (!companyExisting) {
            const companyName = 'guest';
            const phoneNumber = 9888898888;
            const isSubscribed = true;
            const subscriptionStartedOn = new Date('2023-12-16T00:00:00.000Z');

            // Create a new company
            const company = new Company({
                name: companyName,
                phoneNumber,
                products: productIds,
                isSubscribed,
                subscriptionStartedOn,
            });

            // Save the company to the database
            companyExisting = await company.save();
            console.log('Company created successfully.');
        }

        // Check if guest user already exists based on username
        const guestExisting = await User.findOne({ username: 'guest' });

        if (!guestExisting) {
            const phoneNumber = 9000090000;
            const firstName = 'guest';
            const lastName = 'guest';
            const username = 'guest';
            const password = 'guest@123';
            const is_superadmin = false;

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new guest user
            const user = new User({
                username,
                password: hashedPassword,
                firstName,
                lastName,
                is_superadmin,
                company: [companyExisting._id],
                phoneNumber,
                role: 'guest',
            });

            // Save the guest user to the database
            await user.save();
            console.log('Guest created successfully.');
        } else if (guestExisting.deleted === true) {
            // If guest user exists but is marked as deleted, update the deleted flag
            await User.findByIdAndUpdate(guestExisting._id, { deleted: false });
            console.log('Guest updated successfully.');
        }

        console.log('Database Connected Successfully.');
    } catch (err) {
        console.error('Database Not connected', err.message);
    } 
};

module.exports = connectDB;
