module.exports = async ({ plans, myStartTime, myEndTime}) => {
    return plans.filter(plan => {
        // checking time conformance
        const oneHour = 7200;
        const minEndTime = Math.min(myEndTime, plan.endTime);
        const maxStartTime = Math.max(myStartTime, plan.startTime);
        const overlap = minEndTime - maxStartTime;

        if (overlap > oneHour) {
            console.log('Should add plan');
            return true;
        }
        console.log(`Did not meet time conformance`);
        return false;
    })
}