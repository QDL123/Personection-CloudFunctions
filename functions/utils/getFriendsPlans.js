const refsToDocs = require('./refsToDocs.js');
const checkTimeConformance = require('./checkTimeConformance');

module.exports = async params => {
    const friendID = params.friend.id;
    const planRefs = await params.db.collection('users').doc(friendID).collection('plans').listDocuments();
    const planDocs = await Promise.all(
        planRefs.map(async ref => {
            const memberDocs = await ref.collection('members').listDocuments();
            const data = await Promise.all([ref.get(), refsToDocs(memberDocs)]);
            return {
                id: data[0].id,
                planDoc: data[0].data(),
                members: data[1]
            };
        })
    ); 
    const plans = planDocs.map(doc => {
        // stuff the friend and id attributes inside the plan data strucuture
        const planData = doc.planDoc;
        return {
            id : doc.id,
            startTime : planData.startTime,
            endTime : planData.endTime,
            friendIDs : [friendID],
            members : doc.members
        };
    })

    return checkTimeConformance({ plans, myStartTime: params.startTime, myEndTime: params.endTime });
}