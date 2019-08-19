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