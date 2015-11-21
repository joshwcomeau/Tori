// This is in its own subdirectory simply so that it gets loaded before the
// collections in its parent directory. Yayyy Meteor.

SchemaHelpers = {
  createdAt: {
    type: Date,
    autoValue: function() {
      if ( this.isInsert ) return new Date;
      if ( this.isUpsert ) return { $setOnInsert: new Date };
      if ( this.isUpdate ) {
        this.unset();
        return;
      }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      return new Date;
    }
  }
}
