const WorkAtHeight = require('../../model/schema/workAtHeightEvaluation');
const DateTimeService = require('../../services/datetimeService');
const dateTimeServiceInstance = new DateTimeService();

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

const validateScore = (score) => score === "5/5" || score === "4/5" || score === "3/5" || score === "2/5" || score === "1/5";

const createOrUpdate = async (req, res) => {

    const { sessionId, startTime, endTime, score } = req.body;

    if (sessionId === null || !Number.isInteger(sessionId)) {
        return res.status(400).json({ message: 'Failed to create or update Learning entry', error: 'Trainee Session ID must be a non-null integer' });
    }
    if (!startTime || !endTime) {
        return res.status(400).json({ message: 'startTime and endTime are required.' });
    }
    if (!validateScore(score)) {
        return res.status(400).json({ message: 'Invalid score format.' });
    }
    try {
        let evaluation = await WorkAtHeight.findOne({ sessionId });

        let totalTimeTaken = '00:00';

        if (startTime && endTime) {
            try {
                totalTimeTaken = dateTimeServiceInstance.calculateTotalTime(startTime, endTime);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
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
