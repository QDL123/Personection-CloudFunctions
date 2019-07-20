const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

exports.handler = async (snap, context) => {
    const { log } = console;
    log(`version: 2.7`);

    // Data aggregation

    let db = admin.firestore();

    const { userID } = context.params;
    const { startTime } = snap.data();
    const { endTime } = snap.data();

    const userPath = db.collection('users').doc(userID);
    const blockedPromise = userPath.collection('blocked').listDocuments();
    const friendsPromise = await userPath.collection('friends').listDocuments();


    const relations = await Promise.all([blockedPromise, friendsPromise]);
    // const blocked = relations[0];
    const friends = relations[1];

    // get all friend plan info
    // friendsPlans is an array of plans objects that passed relation, time, and blocking conformance
    const friendsPlans = await Promise.all(
        // Relation conformance
        friends.map(friend => {
            const params = { startTime, endTime, db, friend, blocked, userID };
            return getFriendPlans(params);
        })
    );

    // Consolidate recurrences
    const consolidated
}

async function getFriendPlans(params) {
    const friendID = params.friend.id;
    const plansRefs = await params.db.collection('users').doc(friendID).collection('plans').listDocuments();
    const plans = plansRefs.map(ref => {
        // stuff the friend attribute inside the plan data strucuture
        const plan = ref.get().friendIDs.push(friendID);
    })

    const timeConformancePlans = plans.filter(plan => {
        // checking time conformance
        const oneHour = 7200;
        if (Math.min(endTime, plan.data().endTime) - Math.max(startTime, plan.data().startTime) > oneHour) {
            return true;
        }
        return false;
    })

    // filter time conformance results for blocking conformance
    return await Promise.all(
        timeConformancePlans.filter(async plan => {
            plan.members.forEach(member => {
                // NEEDS SYNTAX CHECK
                if (params.blocked.includes(member.id)) {
                    return false;
                } else {
                    const memberBlockList = await params.db.collection.user(member.id).collection('blocked').listDocuments();
                    if (memberBlockList.includes(userID)) {
                        return false
                    }
                }
            })
            return true;
        })
    );
}

