const TrainingType = require('../../model/schema/trainingType');

// Create operation
const createTrainingType = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate input
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Invalid input. Name must be a non-empty string.' });
        }

        // Check if the name already exists
        const existingTrainingType = await TrainingType.findOne({ name });
        if (existingTrainingType) {
            return res.status(400).json({ error: 'Training type with the same name already exists.' });
        }

        // Create a new TrainingType instance
        const newTrainingType = new TrainingType({ name });

        // Save the new instance to the database
        const savedTrainingType = await newTrainingType.save();

        return res.status(201).json(savedTrainingType);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Read operation
const getTrainingTypes = async (req, res) => {
    try {
        const trainingTypes = await TrainingType.find({ deleted: false });
        return res.json(trainingTypes);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update operation
const updateTrainingType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const updatedTrainingType = await TrainingType.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );

        return res.json(updatedTrainingType);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// Delete operation (soft delete by updating 'deleted' field)
const deleteTrainingType = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTrainingType = await TrainingType.findByIdAndUpdate(
            id,
            { deleted: true },
            { new: true }
        );

        return res.json(deletedTrainingType);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createTrainingType,
    getTrainingTypes,
    updateTrainingType,
    deleteTrainingType,
};
