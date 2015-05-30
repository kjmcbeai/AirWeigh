/**
 * BluetoothPluginAbstract - Base Object for all Bluetooth Connectivity (this is basically like an interface for bluetooth connectivity).
 * Known Subclasses:
 *  swbluetooth.BluetoothAndroid
 * 
 * @author  Brandon Sherette
 * @version 0.0.1 (2014.9.30)
 */
define([
  
], function(){
  var BluetoothPluginAbstract = function(){};
    
  /**
   * Default length in milliseconds before a timeout occurs.
   */
  BluetoothPluginAbstract.prototype.DEFAULT_TIMEOUT_LENGTH = 7000;
  
  /**
   * Options for the scan method.
   */
  BluetoothPluginAbstract.prototype.scanOptions = {
    success: function(bluetoothDeviceCollection){
      alert("Successfully found devices. " + bluetoothDeviceCollection);
    },
    
    error: function(errorModel){
      alert("Scan failed." + errorModel);
    },
    
    timeoutLength : 5000,
    
    scanTime: 3000
  };
  
  /**
   * 
   * @param {PlainObject} options the options for scanning for devices.
   * Example:
   * var options = {
   *   success  : function(bluetoothDeviceCollection){},
   *   error    : function(errorModel),
   *   scanTime : 10000
   * };
   */
  BluetoothPluginAbstract.prototype.scan = function(options){
    alert('Scan method should be implemented');
  };
  
  /**
   * Options for the connect method.
   */
  BluetoothPluginAbstract.prototype.connectOptions = {
    success: function(bluetoothDevice){
      alert("Successfully connected to device: " + bluetoothDevice);
    },
    
    error: function(errorModel){
      alert("Device connection failed." + errorModel);
    },
    
    onLostConnection: function(){
      
    },
    
    timeoutLength: 2000
  };
  
  /**
   * Connects to the specified device.
   * @param {PlainObject} options the options for connecting
   */
  BluetoothPluginAbstract.prototype.connect = function(deviceAddress, options){
    alert('Connect should be implemented');
  };
  
  BluetoothPluginAbstract.prototype.discoverServices = function(options){
    alert("Discover Services Should Be Implemented.");
  };
  
  
  /**
   * The options for the isConnected method.
   */
  BluetoothPluginAbstract.prototype.isConnectedOptions = {
    /**
     * The callback for when isConnected is successful.
     * @param {Boolean} isConnected true if user is connected to device already, false otherwise.
     */
    success: function(isConnected){
      alert('Connected: ' + isConnected);
    },
    
    error: function(errorModel){
      alert('Error on isConnected. ' + errorModel.msg);
    },
    
    timeoutLength: 5000
  };
  
  
  /**
   * Checks to see if the user is connected to a device already.
   * @param {PlainObject} options the options for the isConnected method.
   * @see BluetoothPluginAbstract.isConnectedOptions for the options for this method.
   */
  BluetoothPluginAbstract.prototype.isConnected = function(options){
    alert('Is Connected needs to be implemented.');
  };
  
  /**
   * The options for the disconnect method.
   */
  BluetoothPluginAbstract.prototype.disconnectOptions = {
    success: function(){
      alert('Disconnect Successful');
    },
    
    error: function(errorModel){
      alert('Error disconnecting. ' + errorModel.message);
    },
    
    deviceAddress: undefined,
    
    timeoutLength: 3000
  };
  
  
  /**
   * Disconnects the user from the currently connected bluetooth device.
   * @param {PlainObject} options the options for the disconnect process.
   * @see BluetoothPluginAbstract.disconnectOptions for more details.
   */
  BluetoothPluginAbstract.prototype.disconnect = function(options){
    alert('Disconnect needs to be implemented.');
  };
  
  
  /**
   * The options for the read method.
   */
  BluetoothPluginAbstract.prototype.readOptions = {
    success: function(characteristicModel){
      alert('Read completed. Value: ' + characteristicModel.get('value'));
    },
    
    error: function(errorModel){
      alert('Error: ' + errorModel.msg);
    },
    
    deviceAddress: undefined,
    
    timeoutLength: 10000
  };
  
  
  /**
   * Reads the specified characteristicModel.
   * @param {BluetoothCharacteristicModel} bluetoothCharacteristicModel the characteristic model to read from.
   * @param {PlainObject} options the options used for this method.
   * @see BluetoothPluginAbstract.readOptions for the available options for this method.
   */
  BluetoothPluginAbstract.prototype.read = function(bluetoothCharacteristicModel, options){
    alert('Read method needs implementing');
  };
  
  
  BluetoothPluginAbstract.prototype.subscribeOptions = {
    success: function(){
      alert('Subscribe Completed');
    },
    
    error: function(errorModel){
      alert('Error subscribing: ' + errorModel.message);
    },
    
    /**
     * On the event that the characteristic has been changed.
     * @param {BluetoothCharacteristicModel} bluetoothCharacteristicModel the characteristic that was changed, the value will have already been converted.
     */
    onChange: function(bluetoothCharacteristicModel){
      alert('Characteristic updated: ' + bluetoothCharacteristicModel.value);
    }
  };
  
  
  /**
   * Subscribes the specified characteristicModel.
   * @param {BluetoothCharacteristicModel} bluetoothCharacteristicModel the characteristic model to read from.
   * @param {PlainObject} options the options used for this method.
   * @see BluetoothPluginAbstract.subscribeOptions for the available options for this method.
   */
  BluetoothPluginAbstract.prototype.subscribe = function(bluetoothCharacteristicModel, options){
    alert('Subscribe method needs implementing.');
  };
  
  BluetoothPluginAbstract.prototype.isEnabled = function(options){
    alert("IsEnabled method needs implementing.");
  };
  
  BluetoothPluginAbstract.prototype.isEnabledOptions = {
    success: function(){
      alert("Bluetooth Enabled.");
    },
    
    error: function(errorModel){
      alert("Bluetooth not enabled.");
    }
  };
  
  return BluetoothPluginAbstract;
});