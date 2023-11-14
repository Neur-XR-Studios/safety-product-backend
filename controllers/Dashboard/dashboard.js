

const index = async (req, res) => {

    const total_training_completed = '2235';
    const total_hours_trained = '118';
    const readiness_percentage = '97';
    const average_response_time = '4';
    const training_done = '215';
    const hours_trained = '107';

    try {
        const result = {
            totalTrainingCompleted: total_training_completed,
            totalHoursTrained: total_hours_trained,
            readinessPercentage: readiness_percentage,
            averageResponseTime: average_response_time,
            trainingDone: training_done,
            hoursTrained: hours_trained
        };

        res.send(result);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
};


module.exports = { index }