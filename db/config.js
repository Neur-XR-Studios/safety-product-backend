const mongoose = require('mongoose');
const User = require('../model/schema/user');
const TrainingType = require('../model/schema/trainingType')
const bcrypt = require('bcrypt');

const connectDB = async (DATABASE_URL, DATABASE) => {

    try {
        const DB_OPTIONS = {
            dbName: DATABASE
        };

        mongoose.set("strictQuery", false);
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);

        // Check if admin user already exists based on username
        const adminExisting = await User.findOne({ username: 'superadmin@neurindustries.com' });

        if (!adminExisting) {
            const phoneNumber = 7874263694;
            const firstName = 'Neur';
            const lastName = 'Industries';
            const username = 'superadmin@neurindustries.com';
            const password = 'superadmin@123';
            const is_superadmin = true;
            const role = 'superadmin';

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const user = new User({ username, password: hashedPassword, firstName, lastName, is_superadmin, phoneNumber, role });

            // Save the user to the database
            await user.save();
            console.log("Admin created successfully..");
        } else if (adminExisting.deleted === true) {
            // If admin exists but is marked as deleted, update the deleted flag
            await User.findByIdAndUpdate(adminExisting._id, { deleted: false });
            console.log("Admin updated successfully..");
        }

        console.log("Database Connected Successfully..");

        // products create if not
        const productNames = ['fire-extinguisher', 'work-at-height'];
        const productsCheck = await TrainingType.find({
            name: { $in: productNames }
        });
        for (const productName of productNames) {
            const productExists = productsCheck.some(product => product.name == productName);

            if (!productExists) {
                await TrainingType.create({ name: productName });
                console.log(` ${productName} created.`);
            } else {
                console.log(`existing products are ${productName}.`);
            }
        }

    } catch (err) {
        console.log("Database Not connected", err.message);
    }
};

module.exports = connectDB;
