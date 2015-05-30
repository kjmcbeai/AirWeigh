define([
  'underscore',
  'backbone'
], function(_, Backbone){
  var BluetoothCharacteristicModel = Backbone.Model.extend({
    defaults: {
      serviceUuid: null,
      characteristicUuid: null,
      type: null,
      value: null,
      endianType: null
    },
    
    fetch: function(){
      alert('Fetch not implemented, only used for calling bluetooth methods such as BluetoothPlugin.read');
    }
  });
  
  return BluetoothCharacteristicModel;
});