define([
  'underscore',
  'backbone',
  'models/truck/TruckAxleModel'
], function(_, Backbone, TruckAxleModel){
  var TruckAxleCollection = Backbone.Collection.extend({
    model: TruckAxleModel
  });
  
  return TruckAxleCollection;
});