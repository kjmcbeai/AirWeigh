define([
  'underscore',
  'backbone',
  'models/profile/ProfileModel'
], function(_, Backbone, ProfileModel){
  var ProfileCollection = Backbone.Collection.extend({    
    model: ProfileModel
  });
  
  return ProfileCollection;
});