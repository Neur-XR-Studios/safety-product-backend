const Evaluation = require('../../model/schema/evaluation');

// Create or update an evaluation entry
const createOrUpdateEvaluation = async (req, res) => {
    try {
        const { sessionId, timeTaken, test1, test2 } = req.body;

        if (!sessionId || !timeTaken || !test1 || !test2) {
            const missingFields = [];
            if (!sessionId) missingFields.push('sessionId');
            if (!timeTaken) missingFields.push('timeTaken');
            if (!test1) missingFields.push('test1');
            if (!test2) missingFields.push('test2');

            return res.status(400).json({ message: 'Missing required fields', missingFields });
        }

        if (typeof sessionId !== 'number') {
            return res.status(400).json({ message: 'sessionId must be a number' });
        }

        const timeTakenRegex = /^\d{2}:\d{2}$/;
        if (!timeTakenRegex.test(timeTaken)) {
            return res.status(400).json({ message: 'Invalid timeTaken format. Use MM:ss' });
        }

        if (!validateTestStructure(test1) || !validateTestStructure(test2)) {
            return res.status(400).json({ message: 'Invalid test structure' });
        }

        const existingEvaluation = await Evaluation.findOne({ sessionId });

        if (existingEvaluation) {
            // Update the existing evaluation
            existingEvaluation.timeTaken = timeTaken;
            existingEvaluation.test1 = test1;
            existingEvaluation.test2 = test2;

            await existingEvaluation.save();
            return res.status(200).json({ message: 'Evaluation updated successfully', data: existingEvaluation });
        } else {
            // Create a new evaluation entry
            const newEvaluation = new Evaluation({ sessionId, timeTaken, test1, test2 });
            await newEvaluation.save();
            return res.status(201).json({ message: 'New evaluation created successfully', data: newEvaluation });
        }
    } catch (error) {
        console.error('Error creating/updating evaluation:', error);
        return res.status(500).json({ message: 'Failed to create/update evaluation', error: error.message });
    }
};

// Helper function to validate the structure of test1 and test2
const validateTestStructure = (test) => {
    if (!test || typeof test !== 'object' || !test.totalTime || !test.responseTime) {
        return false;
    }
    return true;
};


// Retrieve all evaluations
const getAllEvaluations = async (req, res) => {
    try {
        const evaluations = await Evaluation.find();
        res.status(200).json({ message: 'Evaluations retrieved successfully', data: evaluations });
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        res.status(500).json({ message: 'Failed to fetch evaluations', error: error.message });
    }
};

// Retrieve evaluation by session ID
const getEvaluationBySessionId = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const evaluation = await Evaluation.findOne({ sessionId });

        if (evaluation) {
            res.status(200).json({ message: 'Evaluation retrieved successfully', data: evaluation });
        } else {
            res.status(404).json({ message: 'Evaluation not found for the provided session ID' });
        }
    } catch (error) {
        console.error('Error fetching evaluation by session ID:', error);
        res.status(500).json({ message: 'Failed to fetch evaluation by session ID', error: error.message });
    }
};

// Update evaluation by session ID
const updateEvaluationBySessionId = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const { timeTaken, test1, test2 } = req.body;

        const evaluation = await Evaluation.findOne({ sessionId });

        if (evaluation) {
            evaluation.timeTaken = timeTaken;
            evaluation.test1 = test1;
            evaluation.test2 = test2;

            await evaluation.save();
            res.status(200).json({ message: 'Evaluation updated successfully', data: evaluation });
        } else {
            res.status(404).json({ message: 'Evaluation not found for the provided session ID' });
        }
    } catch (error) {
        console.error('Error updating evaluation by session ID:', error);
        res.status(500).json({ message: 'Failed to update evaluation by session ID', error: error.message });
    }
};

// Delete evaluation by session ID
const deleteEvaluationBySessionId = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const deletedEvaluation = await Evaluation.findOneAndDelete({ sessionId });

        if (deletedEvaluation) {
            res.status(200).json({ message: 'Evaluation deleted successfully', data: deletedEvaluation });
        } else {
            res.status(404).json({ message: 'Evaluation not found for the provided session ID' });
        }
    } catch (error) {
        console.error('Error deleting evaluation by session ID:', error);
        res.status(500).json({ message: 'Failed to delete evaluation by session ID', error: error.message });
    }
};

module.exports = {
    createOrUpdateEvaluation,
    getAllEvaluations,
    getEvaluationBySessionId,
    updateEvaluationBySessionId,
    deleteEvaluationBySessionId,
};
