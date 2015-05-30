define([
  'underscore',
  'backbone',
  'localstorage'
], function(_, Backbone){
  var BluetoothDeviceModel = Backbone.Model.extend({
    defaults: {
      id              : 1,
      name            : null,
      address         : null,
      status          : "disconnected"
    },
    
    initialize: function(){
      this.set('id', this.cid);
    }
  });
  
  return BluetoothDeviceModel;
});