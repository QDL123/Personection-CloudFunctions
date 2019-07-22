const functions = require('firebase-functions');


const newUserModule = require('./newUser');
const deleteUserModule = require('./deleteUser');
const makePlansModule = require('./makePlans');

exports.newUser = functions.firestore.document('users/{userID}')
.onCreate(newUserModule.handler);

exports.deleteUser = functions.firestore.document('users/{userID}')
.onDelete(deleteUserModule.handler);

exports.makePlans = functions.firestore.document('users/{userID}/plans/{planID}')
.onCreate(makePlansModule.handler);


