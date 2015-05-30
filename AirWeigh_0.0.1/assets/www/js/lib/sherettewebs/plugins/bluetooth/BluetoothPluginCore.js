/**
 * BluetoothPluginCore.js
 * Descriptions:  File used for bluetooth connectivity for the Standard platform.
 * Parent Class:  BluetoothPluginAbstract
 * Required:      Standard Version 4.3+
 *                SWBluetoothPlugin
 * 
 * @author  Brandon Sherette
 * @version 0.0.1 (2014.9.30)
 */
define([
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginAbstract',
  // plugins
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginCoreIsConnected',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginCoreScan',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginCoreConnect',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginCoreDisconnect',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginCoreRead',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginCoreIsEnabled'
], function(BluetoothPluginAbstract, IsConnectedPlugin, ScanPlugin, ConnectPlugin, DisconnectPlugin, ReadPlugin, IsEnabledPlugin) {
  var BluetoothPluginCore = function() {
    BluetoothPluginAbstract.call(this);
  };
  // inherit from BluetoothPluginAbstract
  BluetoothPluginCore.prototype = Object.create(BluetoothPluginAbstract.prototype);
  BluetoothPluginCore.constructor = BluetoothPluginCore;

  /* ----- METHOD PROTOTYPES ----- */
  BluetoothPluginCore.prototype.isConnected = IsConnectedPlugin;
  BluetoothPluginCore.prototype.scan        = ScanPlugin;
  BluetoothPluginCore.prototype.connect     = ConnectPlugin;
  BluetoothPluginCore.prototype.disconnect  = DisconnectPlugin;
  BluetoothPluginCore.prototype.read        = ReadPlugin;
  BluetoothPluginCore.prototype.isEnabled   = IsEnabledPlugin;
  
  /* ----- ADDITIONAL PLATFORM SPECIFIC PLUGINS ------ */  
  
  return BluetoothPluginCore;
});