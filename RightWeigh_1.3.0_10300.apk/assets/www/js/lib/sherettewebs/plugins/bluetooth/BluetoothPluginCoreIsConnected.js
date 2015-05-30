define([
  'sherettewebs',
  'ErrorModel'
], function(SheretteWebs, ErrorModel){
  var IsConnectedPlugin = function(deviceAddress, options){
    var _this = this,
        _action = 'IsConnected',
        _timeoutTimer = null;
    
    function _run(){
      _init();

      if (bluetoothle && bluetoothle.hasOwnProperty("initialize")) {
        bluetoothle.initialize(
          function() {
            _startTimeout();
            
            bluetoothle.isConnected(function(response){
              var isConnectedResponse = response.isConnected,
                  deviceType = (window.device && window.device.platform) ? device.platform : "android";
              
              // IOS has issues with isConnected and always returning false when its actually connected.
              // make sure type is lowercase to prevent any varied formats during check
              deviceType = deviceType.toLowerCase();
              
              if(deviceType === "ios" && isConnectedResponse !== undefined){
                isConnectedResponse = true;
              }
      
              _onMethodSuccess(isConnectedResponse);   
            },
            // params
            {
              'address': deviceAddress
            });
          },
          // initialize error
          function() {
            _onMethodFailure(new ErrorModel("Bluetooth turned off on your device."));
          },
          // initialize params
          {
            request: false
          }
        );
      } else {
        _onMethodFailure(new ErrorModel("Bluetooth feature not installed in this app."));
      }
    };
    
    function _init(){
      options = SheretteWebs.Util.mergeOptions(_this.isConnectedOptions, options);
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
  
  return IsConnectedPlugin;
});