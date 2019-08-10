const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch');

var client = algoliasearch(functions.config().algolia.id, functions.config().algolia.admin_key);

exports.handler = ((snap, context) => {
  const index = client.initIndex(functions.config().algolia.index_name);
  return index.deleteObject(context.params.userID);
})
