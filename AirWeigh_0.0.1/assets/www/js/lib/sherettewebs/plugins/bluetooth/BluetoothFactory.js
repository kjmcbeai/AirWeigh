define([
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginCore',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginAndroid',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginIOS'
], function(BluetoothPluginCore, BluetoothPluginAndroid, BluetoothPluginIOS){
  var BluetoothFactory,
      _instances = {};
  
  var BluetoothFactory = {
    /**
     * Gets a instance of the Bluetooth Plugin used for the device found.
     * @returns {BluetoothAbstract}
     */
    getInstance: function(){
      var type = (window.device && window.device.platform) ? device.platform : "android";
      
      // make sure type is lowercase to prevent any varied formats during check
      type = type.toLowerCase();
      
      if(_instances[type] !== undefined){
        return _instances[type];
      }
      
      // create instance
      switch(type){
        case 'android':
          _instances[type] = new BluetoothPluginAndroid();
          break;
          
        case 'ios':
          _instances[type] = new BluetoothPluginIOS();
          break;
          
        default:
          throw new Error("Device Not Found.");
      }
      
      return _instances[type];
    }//--End /getInstance/
  };
  
  return BluetoothFactory;
});