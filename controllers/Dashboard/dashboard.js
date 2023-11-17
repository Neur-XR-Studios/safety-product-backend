const { ObjectId } = require('mongoose').Types;
const Trainee = require('../../model/schema/trainee');
const Company = require('../../model/schema/company');
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

        // Validate companyId
        if (!companyId || typeof companyId !== 'string') {
            return res.status(400).send({ message: 'Invalid or missing company_id in the request body.' });
        }

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

        // Create a new Excel workbook and add a worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('FireExtinguisherData');

        // Define the worksheet columns with custom headers
        const columns = [
            // Trainee Data
            { header: 'SI', key: 'SI', width: 5 },
            { header: 'Date', key: 'Date', width: 10 },
            { header: 'Session ID', key: 'sessionId', width: 15 },
            { header: 'Phone number', key: 'phoneNumber', width: 15 },

            // Learning
            { header: 'Language selected', key: 'languageSelected', width: 15 },
            { header: 'Learning Time taken', key: 'learning.timeTaken', width: 10 },
            { header: 'Learning completion Status', key: 'learning.completionStatus', width: 10 },

            // Evaluation
            { header: 'Total time taken for evaluation', key: 'evaluation.totalTime', width: 25 },
            { header: 'Total time (Test 1)', key: 'evaluation.test1.totalTime', width: 15 },
            { header: 'Response time (Test 1)', key: 'evaluation.test1.responseTime', width: 15 },
            { header: 'Extinguishment time (Test 1)', key: 'evaluation.test1.extinguishmentTime', width: 15 },
            { header: 'Total time (Test 2)', key: 'evaluation.test2.totalTime', width: 15 },
            { header: 'Response time (Test 2)', key: 'evaluation.test2.responseTime', width: 15 },

            // Completion Status
            { header: 'Completion Status', key: 'learning.completionStatus', width: 15 },
        ];

        // Set the worksheet columns
        worksheet.columns = columns;

        // Add the data to the worksheet
        result.forEach((row, index) => {
            // Assuming 'CreatedOn' is the date field in your result
            const formattedDate = row.CreatedOn ? row.CreatedOn.toISOString().slice(0, 10) : '';

            // Assigning values to custom keys for formatting
            row.SI = index + 1;
            row.Date = formattedDate;
            row.sessionId = result.sessionId;
            row.phoneNumber = result.phoneNumber;

            row.learning.forEach((learningData) => {
                row['Language selected'] = learningData.languageSelected;
                row['Learning Time taken'] = learningData.timeTaken;
                row['Learning completion Status'] = learningData.completionStatus;
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
