define([
  'sherettewebs',
  'ErrorModel',
  'BluetoothDeviceModel',
  'BluetoothDeviceCollection'
], function(SheretteWebs, ErrorModel, BluetoothDeviceModel, BluetoothDeviceCollection){  
  /**
   * Scans for available bluetooth devices.
   * @see BluetoothPluginAbstract.prototype.scan for more details.
   */
  var ScanPlugin = function(options) {
    var _masterDevices, // BluetoothDeviceCollection
        _this = this,
        _action = 'Scan',
        _scanTimer,
        DEVICE_NAME_FILTER = /^RWLS-[0-9A-Z:]+$/;

    /**
     * Runs this method.
     */
    function _run() {
      _init();
      
      if (bluetoothle && bluetoothle.hasOwnProperty("initialize")) {
        bluetoothle.initialize(
          // success
          function() {
            _scanTimer = window.setTimeout(_stopScan, options.scanTime);
            bluetoothle.startScan(_onScanItem, _onScanError);
          },
          
          // error
          function() {
            _onMethodFailure(new ErrorModel("Bluetooth turned off on your device."));
          },
          
          // params
          {
            request: false
          }
        );
      } else {
        _onMethodFailure(new ErrorModel("Bluetooth feature not installed in this app."));
      }
    }

    /**
     * Initializes this methods fields.
     */
    function _init() {
      _scanTimer = null;
      _masterDevices = new BluetoothDeviceCollection();
      options = SheretteWebs.Util.mergeOptions(_this.scanOptions, options);
    }


    /**
     * On the event an item has been scanned from bluetoothle.
     * @param {Object} bluetoothScannedItem the item found from the bluetooth scan.
     */
    function _onScanItem(bluetoothScannedItem) {        
      if (bluetoothScannedItem.hasOwnProperty("status")) {
        if (bluetoothScannedItem.status === "scanStarted") {
          // silently ignore
        } else {
          // check to see if device is unique and add it to masterDevices if it is, ignore otherwise
          if (!_inMasterDevices(bluetoothScannedItem) && DEVICE_NAME_FILTER.test(bluetoothScannedItem.name)) {
            _masterDevices.push(new BluetoothDeviceModel({
              id      : _masterDevices.length + 1,
              name    : bluetoothScannedItem.name,
              address : bluetoothScannedItem.address
            }));
          }
        }//end if-else scan start or scan result
      }//end if item formatted correctly 
    };


    /**
     * Checks to see if the specified device is in the master devices.
     * @param {Object} deviceToCheck the device that you are trying to see if it's in master devices.
     * @returns {Boolean} returns true if the specified device is in the master devices, false otherwise.
     */
    function _inMasterDevices(deviceToCheck) {
      for (var i = 0; i < _masterDevices.length; i++) {
        if (_masterDevices.at(i).get("address") && deviceToCheck.hasOwnProperty("address") && _masterDevices.at(i).get('address') === deviceToCheck.address) {
          return true;
        }
      }
      return false;
    }
    
    /**
     * The scan has stopped for positive reasons.
     */
    function _stopScan(){
      clearTimeout(_scanTimer);
      _scanTimer = null;
      
      bluetoothle.stopScan(function(response){
        _onMethodSuccess();
      },
      
      function(response){
        _onMethodFailure(new ErrorModel(response.message, ErrorModel.CODE_MAP.INTERNAL_SERVER_ERROR));
      });
    };


    /**
     * On the event that there was an error scanning.
     * @param {PlainObject} response the response from the scan error.
     */
     function _onScanError(response){
      clearTimeout(_scanTimer);
      _scanTimer = null;
      
      // need to stop the scanning process
      bluetoothle.stopScan(function(response){
        // silently ignore
      },
      
      function(response){
        // sliently ignore
      });
      
      _onMethodFailure(new ErrorModel(response.message, ErrorModel.CODE_MAP.INTERNAL_SERVER_ERROR));
    };


    /**
     * The event that this method was successful. calls _options.onSuccess method.
     */
    function _onMethodSuccess() {
      // clear the internal timer
      if (_scanTimer !== null) {
        clearTimeout(_scanTimer);
        _scanTimer = null;
      }
      
      options.success(_masterDevices);
    }

    /**
     * Stops any timeouts, and invokes the options.onFailure method.
     * @param {Error} errorModel the model with the error data in it.
     */
    function _onMethodFailure(errorModel) {
      // clear the internal timer
      if (_scanTimer !== null) {
        clearTimeout(_scanTimer);
        _scanTimer = null;
      }

      options.error(errorModel);
    };


    /* RUN THIS METHOD */
    _run();
  };
  
  return ScanPlugin;
});