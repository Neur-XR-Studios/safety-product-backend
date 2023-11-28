const Trainee = require('../../model/schema/trainee');
const crypto = require('crypto');
const TrainingType = require('../../model/schema/trainingType');

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

        if (req.body.type !== null && req.body.type !== undefined) {
            const typeExists = await TrainingType.findOne({ name: req.body.type });
            if (!typeExists) {
                return res.status(400).json({
                    message: 'Failed to create Trainee',
                    error: 'Given type does not exist.'
                });
            }
        }

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
            traineeID: trainee._id, sessionId: trainee.sessionId, companyId: trainee.company, Type: trainee.type
        }
        res.status(200).json({ message: 'Trainee Added Successfully', data: data });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create Trainee', error: error.message });
    }
};


module.exports = { index, add };