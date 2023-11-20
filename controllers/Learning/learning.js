const Learning = require('../../model/schema/learning');
const validateTime = require('../../Validators/timeValidator');
// Create a new learning entry or update an existing one
const createLearning = async (req, res) => {
    try {
        const { sessionId, languageSelected, timeTaken, completionStatus } = req.body;
        if (sessionId === null || !Number.isInteger(sessionId)) {
            return res.status(400).json({ message: 'Failed to create or update Learning entry', error: 'Trainee Session ID must be a non-null integer' });
        }

        if (timeTaken) {
            const timeToValidate = timeTaken;
            const timeValidationResult = validateTime(timeToValidate);
            if (timeValidationResult === 0) {
                return res.status(400).json({ message: 'Failed to create or update Learning entry', error: 'Time is not valid. Please use the format mm:ss.' });
            }
        }


        const existingLearning = await Learning.findOne({ sessionId });

        if (existingLearning) {

            const updates = { languageSelected, timeTaken, completionStatus };
            const updatedLearning = await Learning.findOneAndUpdate({ sessionId }, updates, { new: true });

            res.status(200).json({ message: 'Learning entry updated successfully', data: updatedLearning });
        } else {

            const newLearning = new Learning({
                sessionId,
                languageSelected,
                timeTaken,
                completionStatus,
            });

            await newLearning.save();

            res.status(201).json({ message: 'Learning entry created successfully', data: newLearning });
        }
    } catch (error) {
        res.status(400).json({ message: 'Failed to create/update Learning entry', error: error });
    }
};


const getAllLearning = async (req, res) => {
    try {
        const learningEntries = await Learning.find();
        res.status(200).json({ message: 'Learning entries retrieved successfully', data: learningEntries });
    } catch (error) {
        console.error('Failed to fetch learning entries:', error);
        res.status(500).json({ message: 'Failed to fetch learning entries', error: error.message });
    }
};

const getLearningById = async (req, res) => {
    try {
        const learningId = req.params.id;
        const learningEntry = await Learning.findById(learningId);

        if (!learningEntry) {
            res.status(404).json({ message: 'Learning entry not found' });
        } else {
            res.status(200).json({ message: 'Learning entry retrieved successfully', data: learningEntry });
        }
    } catch (error) {
        console.error('Failed to fetch learning entry:', error);
        res.status(500).json({ message: 'Failed to fetch learning entry', error: error.message });
    }
};

const updateLearningById = async (req, res) => {
    try {
        const learningId = req.params.id;
        const updates = req.body;
        const updatedLearning = await Learning.findByIdAndUpdate(learningId, updates, { new: true });

        if (!updatedLearning) {
            res.status(404).json({ message: 'Learning entry not found' });
        } else {
            res.status(200).json({ message: 'Learning entry updated successfully', data: updatedLearning });
        }
    } catch (error) {
        console.error('Failed to update learning entry:', error);
        res.status(400).json({ message: 'Failed to update learning entry', error: error.message });
    }
};


const deleteLearningById = async (req, res) => {
    try {
        const learningId = req.params.id;
        const deletedLearning = await Learning.findByIdAndDelete(learningId);

        if (!deletedLearning) {
            res.status(404).json({ message: 'Learning entry not found' });
        } else {
            res.status(200).json({ message: 'Learning entry deleted successfully' });
        }
    } catch (error) {
        console.error('Failed to delete learning entry:', error);
        res.status(500).json({ message: 'Failed to delete learning entry', error: error.message });
    }
};

module.exports = {
    createLearning,
    getAllLearning,
    getLearningById,
    updateLearningById,
    deleteLearningById,
};
