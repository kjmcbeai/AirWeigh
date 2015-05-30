/**
 * BluetoothPluginAndroid.js
 * Descriptions:  File used for bluetooth connectivity for the Android platform.
 * Parent Class:  BluetoothPluginAbstract
 * Required:      Android Version 4.3+
 *                bluetoothle
 * 
 * @author  Brandon Sherette
 * @version 0.0.1 (2014.9.30)
 */
define([
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginCore',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginAndroidDiscoverServices'
], function(BluetoothPluginCore, DiscoverServicesPlugin) {
  var BluetoothPluginAndroid = function() {
    BluetoothPluginCore.call(this);
  };
  // inherit from BluetoothPluginAbstract
  BluetoothPluginAndroid.prototype = Object.create(BluetoothPluginCore.prototype);
  BluetoothPluginAndroid.constructor = BluetoothPluginAndroid;

  /* ----- METHOD PROTOTYPES ----- */
  BluetoothPluginAndroid.prototype.discoverServices = DiscoverServicesPlugin;
  
  /* ----- ADDITIONAL ANDROID SPECIFIC PLUGINS ------ */  
  
  return BluetoothPluginAndroid;
});