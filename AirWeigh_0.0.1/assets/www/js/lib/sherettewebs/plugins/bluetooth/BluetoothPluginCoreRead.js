define([
  'sherettewebs',
  'ErrorModel',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginUtil'
], function(SheretteWebs, ErrorModel, BluetoothPluginUtil){
  var ReadPlugin = function(bluetoothCharacteristicModel, options){
    var _this         = this,
        _action       = 'Read', // the action this plugin is doing
        _timeoutTimer = null;
    
    function _run(){
      _init();
      
      if (bluetoothle && bluetoothle.hasOwnProperty("initialize")) {
        bluetoothle.initialize(
          // initialize success
          function() {
            _startTimeout();
            _readCharacteristic();
          },
          // initialize failure
          function() {
            _onMethodFailure(new ErrorModel("Bluetooth not initialized"));
          },
          // initialize params
          {
            request: false
          }
        );
      } else {
        // bluetooth plugin not available
        _onMethodFailure(new ErrorModel("Bluetooth feature not installed in this app."));
      }
    }
    
    function _init(){
      options = SheretteWebs.Util.mergeOptions(_this.readOptions, options);
      
      if(!bluetoothCharacteristicModel){
        alert('bluetoothCharacteristicModel must be specified.');
      }
      
      if(options.deviceAddress === undefined){
        alert("options.deviceAddress undefined");
      }
    }
    
    function _readCharacteristic(){
      bluetoothle.read(
        // read success
        function(response){
          var value = null;
          
          response = response || {};
          
          // success
          if(response.status === 'read'){
            // convert the data to the proper value and set the value to the characteristicModel
            value = BluetoothPluginUtil.convertValue(response.value, bluetoothCharacteristicModel.get('type'), bluetoothCharacteristicModel.get('endianType'));
            bluetoothCharacteristicModel.set('value', value);
            _onMethodSuccess(bluetoothCharacteristicModel);
          }else{
            // unknown status
            _onMethodFailure(new ErrorModel('Unknown read status.'));
          }
        },
        // read error
        function(response){
          // failure
          _onMethodFailure(new ErrorModel('Failed to read data from device. Msg: ' + response.message + ' Error: ' + response.error));
        },
        // read params
        {
          'address'            : options.deviceAddress,
          'serviceUuid'        : bluetoothCharacteristicModel.get('serviceUuid'),
          'characteristicUuid' : bluetoothCharacteristicModel.get('characteristicUuid')
        }
      );
    }
    
    /**
     * Starts the timeout timer.
     */
    function _startTimeout(){
      _timeoutTimer = window.setTimeout(_onTimeout, options.timeoutLength);
    }
    
    /**
     * Stops/clears the timeout timer.
     */
    function _stopTimeout(){
      // clear the internal timer
      if (_timeoutTimer !== null) {
        window.clearTimeout(_timeoutTimer);
        _timeoutTimer = null;
      }
    }
    
    /**
     * The event that the action was timed out.
     */
    function _onTimeout(){
      _stopTimeout();
      _onMethodFailure(new ErrorModel(_action + ' Timeout', ErrorModel.CODE_MAP.REQUEST_TIMEOUT));
    }
    
    /**
     * The event that this method was successful. calls _options.success method.
     * @param {Mixed} successParams the params to send to the options.success method.
     */
    function _onMethodSuccess(successParams) {
      // clear the internal timer
      _stopTimeout();
      options.success(successParams);
    }

    /**
     * Stops any timeouts, and invokes the options.error method.
     * @param {Error} errorModel the model with the error data in it.
     */
    function _onMethodFailure(errorModel) {
      _stopTimeout();

      options.error(errorModel);
    }
    
    /* RUN THIS METHOD */
    _run();
  };
  
  return ReadPlugin;
});