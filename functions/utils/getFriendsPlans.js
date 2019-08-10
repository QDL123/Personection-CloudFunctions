const refsToDocs = require('./refsToDocs.js');

module.exports = async params => {
    const friendID = params.friend.id;
    const planRefs = await params.db.collection('users').doc(friendID).collection('plans').listDocuments();
    const planDocs = await Promise.all(
        planRefs.map(async ref => {
            const members = await ref.collection('members').listDocuments();
            return {
                planDoc: ref.get(),
                members: members
            };
        })
    ); 
    const plans = planDocs.map(async doc => {
        // stuff the friend and id attributes inside the plan data strucuture
        const planData = doc.planDoc.data();
        const members = await refsToDocs(planDoc.members);
        const plan = {
            id : doc.id,
            startTime : planData.startTime,
            endTime : planData.endTime,
            friendIDs : [friendID],
            members : members
        }
        return plan;
    })
    
    return plans.filter(plan => {
        // checking time conformance
        console.log(`params.endTime: ${params.endTime}`);
        console.log(`plan.endTime: ${plan.endTime}`);
        console.log(`params.startTime: ${params.startTime}`);
        console.log(`plans.startTime: ${plan.startTime}`);
        const oneHour = 7200;
        if (Math.min(params.endTime, plan.endTime) - Math.max(params.startTime, plan.startTime) > oneHour) {
            console.log('Should add plan');
            return true;
        }
        return false;
    })

    // filter time conformance results for blocking conformance
    // return await Promise.all(
    //     timeConformancePlans.filter(async plan => {
    //         plan.members.forEach(async member => {
    //             // NEEDS SYNTAX CHECK
    //             if (params.blocked.includes(member.id)) {
    //                 return false;
    //             } else {
    //                 // let db = admin.firestore();
    //                 const memberBlockList = await params.db.collection('users').user(member.id).collection('blocked').listDocuments();
    //                 if (memberBlockList.includes(userID)) {
    //                     return false
    //                 }
    //             }
    //         })
    //         return true;
    //     })
    // );
}