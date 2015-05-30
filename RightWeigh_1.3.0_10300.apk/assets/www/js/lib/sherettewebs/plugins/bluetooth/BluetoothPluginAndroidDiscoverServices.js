define([
  'sherettewebs',
  'ErrorModel'
], function(SheretteWebs, ErrorModel){
  var DiscoverServicesPlugin = function(options){
    var _this = this,
        _action = "Discover Services",
        _timeoutTimer = null;

    function _init(){
      options = options || {};
      
      if(!options.deviceAddress){
        throw new Error("Discover Services: options.deviceAddress is undefined.");
      }
      
      _startTimeout();
    }

    function _run(){
      _init();
      
      if(bluetoothle && bluetoothle.initialize){
        bluetoothle.isDiscovered(
          // success
          function(response){
            response = response || {};
            if(response.isDiscovered === undefined){
              _onMethodFailure(new ErrorModel("isDiscovered Undefined."));
              // prevent further execution
              return;
            }

            if(response.isDiscovered){
              _onMethodSuccess();
              // prevent further execution
              return;
            }

            // need to discover services, characteristics, and descriptors
            bluetoothle.discover(
              // success
              function(response){
                response = response || {};
                
                if(response.status && response.status === 'discovered'){
                   _onMethodSuccess();
                }else{
                  // error
                  _onMethodFailure(new ErrorModel("Invalid response from bluetooth discovery."));
                }//--end if-else discovered status
              },
              
              // discover error
              function(response){
                _onMethodFailure(new ErrorModel("Failed to discover services."));
              },
              
              // discover params
              {
                address: options.deviceAddress
              }
            );//--end discover
          },
          
          // isDiscovered params
          {
            address: options.deviceAddress
          }
        );//--end isDiscovered
      }else{
        _onMethodFailure(new ErrorModel("Bluetooth feature not installed in this app."));
      }
    }//--end _run
    
    /**
     * Starts the timeout timer.
     */
    function _startTimeout(){
      //_timeoutTimer = window.setTimeout(_onTimeout, options.timeoutLength);
      _timeoutTimer = window.setTimeout(_onTimeout, 10000); // ten seconds
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
      _onConnectFailure({
        
      });
      //_onMethodFailure(new ErrorModel('Could not connect. Your device is turned off or out of range.'));
      //_onMethodFailure(new ErrorModel('Could not connect. Your device is turned off or out of range.'));
      //_disconnect();
    }
    
    
    /**
     * The event that this method was successful. calls _options.success method.
     */
    function _onMethodSuccess() {
      _stopTimeout();
      options.success();
    }

    /**
     * Stops any timeouts, and invokes the options.error method.
     * @param {Error} errorModel the model with the error data in it.
     */
    function _onMethodFailure(errorModel) {
      _stopTimeout();
      options.error(errorModel);
    };
    
    /* run this method */
    _run();
  };
  
  return DiscoverServicesPlugin;
});