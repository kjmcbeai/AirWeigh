define([
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginCore',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginIOSDiscoverServices'
], function(BluetoothPluginCore, DiscoverServicesPlugin){
  var BluetoothPluginIOS = function(){
    BluetoothPluginCore.call(this);
  };
  
  // inherit from BluetoothPluginAbstract
  BluetoothPluginIOS.prototype = Object.create(BluetoothPluginCore.prototype);
  BluetoothPluginIOS.constructor = BluetoothPluginIOS;

  /* ----- METHOD PROTOTYPES ----- */
  BluetoothPluginIOS.prototype.discoverServices = DiscoverServicesPlugin;
  
  /* ----- ADDITIONAL IOS SPECIFIC PLUGINS ------ */  
  
  return BluetoothPluginIOS;
});