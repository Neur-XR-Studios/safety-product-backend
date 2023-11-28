const WorkAtHeight = require('../../model/schema/workAtHeightEvaluation');

// View by ID
const viewById = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const evaluation = await WorkAtHeight.findOne({ sessionId });
        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found for the provided session ID.' });
        }
        return res.json(evaluation);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// View all
const viewAll = async (req, res) => {
    try {
        const evaluations = await WorkAtHeight.find();
        return res.json(evaluations);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const isValidDateTimeFormat = (dateTimeString) => {
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    return dateTimeRegex.test(dateTimeString);
};

const createOrUpdate = async (req, res) => {
    const { sessionId, startTime, endTime, score } = req.body;

    const timeFormat1 = isValidDateTimeFormat(startTime)
    const timeFormat2 = isValidDateTimeFormat(endTime)
    if (sessionId === null || !Number.isInteger(sessionId)) {
        return res.status(400).json({ message: 'Failed to create or update Learning entry', error: 'Trainee Session ID must be a non-null integer' });
    }
    if (timeFormat1 != true || timeFormat2 != true) {
        return res.status(404).json({ message: 'startTime or endTime Not in valid format.' });
    }

    try {
        let evaluation = await WorkAtHeight.findOne({ sessionId });

        let totalTimeTaken = '00:00';

        if (startTime && endTime) {
            const startTimeObj = new Date(startTime);
            const endTimeObj = new Date(endTime);

            const timeDifferenceInSeconds = Math.floor((endTimeObj - startTimeObj) / 1000);

            const minutes = Math.floor(timeDifferenceInSeconds / 60);
            const paddedMinutes = String(minutes).padStart(2, '0');
            const seconds = timeDifferenceInSeconds % 60;
            const paddedSeconds = String(seconds).padStart(2, '0');
            totalTimeTaken = `${paddedMinutes}:${paddedSeconds}`;
        }

        let status = "Incomplete"
        if (score == "5/5") {
            status = "Complete"
        }

        if (!evaluation) {
            evaluation = new WorkAtHeight({
                sessionId,
                timeTaken: totalTimeTaken,
                score,
                completionStatus: status,
            });
        } else {
            evaluation.score = score;
            evaluation.timeTaken = totalTimeTaken;
            evaluation.completionStatus = status;
        }
        const savedEvaluation = await evaluation.save();

        return res.json(savedEvaluation);
        // return res.json('success');
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error', message: error });
    }
};


// Delete by ID
const deleteById = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const deletedEvaluation = await WorkAtHeight.findOneAndDelete({ sessionId });

        if (!deletedEvaluation) {
            return res.status(404).json({ message: 'Evaluation not found for the provided session ID.' });
        }

        return res.json(deletedEvaluation);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    viewById,
    viewAll,
    createOrUpdate,
    deleteById,
};
