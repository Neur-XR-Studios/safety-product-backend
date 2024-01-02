const { ObjectId } = require('mongoose').Types;
const Trainee = require('../../model/schema/trainee');
const Company = require('../../model/schema/company');
const TrainingType = require('../../model/schema/trainingType');
const ExcelJS = require("exceljs");

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
async function processHeightEvaluationTime(result) {
    let HeightEvaluationTimeTaken = 0;

    for (const trainee of result) {
        const timeTaken = trainee.workatheigthevaluation;

        for (const data of timeTaken) {
            const timeTakenForLearning = data.timeTaken;

            if (timeTakenForLearning) {
                const [minutes, seconds] = timeTakenForLearning.split(':');
                HeightEvaluationTimeTaken += parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
            }
        }
    }

    return HeightEvaluationTimeTaken / 3600;
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
    let responseTimes = 0;

    for (const trainee of result) {
        const timeTaken = trainee.evaluation;

        for (const data of timeTaken) {
            const timeTakenForEvaluation = data[test];
            const timetake = timeTakenForEvaluation.responseTime;

            if (timetake) {
                const [minutes, seconds] = timetake.split(':');
                responseTimes += parseInt(minutes, 10) + parseInt(seconds, 10);
            }
        }
    }

    return responseTimes
}

const fireExtinguisherIndex = async (req, res) => {

    const adminInfo = req.user;
    const companyID = adminInfo.company._id;

    try {
        const companyDetails = await Company.findOne({ _id: companyID });
        if (!companyDetails) {
            res.status(404).send({ message: 'Company not found' });
            return;
        }

        const result = await Trainee.aggregate([
            {
                $match: {
                    company: new ObjectId(companyID),
                    type: "fire-extinguisher"
                }
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
                    type: 1,
                    learning: {
                        timeTaken: 1,
                        languageSelected: 1,
                    },
                    evaluation: {
                        timeTaken: 1,
                        completionStatus: 1,
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
        const totalTrainingsessionCompleted = result.length;

        const totalTrainingCompleted = result.reduce((total, trainee) => {
            const completionStatus = trainee.evaluation;
            return total + completionStatus.filter(data => data.completionStatus === "Complete").length;
        }, 0);

        // Learning Time Taken
        const learningTimeTakenInHours = await processLearningTime(result);

        // Evaluation Time Taken
        const evaluationTimeTakenInHours = await processEvaluationTime(result);

        // Total Time Taken
        const restotalTimeTaken = learningTimeTakenInHours + evaluationTimeTakenInHours;
        const totalHoursTrained = Number(restotalTimeTaken.toFixed(1));

        // Readiness Percentage
        const readinessPercentageCalculation = Math.round((totalTrainingCompleted / result.length) * 100);
        const readinessPercentage = readinessPercentageCalculation || 0;

        // Average Response Time
        const responseTimeOfTest1 = calculateAverageResponseTime(result, 'test1');
        const responseTimeOfTest2 = calculateAverageResponseTime(result, 'test2');

        const averageResponseTime = (responseTimeOfTest1 + responseTimeOfTest2) / (2 * totalTrainingsessionCompleted) || 0;
        const roundedAverage = parseInt(averageResponseTime.toFixed(2)) || 0;

        res.send({
            message: 'Success',
            data: {
                companyDetails,
                totalTrainingCompleted: totalTrainingsessionCompleted,
                totalHoursTrained,
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
        const adminInfo = req.user;
        const companyId = adminInfo.company._id;
        const month = req.body.month;
        const year = req.body.year;

        // Validate month
        const monthNumber = parseInt(month, 10);
        if (!month || isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
            return res.status(400).send({ message: 'Invalid or missing month in the request body.' });
        }

        // Validate year
        const yearNumber = parseInt(year, 10);
        if (!year || isNaN(yearNumber) || yearNumber < 1900 || yearNumber > 2100) {
            return res.status(400).send({ message: 'Invalid or missing year in the request body.' });
        }

        const result = await Trainee.aggregate([
            {
                $match: {
                    company: new ObjectId(companyId),
                    type: "fire-extinguisher"
                }
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
                $lookup: {
                    from: "sessiontimes",
                    localField: "sessionId",
                    foreignField: "sessionId",
                    as: "sessiontime"
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
                        languageSelected: 1,
                    },
                    evaluation: {
                        timeTaken: 1,
                        completionStatus: 1,
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
                    sessiontime: {
                        timeTaken: 1
                    }

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

        // Create a new Excel workbook and add a worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('FireExtinguisherData');

        // Define the worksheet columns with custom headers
        const columns = [
            // Trainee Data
            { header: 'SI', key: 'SI', width: 5, style: { alignment: { horizontal: 'center' } } },
            { header: 'Date', key: 'Date', width: 10, style: { alignment: { horizontal: 'center' } } },
            { header: 'Session ID', key: 'sessionId', width: 15, style: { alignment: { horizontal: 'center' } } },
            { header: 'Phone number', key: 'phoneNumber', width: 15, style: { alignment: { horizontal: 'center' } } },

            // Learning
            { header: 'Language selected', key: 'languageSelected', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'Learning Time taken', key: 'learningtimeTaken', width: 20, style: { alignment: { horizontal: 'center' } } },

            // Evaluation
            { header: 'Total time taken for evaluation', key: 'evaluationtotalTime', width: 28, style: { alignment: { horizontal: 'center' } } },
            { header: 'Total time (Test 1)', key: 'evaluationtest1totalTime', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'Response time (Test 1)', key: 'evaluationtest1responseTime', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'Extinguishment time (Test 1)', key: 'evaluationtest1extinguishmentTime', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'Total time (Test 2)', key: 'evaluationtest2totalTime', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'Response time (Test 2)', key: 'evaluationtest2responseTime', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'completion Status', key: 'evaluationcompletionStatus', width: 25, style: { alignment: { horizontal: 'center' } } },

            //total session time 
            { header: 'Total Session Time', key: 'totalsessiontimetaken', width: 25, style: { alignment: { horizontal: 'center' } } },
        ];

        // Set the worksheet columns
        worksheet.columns = columns;

        // Add the data to the worksheet
        result.forEach((rowData, index) => {
            const row = {};

            // Assuming 'CreatedOn' is the date field in your result
            const formattedDate = rowData.CreatedOn ? rowData.CreatedOn.toISOString().slice(0, 10) : '';

            // Assigning values to custom keys for formatting
            row.SI = index + 1;
            row.Date = formattedDate;
            row.sessionId = index + 1000;
            row.phoneNumber = rowData.phoneNumber;

            rowData.learning.forEach((learningData) => {
                row.languageSelected = learningData.languageSelected
                row.learningtimeTaken = learningData.timeTaken
            });

            rowData.evaluation.forEach((evaluationData) => {
                row.evaluationtotalTime = evaluationData.timeTaken
                row.evaluationcompletionStatus = evaluationData.completionStatus
                if (evaluationData.test1) {
                    row.evaluationtest1totalTime = evaluationData.test1.totalTime;
                    row.evaluationtest1responseTime = evaluationData.test1.responseTime;
                    row.evaluationtest1extinguishmentTime = evaluationData.test1.extinguishmentTime;
                } else {
                    row.evaluationtest1totalTime = null;
                    row.evaluationtest1responseTime = null;
                    row.evaluationtest1extinguishmentTime = null;
                }

                if (evaluationData.test1) {
                    row.evaluationtest2totalTime = evaluationData.test2.totalTime;
                    row.evaluationtest2responseTime = evaluationData.test2.responseTime;
                } else {
                    row.evaluationtest2totalTime = null;
                    row.evaluationtest2responseTime = null;
                }

                // rowData.sessiontime.forEach((sessiontimeData) => {
                //     row.totalsessiontimetaken = sessiontimeData.timeTaken
                // });
            });
            rowData.sessiontime.forEach((sessiontimeData) => {
                row.totalsessiontimetaken = sessiontimeData.timeTaken
            });
            columns.forEach(column => {
                const { key } = column;
                const value = row[key];

                if (value === null || value === undefined) {
                    row[key] = '-';
                }
            });
            worksheet.addRow(row);
        });

        // Set up the response headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=FireExtinguisherData.xlsx');

        // Write the Excel workbook to the response stream
        await workbook.xlsx.write(res);

        // End the response after writing the workbook
        res.end();

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}

const workAtHeightIndex = async (req, res) => {

    const adminInfo = req.user;
    const companyId = adminInfo.company._id;

    const companyDetails = await Company.findOne({ _id: new ObjectId(companyId) });

    if (!companyDetails) {
        return res.status(400).send({ message: 'company_id not found!.' });
    }

    try {
        const result = await Trainee.aggregate([
            {
                $match: {
                    company: new ObjectId(companyId),
                    type: "work-at-height"
                }
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
                    from: "workatheigthevaluations",
                    localField: "sessionId",
                    foreignField: "sessionId",
                    as: "workatheigthevaluation"
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
                        languageSelected: 1,
                    },
                    workatheigthevaluation: {
                        timeTaken: 1,
                        score: 1,
                        completionStatus: 1
                    },
                }
            }
        ]);
        // Total Training Completed
        const totalTrainingsessionCompleted = result.length;

        const totalTrainingCompleted = result.reduce((total, trainee) => {
            const completionStatus = trainee.workatheigthevaluation;
            return total + completionStatus.filter(data => data.completionStatus === "Complete").length;
        }, 0);

        // Total Training InCompleted
        const totalTrainingInCompleted = result.reduce((total, trainee) => {
            const completionStatus = trainee.workatheigthevaluation;
            return total + completionStatus.filter(data => data.completionStatus === "Incomplete").length;
        }, 0);


        // Learning Time Taken
        const learningTimeTakenInHours = await processLearningTime(result);

        // Height Evaluation Time Taken
        const evaluationTimeTakenInHours = await processHeightEvaluationTime(result);

        // Total Hours Trained
        const restotalTimeTaken = learningTimeTakenInHours + evaluationTimeTakenInHours;
        const totalHoursTrained = Number(restotalTimeTaken.toFixed(1));

        // Readiness Percentage
        const totalNumberOFSessions = Math.round((totalTrainingCompleted / result.length) * 100);

        const readinessPercentage = totalNumberOFSessions || 0;

        // Average score
        const fullModuleCompletion = totalTrainingCompleted + totalTrainingInCompleted
        const averageScore = Math.round(calculateAverageScore(result, fullModuleCompletion));

        res.send({
            message: 'Success',
            data: {
                // result
                companyDetails,
                totalTrainingCompleted: totalTrainingsessionCompleted,
                totalHoursTrained,
                readinessPercentage,
                averageScore
            }
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }

}

const calculateAverageScore = (result, fullModuleCompletion) => {
    let totalNumerator = 0;
    let totalDenominator = 0;

    result.forEach((trainee) => {
        const workatheigthevaluation = trainee.workatheigthevaluation || [];
        workatheigthevaluation.forEach((evaluation) => {
            const [numerator, denominator] = evaluation.score.split('/').map(Number);

            totalNumerator += numerator;
            totalDenominator += denominator;
        });
    });

    const averageNumerator = totalNumerator / fullModuleCompletion || 0;
    const averageDenominator = totalDenominator / result.length || 0;
    const averageScore = averageNumerator;
    // const averageScore = `${averageNumerator}/${averageDenominator}`;
    return averageScore;
};

const workAtHeightExcel = async (req, res) => {
    try {
        const adminInfo = req.user;
        const companyId = adminInfo.company._id;
        const month = req.body.month;
        const year = req.body.year;

        // Validate month
        const monthNumber = parseInt(month, 10);
        if (!month || isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
            return res.status(400).send({ message: 'Invalid or missing month in the request body.' });
        }

        // Validate year
        const yearNumber = parseInt(year, 10);
        if (!year || isNaN(yearNumber) || yearNumber < 1900 || yearNumber > 2100) {
            return res.status(400).send({ message: 'Invalid or missing year in the request body.' });
        }
        const result = await Trainee.aggregate([
            {
                $match: {
                    company: new ObjectId(companyId),
                    type: "work-at-height"
                }
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
                    from: "workatheigthevaluations",
                    localField: "sessionId",
                    foreignField: "sessionId",
                    as: "workatheigthevaluation"
                }
            },
            {
                $lookup: {
                    from: "sessiontimes",
                    localField: "sessionId",
                    foreignField: "sessionId",
                    as: "sessiontime"
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
                        languageSelected: 1,
                    },
                    workatheigthevaluation: {
                        timeTaken: 1,
                        score: 1,
                        completionStatus: 1
                    },
                    sessiontime: {
                        timeTaken: 1
                    }
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
        // Create a new Excel workbook and add a worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('WorkAtHeight');

        // Define the worksheet columns with custom headers
        const columns = [
            // Trainee Data
            { header: 'SI', key: 'SI', width: 5, style: { alignment: { horizontal: 'center' } } },
            { header: 'Date', key: 'Date', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'Session ID', key: 'sessionId', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'Phone number', key: 'phoneNumber', width: 25, style: { alignment: { horizontal: 'center' } } },

            // Learning
            { header: 'Language selected', key: 'languageSelected', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'Learning Time taken', key: 'learningtimeTaken', width: 25, style: { alignment: { horizontal: 'center' } } },

            // Evaluation
            { header: 'Evaluation time taken', key: 'evaluationtotalTime', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'Score', key: 'score', width: 25, style: { alignment: { horizontal: 'center' } } },
            { header: 'Completion Status', key: 'completionStatus', width: 25, style: { alignment: { horizontal: 'center' } } },

            //total session time
            { header: 'Total Session Time', key: 'totalsessiontimetaken', width: 25, style: { alignment: { horizontal: 'center' } } },
        ];


        // Set the worksheet columns
        worksheet.columns = columns;

        // Add the data to the worksheet
        result.forEach((rowData, index) => {
            const row = {};

            // Assuming 'CreatedOn' is the date field in your result
            const formattedDate = rowData.CreatedOn ? rowData.CreatedOn.toISOString().slice(0, 10) : '';

            // Assigning values to custom keys for formatting
            row.SI = index + 1;
            row.Date = formattedDate;
            row.sessionId = index + 1000;
            row.phoneNumber = rowData.phoneNumber;

            rowData.learning.forEach((learningData) => {
                row.languageSelected = learningData.languageSelected
                row.learningtimeTaken = learningData.timeTaken
            });

            rowData.workatheigthevaluation.forEach((evaluationData) => {
                row.score = evaluationData.score
                row.evaluationtotalTime = evaluationData.timeTaken
                row.completionStatus = evaluationData.completionStatus
            });

            rowData.sessiontime.forEach((sessiontimeData) => {
                row.totalsessiontimetaken = sessiontimeData.timeTaken
            });
            columns.forEach(column => {
                const { key } = column;
                const value = row[key];

                if (value === null || value === undefined) {
                    row[key] = '-';
                }
            });
            worksheet.addRow(row);
        });

        // Set up the response headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=workAtHeight.xlsx');

        // Write the Excel workbook to the response stream
        await workbook.xlsx.write(res);

        // End the response after writing the workbook
        res.end();

    } catch (error) {
        res.status(500).send({ message: error.message });
    }

}


module.exports = { fireExtinguisherIndex, fireExtinguisherExcel, workAtHeightIndex, workAtHeightExcel };
