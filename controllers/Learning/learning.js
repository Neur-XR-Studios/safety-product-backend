const Learning = require('../../model/schema/learning');
const validateTime = require('../../Validators/timeValidator');


const isValidDateTimeFormat = (dateTimeString) => {
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    return dateTimeRegex.test(dateTimeString);
};

const createLearning = async (req, res) => {
    try {
        const { sessionId, languageSelected, startTime, endTime } = req.body;

        if (sessionId === null || !Number.isInteger(sessionId)) {
            return res.status(400).json({ message: 'Failed to create or update Learning entry', error: 'Trainee Session ID must be a non-null integer' });
        }

        const timeFormat1 = isValidDateTimeFormat(startTime)
        const timeFormat2 = isValidDateTimeFormat(endTime)

        if (timeFormat1 != true || timeFormat2 != true) {
            return res.status(404).json({ message: 'startTime or endTime Not in valid format.' });
        }

        let totalTimeTaken = '00:00';

        if (startTime && endTime) {
            const startTimeObj = new Date(startTime);
            const endTimeObj = new Date(endTime);

            const timeDifferenceInSeconds = Math.floor((endTimeObj - startTimeObj) / 1000);

            const minutes = Math.floor(timeDifferenceInSeconds / 60);
            const seconds = timeDifferenceInSeconds % 60;
            totalTimeTaken = `${minutes}:${seconds}`;
        }

        const existingLearning = await Learning.findOne({ sessionId });

        if (existingLearning) {

            const updates = { languageSelected, timeTaken: totalTimeTaken };
            const updatedLearning = await Learning.findOneAndUpdate({ sessionId }, updates, { new: true });

            res.status(200).json({ message: 'Learning entry updated successfully', data: updatedLearning });
        } else {

            const newLearning = new Learning({
                sessionId,
                languageSelected,
                timeTaken: totalTimeTaken
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
        const { sessionId } = req.params;
        const learningEntry = await Learning.findOne({ sessionId });

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


const deleteLearningById = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const deletedLearning = await Learning.findOneAndDelete({ sessionId });

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
    deleteLearningById
};
