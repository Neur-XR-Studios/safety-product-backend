const { ObjectId } = require('mongoose').Types;
const Trainee = require('../../model/schema/trainee');
const Company = require('../../model/schema/company');
const excelJS = require("exceljs");

async function processLearningTime(result) {
    let learningTimeTaken = 0;

    for (const trainee of result) {
        const timeTaken = trainee.learning;

        for (const data of timeTaken) {
            const timeTakenForLearning = data.timeTaken;

            if (timeTakenForLearning) {
                const [minutes, seconds] = timeTakenForLearning.split(':');
                learningTimeTaken += parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
            }
        }
    }

    return learningTimeTaken / 3600;
}

async function processEvaluationTime(result) {
    let evaluationTimeTaken = 0;

    for (const trainee of result) {
        const timeTaken = trainee.evaluation;

        for (const data of timeTaken) {
            const timeTakenForEvaluation = data.timeTaken;

            if (timeTakenForEvaluation) {
                const [minutes, seconds] = timeTakenForEvaluation.split(':');
                evaluationTimeTaken += parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
            }
        }
    }

    return evaluationTimeTaken / 3600;
}

function calculateAverageResponseTime(result, test) {
    let responseTime = 0;

    for (const trainee of result) {
        const timeTaken = trainee.evaluation;

        for (const data of timeTaken) {
            const timeTakenForEvaluation = data[test];
            const timetake = timeTakenForEvaluation.responseTime;

            if (timetake) {
                const [seconds, milliSeconds] = timetake.split(':');
                responseTime += parseInt(seconds, 10) + parseInt(milliSeconds, 10) / 1000;
            }
        }
    }

    return responseTime
}

const fireExtinguisherIndex = async (req, res) => {

    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    const companyId = req.body.company_id;

    if (!isValidObjectId(companyId)) {
        res.status(400).send({ message: 'Invalid company ID format' });
        return;
    }

    try {
        const companyDetails = await Company.findOne({ _id: new ObjectId(companyId) });
        if (!companyDetails) {
            res.status(404).send({ message: 'Company not found' });
            return;
        }

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

        // Total Training Completed
        const totalTrainingCompleted = result.reduce((total, trainee) => {
            const completionStatus = trainee.learning;
            return total + completionStatus.filter(data => data.completionStatus === "Complete").length;
        }, 0);

        // Learning Time Taken
        const learningTimeTakenInHours = await processLearningTime(result);

        // Evaluation Time Taken
        const evaluationTimeTakenInHours = await processEvaluationTime(result);

        // Total Time Taken
        const totalTimeTaken = learningTimeTakenInHours + evaluationTimeTakenInHours;
        const restotalTimeTaken = Number(totalTimeTaken.toFixed(1));

        // Readiness Percentage
        const readinessPercentageCalculation = Math.round((totalTrainingCompleted / result.length) * 100);
        const readinessPercentage = readinessPercentageCalculation || 0;

        // Average Response Time
        const responseTimeOfTest1 = calculateAverageResponseTime(result, 'test1');
        const responseTimeOfTest2 = calculateAverageResponseTime(result, 'test2');

        const averageResponseTime = (responseTimeOfTest1 + responseTimeOfTest2) / (2 * totalTrainingCompleted) || 0;

        res.send({
            message: 'Success',
            data: {
                companyDetails,
                totalTrainingCompleted,
                restotalTimeTaken,
                readinessPercentage,
                averageResponseTime
            }
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const fireExtinguisherExcel = async (req, res) => {


    try {
        const companyId = req.body.company_id;
        const month = req.body.month;
        const year = req.body.year;

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
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $year: "$CreatedOn" }, parseInt(year)] },
                            { $eq: [{ $month: "$CreatedOn" }, parseInt(month)] }
                        ]
                    }
                }
            }
        ]);


        res.send({
            message: 'Success',
            data: {
                result
            }
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

module.exports = { fireExtinguisherIndex, fireExtinguisherExcel };
