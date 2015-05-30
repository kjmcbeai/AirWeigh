define([
  'sherettewebs',
  'ErrorModel'
], function(SheretteWebs, ErrorModel){
  /**
   * Disconnects the user from the currently connected bluetooth device.
   * @param {PlainObject} options the options for the disconnect process.
   * @see BluetoothPluginAbstract.disconnectOptions for more details.
   */
  var DisconnectPlugin = function(options){
    var _this = this,
        _timeoutTimer = null,
        _action = 'Disconnect';

    function _run(){
      _init();

      if (bluetoothle && bluetoothle.hasOwnProperty("initialize")) {
        bluetoothle.initialize(
          function() {
            _startTimeout();
            
            bluetoothle.disconnect(function(response){
              response = response || {};
              
              if(response.status === 'disconnected'){
                //_onMethodSuccess();
                bluetoothle.close(function(response){
                  response = response || {};
                  
                  if(response.status === "closed"){
                    // success
                    _onMethodSuccess();
                  }else{
                    _onMethodFailure(new ErrorModel('Unknown close status.'));
                  }
                }, 
                // error callback
                function(){
                  _onMethodFailure(new ErrorModel('Failed to close device.'));
                },
                // close params
                {
                  address: options.deviceAddress 
                });//--end /bluetoothle.close/
              }else if(response.status === 'disconnecting'){
                //window.showDebugMessage('Disconnecting....');
              }else{
                _onMethodFailure(new ErrorModel('Unknown disconnect status: ' + response.status));
              }
            },
            // error callback
            function(response){
              //alert("Disconnect Failure Plugin");
              _onMethodFailure(new ErrorModel("Failed to disconnect", response.message));
            },
            // disconnect params
            {
              address: options.deviceAddress
            });//--end /bluetoothle.disconnect/
          },
          // initialize failure
          function() {
            _onMethodFailure(new ErrorModel("Bluetooth turned off on your device."));
          },
          // initialize param
          {
            request: false
          }
        );
      } else {
        _onMethodFailure(new ErrorModel("Bluetooth feature not installed in this app."));
      }//--end if-else initilaized
    };//--end /_run/
    
    function _init(){
      options = SheretteWebs.Util.mergeOptions(_this.disconnectOptions, options);
    };
    
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
    };
    
    
    /* RUN THIS METHOD */
    _run();
  };
  
  return DisconnectPlugin;
});