Meteor.startup(function() {
  if ( Haikus.find().count() === 0 ) {
    // Create two users
    let poetId = Meteor.users.insert({
      username: 'ThePoet',
      profile:  {
        displayName: 'The Malevolent Poet',
        summary: 'Aspiring poet who leaves everything to the imagination. Fond of cats, cars and cabins.',
        photo: '/images/default_avatar.jpg',
        url: 'www.tori.com/ThePoet'
      },
      haikus: 0,
      followers: 0,
      following: 0,
      impact: 3.4
    });
    let poet = Meteor.users.findOne(poetId);
    
    let rollingHillsId = Meteor.users.insert({
      username: 'rollinghills',
      profile: {
        displayName: 'Lush Rolling Hills',
        summary: 'Inspiration: Shakespear, Wordsworth, Mia Angelou.',
        photo: '/images/alternate_default_avatar.jpg',
        url: 'www.tori.com/rollinghills'
      },
      haikus: 0,
      followers: 0,
      following: 0,
      impact: 1.2
    });
    let rollingHills = Meteor.users.findOne(rollingHillsId);
    
    let haiku_id = Haikus.insert({
      line1: 'Going to the store',
      line2: 'shopping for groceries',
      line3: 'still waters run deep',
      userId: poetId,
      authorName: poet.profile.displayName,
      createdAt: moment().subtract(4, 'minutes').toISOString(),
      retweets: 4
    });
    
    Haikus.insert({
      line1: 'Green frog',
      line2: 'is your body also',
      line3: 'freshly painted?',
      userId: rollingHillsId,
      authorName: rollingHills.profile.displayName,
      createdAt: moment().subtract(2, 'hours').toISOString(),
      likes: 2
    });
    
    Haikus.insert({
      line1: 'Without flowing wine',
      line2: 'How to enjoy lovely',
      line3: 'Cherry blossom trees?',
      userId: rollingHillsId,
      authorName: rollingHills.profile.displayName,
      createdAt: moment().subtract(3, 'days').toISOString(),
      retweets: 12
    });
    
    Follows.insert({
      fromUserId: rollingHillsId,
      toUserId:   poetId
    });
    
    Likes.insert({
      haikuId: haiku_id,
      fromUserId: rollingHillsId
    });
    
    console.log("Fixture data inserted!");
  }
});