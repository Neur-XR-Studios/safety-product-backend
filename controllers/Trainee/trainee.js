const Trainee = require('../../model/schema/trainee');
const crypto = require('crypto');

const index = async (req, res) => {
    const query = req.query
    query.deleted = false;

    let trainee = await Trainee.find(query)

    try {
        res.status(200).json({ message: 'Trainee Data Retrieved Successfully', data: trainee });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create Trainee', error: error });
    }
};

const generateRandomSessionId = () => {
    const randomBytes = crypto.randomBytes(2); // 2 bytes = 16 bits
    return parseInt(randomBytes.toString('hex'), 16) % 10000; // Ensure it's 4 digits
};

const isSessionIdUnique = async (sessionId) => {
    const existingTrainee = await Trainee.findOne({ sessionId: sessionId });
    return !existingTrainee;
};

const add = async (req, res) => {
    try {
        const sessionIdExist = req.body.sessionId
        if (sessionIdExist != null) {
            const existingTrainee = await Trainee.findOne({ sessionId: sessionIdExist });
            if (existingTrainee) {
                const updates = { ...req.body };
                const updatedTrainee = await Trainee.findOneAndUpdate(
                    { sessionId: sessionIdExist },
                    updates,
                    { new: true }
                );
                const data = {
                    traineeID: updatedTrainee._id, sessionId: updatedTrainee.sessionId, companyId: updatedTrainee.company
                }
                return res.status(200).json({ message: 'Trainee Updated Successfully', data });
            }
        }
        let sessionId;
        do {
            sessionId = generateRandomSessionId();
        } while (!(await isSessionIdUnique(sessionId)));
        const traineeData = { ...req.body, sessionId };
        const trainee = new Trainee(traineeData);
        await trainee.save();
        const data = {
            traineeID: trainee._id, sessionId: trainee.sessionId, companyId: trainee.company
        }
        res.status(200).json({ message: 'Trainee Added Successfully', data: data });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create Trainee', error: error.errors });
    }
};


module.exports = { index, add };