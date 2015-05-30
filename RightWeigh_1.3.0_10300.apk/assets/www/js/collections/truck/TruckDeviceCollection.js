define([
  'underscore',
  'backbone',
  'models/truck/TruckDeviceModel'
], function(_, Backbone, TruckDeviceModel){
  var TruckDeviceCollection = Backbone.Collection.extend({    
    model: TruckDeviceModel,
    
    truckDeviceInCollection: function(truckDevice){
      var x,
          mTruckDevice;
      
      for(x = 0; x < this.length; x+= 1){
        mTruckDevice = this.at(x);
        
        if(mTruckDevice.get("bluetoothDeviceModel").get("name").toLowerCase() === truckDevice.get("bluetoothDeviceModel").get("name").toLowerCase()){
          return true;
        }
      }
      
      return false;
    },//--end truckDeviceInCollection
    
    /**
     * 
     * @param {BluetoothDeviceModel} bluetoothDevice the bluetooth device to search for.
     * @returns {TruckDeviceModel} the found TruckDeviceModel that is a match with the specified bluetoothDevice. Returns null if no match was found.
     */
    getTruckDeviceByBluetoothDevice: function(bluetoothDevice){
      var x,
          mTruckDevice;
      
      for(x = 0; x < this.length; x+= 1){
        mTruckDevice = this.at(x);
        
        if(mTruckDevice.get("bluetoothDeviceModel").get("name").toLowerCase() === bluetoothDevice.get("name").toLowerCase()){
          return mTruckDevice;
        }
      }
      
      return null;
    }
  });
  
  return TruckDeviceCollection;
});