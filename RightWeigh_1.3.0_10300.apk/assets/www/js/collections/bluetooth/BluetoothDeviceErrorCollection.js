define([
  'underscore',
  'backbone',
  'models/BluetoothDeviceErrorModel'
], function(_, Backbone, BluetoothDeviceErrorModel){
  var BluetoothDeviceErrorCollection = Backbone.Collection.extend({
    model: BluetoothDeviceErrorModel
  });
  
  return BluetoothDeviceErrorCollection;
});