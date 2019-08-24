const functions = require('firebase-functions');


const newUserModule = require('./mainFunctions/newUser');
const deleteUserModule = require('./mainFunctions/deleteUser');
const makePlansModule = require('./mainFunctions/makePlans');

exports.newUser = functions.firestore.document('users/{userID}')
.onCreate(newUserModule.handler);

exports.deleteUser = functions.firestore.document('users/{userID}')
.onDelete(deleteUserModule.handler);

exports.makePlans = functions.firestore.document('users/{userID}/plans/{planID}')
.onCreate(makePlansModule.handler);


