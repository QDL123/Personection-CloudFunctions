const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

exports.handler = async (snap, context) => {
    const { log } = console;
    log(`version: 4.4`);

    // Data aggregation

    let db = admin.firestore();

    const { userID } = context.params;
    const { startTime } = snap.data();
    const { endTime } = snap.data();
    const { members } = snap.data().members;
    const planID = snap.id;

    const userPath = db.collection('users').doc(userID);
    const blockedPromise = userPath.collection('blocked').listDocuments();
    const friendsPromise = userPath.collection('friends').listDocuments();


    const relations = await Promise.all([blockedPromise, friendsPromise]);
    // const blocked = relations[0];
    const friends = relations[1];
    const blocked = relations[0];


    // get all friend plan info
    // friendsPlans is an array of plans objects that passed relation, time, and blocking conformance
    const unflattenedFriendsPlans = await Promise.all(
        // Relation conformance
        friends.map(friend => {
            const params = { startTime, endTime, db, friend, blocked, userID };
            return getFriendPlans(params);
        })
    );
    log(`unflattened length: ${unflattenedFriendsPlans.length}`);
    const friendsPlans = [];
    unflattenedFriendsPlans.forEach(friend => {
        if (friend !== undefined) {
            if (friend.length > 0) {
                friend.forEach(plan => {
                    log(`should add plan: ${plan.id}`);
                    friendsPlans.push(plan);
                })
            }
        }
    }); 

    log(`1: friendPlans.length: ${friendsPlans.length}`);
    // Consolidate recurrences
    for (let i = friendsPlans.length; i > 0; --i) {
        for (let j = i - 1; j > 0; --j) {
            if (friendsPlans[i].id === friendsPlans[j].id) {
                // Add friends in plan j to friends in plan i
                friendsPlans[j].friendIDs.forEach(id => {
                    if (friendsPlans[i].friendIDs === undefined) {
                        friendsPlans.friendIDs = [id];
                    } else {
                        friendsPlans[i].friendIDs.push(id);
                    }
                })
                // remove plan j
                friendsPlans.splice(j, 1);
            }
        }
    }

    // Guaranteed merging
    log(`Should merge current plan (${planID}) with `);
    log(`2: riendsPlans length: ${friendsPlans.length}`);
    friendsPlans.forEach(plan => {
        if (plan.members.length < 3) {
            log('SHOULD MERGE');
            // const params = { db, planID, plan };
            // let largerPlan;
            // if (plan.members.length < members.length) {
            //     largerPlan = planID;
            // } else {
            //     largerPlan = plan.id;
            // }

            log(`${plan.id} `);
        }
    })
    log(`done`);
}

async function getFriendPlans(params) {
    const friendID = params.friend.id;
    const planRefs = await params.db.collection('users').doc(friendID).collection('plans').listDocuments();
    const planDocs = await Promise.all(
        planRefs.map(ref => {
            return ref.get()
        })
    ); 
    const plans = planDocs.map(doc => {
        // stuff the friend and id attributes inside the plan data strucuture
        const planData = doc.data();
        const plan = {
            id : doc.id,
            startTime : planData.startTime,
            endTime : planData.endTime,
            friendIDs : [friendID],
            members : planData.members
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

