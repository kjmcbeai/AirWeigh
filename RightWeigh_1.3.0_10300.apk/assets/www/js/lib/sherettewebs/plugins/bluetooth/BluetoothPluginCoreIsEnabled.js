define([
  'sherettewebs',
  'ErrorModel'
], function(SheretteWebs, ErrorModel){
  var BluetoothPluginStandardIsEnabled = function(options){
    var _this   = this,
        _action = "BluetoothEnabled",
        _timeoutTimer;

    function _run(){
      _init();
      
      if (bluetoothle && bluetoothle.hasOwnProperty("initialize")) {
        bluetoothle.initialize(
          // initialize success
          function() {
            _onMethodSuccess();
          },
          // initialize failure
          function() {
            _onMethodFailure(new ErrorModel("Bluetooth turned off on your device."));
          },
          
          //initialize params
          {
            request: false
          }
        );
      // plugin not installed 
      }else {
        _onMethodFailure(new ErrorModel("Bluetooth feature not installed in this app."));
      }
    };
    
    function _init(){
      options = SheretteWebs.Util.mergeOptions(_this.isEnabledOptions, options);
    }
    
    /**
     * The event that this method was successful. calls _options.success method.
     * @param {Mixed} successParams the params to send to the options.success method.
     */
    function _onMethodSuccess(successParams) {
      options.success(successParams);
    }

    /**
     * Stops any timeouts, and invokes the options.error method.
     * @param {Error} errorModel the model with the error data in it.
     */
    function _onMethodFailure(errorModel) {
      options.error(errorModel);
    };
    
    /* RUN THIS METHOD */
    _run();
  };
  
  return BluetoothPluginStandardIsEnabled;
});