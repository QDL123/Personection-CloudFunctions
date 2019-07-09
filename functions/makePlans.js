const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

exports.handler = async (snap, context) => {
    const { log } = console;
    log(`version: 2.7`);

    let db = admin.firestore();

    const userID = context.params.userID;
    const startTime = snap.data().startTime;
    const endTime = snap.data().endTime;

    const friends = await db.collection('users').doc(userID).collection('friends').listDocuments();

    const friendsPlans = await Promise.all(
        friends.map(friend => {
            return getFriendPlans(db, friend);
        })
    );

    // const friendsPlans = await Promise.all(
    //     friends.map(friend => {
    //         return async () => {
    //             const friendID = friend.id;
    //             const plansRefs = await db.collection('users').doc(friendID).collection('plans').listDocuments();
    //             const plans = await Promise.all(
    //                 plansRefs.map(ref => {
    //                     return ref.get();
    //                 })
    //             );
    //             return {
    //                 friendID,
    //                 plans
    //             };
    //         };
    //     })
    // );

    friendsPlans.forEach(friend => {
        friend.plans.forEach(plan => {
            log(`startTime: ${plan.data().startTime}`);
        })
    })
}

async function getFriendPlans(db, friend) {
    const friendID = friend.id;
    const plansRefs = await db.collection('users').doc(friendID).collection('plans').listDocuments();
    const plans = await Promise.all(
        plansRefs.map(ref => {
            return ref.get();
        })
    );
    return {
        friendID,
        plans
    };
}