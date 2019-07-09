const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');

var client = algoliasearch(functions.config().algolia.id, functions.config().algolia.admin_key);


exports.handler = ((snap, context) => {
  //Get the user document
  const user = snap.data()
  user.objectID = context.params.userID;

  // Write to the algolia index
  const index = client.initIndex(functions.config().algolia.index_name);
  return index.saveObject(user);
})
