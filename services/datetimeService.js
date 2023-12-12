class DateTimeService {

    isValidDateTimeFormat(dateTimeString) {
        const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
        return dateTimeRegex.test(dateTimeString);
    }

    calculateTotalTime(startTime, endTime) {
        const isValidStartTime = this.isValidDateTimeFormat(startTime);
        const isValidEndTime = this.isValidDateTimeFormat(endTime);

        if (!isValidStartTime || !isValidEndTime) {
            throw new Error('startTime or endTime is not in a valid format.');
        }

        const startTimeObj = new Date(startTime);
        const endTimeObj = new Date(endTime);

        const timeDifferenceInSeconds = Math.floor((endTimeObj - startTimeObj) / 1000);

        const minutes = Math.floor(timeDifferenceInSeconds / 60);
        const paddedMinutes = String(minutes).padStart(2, '0');

        const seconds = timeDifferenceInSeconds % 60;
        const paddedSeconds = String(seconds).padStart(2, '0');

        return `${paddedMinutes}:${paddedSeconds}`;
    }
}

module.exports = DateTimeService;
