const admin = require('firebase-admin');
const functions = require('firebase-functions');
const getFriendPlans = require('../utils/getFriendsPlans');

admin.initializeApp(functions.config().firebase);

exports.handler = async (snap, context) => {
    const { log } = console;
    log(`version: 4.4`);

    // Data aggregation

    let db = admin.firestore();

    const { userID } = context.params;
    const { startTime } = snap.data();
    const { endTime } = snap.data();
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

