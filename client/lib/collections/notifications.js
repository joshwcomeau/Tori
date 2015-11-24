Notifications = new Mongo.Collection(null);

Notifications.before.insert( function(userId, doc) {
  // We need to do a bit of standardizing: after all, this collection consists
  // of two disparate object types, Events and Follows.

  doc.toUserId    = doc.toUserId || doc.userId;
  doc.fromUserId  = doc.fromUserId || doc.haikuAuthorId;

  // This part is a bit hacky: I need to tell if this document was originally
  // a Follow or an Event. Because I know they have different fields, I can
  // use them to tell.
  doc.sourceCollectionName = doc.haikuId ? 'events' : 'follows';

  // Events naturally come with their own eventType; I just need to add one
  // for Follows:
  doc.eventType = doc.eventType || 'follow';

});

Notifications.before.update( function(userId, doc) {
  // The only real 'update' I can think of is marking one as dismissed, by
  // setting 'seen' to True. In this case, we actually just want to destroy
  // the Notification.
  if ( doc.seen = true ) {
    Notifications.remove(doc._id);
    return false;
  }

})
