Slingshot.createDirective("background", Slingshot.S3Storage, {
  bucket: Meteor.settings.AWSBucket,

  acl: "public-read",

  authorize: function () {
    //Deny uploads if user is not logged in.
    if (!this.userId) {
      var message = "Please login before posting files";
      throw new Meteor.Error("Login Required", message);
    }

    return true;
  },

  key: function (file) {
    //Store file into a directory by the user's ID.
    return this.userId + "/" + file.name;
  }
});
