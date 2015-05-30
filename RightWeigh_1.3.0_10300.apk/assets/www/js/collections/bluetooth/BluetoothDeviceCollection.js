define([
  'underscore',
  'backbone',
  'BluetoothDeviceModel'
], function(_, Backbone, BluetoothDeviceModel){
  var BluetoothDeviceCollection = Backbone.Collection.extend({
    model: BluetoothDeviceModel
  });
  
  return BluetoothDeviceCollection;
});