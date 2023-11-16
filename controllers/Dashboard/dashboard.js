const { ObjectId } = require('mongoose').Types;
const Trainee = require('../../model/schema/trainee');
const Company = require('../../model/schema/company');

const index = async (req, res) => {
    try {
        const companyId = req.body.company_id;
        const companyDetails = await Company.findOne({ _id: new ObjectId(companyId) });
        const result = await Trainee.aggregate([
            {
                $match: { company: new ObjectId(companyId) }
            },
            {
                $lookup: {
                    from: "learnings",
                    localField: "sessionId",
                    foreignField: "sessionId",
                    as: "learning"
                }
            },
            {
                $lookup: {
                    from: "evaluations",
                    localField: "sessionId",
                    foreignField: "sessionId",
                    as: "evaluation"
                }
            },
            {
                $project: {
                    _id: 1,
                    sessionId: 1,
                    phoneNumber: 1,
                    company: 1,
                    CreatedOn: 1,
                    learning: {
                        timeTaken: 1,
                        completionStatus: 1,
                        languageSelected: 1,
                    },
                    evaluation: {
                        timeTaken: 1,
                        test1: {
                            totalTime: 1,
                            responseTime: 1,
                            extinguishmentTime: 1,
                        },
                        test2: {
                            totalTime: 1,
                            responseTime: 1,
                        },
                    },
                }
            }
        ]);

        // Training Completed
        let totalTrainingCompleted = 0;

        result.forEach(trainee => {
            const completionStatus = trainee.learning;
            completionStatus.forEach(
                data => {
                    const completedStatus = data.completionStatus
                    if (completedStatus == "Complete") {
                        totalTrainingCompleted += 1;
                    }
                }
            )
        });

        // learning Time Taken
        let learningTimeTaken = 0;

        result.forEach(trainee => {
            const timeTaken = trainee.learning;
            timeTaken.forEach(data => {
                const timeTakenForLearning = data.timeTaken
                if (timeTakenForLearning) {
                    const [minutes, seconds] = timeTakenForLearning.split(':');
                    learningTimeTaken += parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
                }

            })
        })
        const learningTimeTakenInHours = learningTimeTaken / 3600;

        // evaluation Time Taken
        let evaluationTimeTaken = 0;

        result.forEach(trainee => {
            const timeTaken = trainee.evaluation;
            timeTaken.forEach(data => {
                const timeTakenForEvaluation = data.timeTaken
                if (timeTakenForEvaluation) {
                    const [minutes, seconds] = timeTakenForEvaluation.split(':');
                    evaluationTimeTaken += parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
                }

            })
        })
        const evaluationTimeTakenInHours = evaluationTimeTaken / 3600;

        // Total Time Taken
        const totalTimeTaken = learningTimeTakenInHours + evaluationTimeTakenInHours
        const restotalTimeTaken = Number(totalTimeTaken).toFixed(1)

        // Readiness Percentage
        const totalNumberOfTrainingCompleted = totalTrainingCompleted
        const totalNumberOfSession = result.length

        const readinessPercentageCalculation = Math.round((totalNumberOfTrainingCompleted / totalNumberOfSession) * 100)
        const readinessPercentage = readinessPercentageCalculation ? readinessPercentageCalculation : 0


        // Average Response Time For Test 1 
        const responseTimeOfTest1 = 0

        result.forEach(trainee => {
            const timeTaken = trainee.evaluation;
            timeTaken.forEach(data => {
                const timeTakenForEvaluation = data.test1
                timeTakenForEvaluation.forEach(data => {
                    const timetake = data.responseTime
                    if (timetake) {
                        const [minutes, seconds] = timetake.split(':');
                        responseTimeOfTest1 += parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
                    }
                })
            })
        })

        res.send({
            message: 'Success',
            data: {
                data: result
                // companyDetails,
                // totalTrainingCompleted,
                // restotalTimeTaken,
                // readinessPercentage,
                // averageResponseTime
            }
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

module.exports = { index };
