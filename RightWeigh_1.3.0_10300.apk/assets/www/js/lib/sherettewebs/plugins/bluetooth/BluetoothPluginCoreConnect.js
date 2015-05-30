define([
  'sherettewebs',
  'ErrorModel'
], function(SheretteWebs, ErrorModel){
  var ConnectPlugin = function(deviceAddress, options){
    var _this = this,
        _action = 'Connect',
        _timeoutTimer = null;
    
    function _run(){
      _init();
      
      if (bluetoothle && bluetoothle.hasOwnProperty("initialize")) {
        bluetoothle.initialize(
          // success
          function() { 
            bluetoothle.connect(_onConnecting, _onConnectFailure, {
              // params
              address: deviceAddress
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
      options = SheretteWebs.Util.mergeOptions(_this.connectOptions, options);
      _startTimeout();
    };
    
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
    }
    
    
    /**
     * On the event that the device is trying to connect to a bluetooth device.
     * @param {PlainObject} response the response from trying to connect to the device.
     */
    function _onConnecting(response){
      // response should be formatted such as:
      // {"status":"connecting","address":"01:23:45:67:89:AB","name":"Polar H7"};
      // {"status":"connected","address":"01:23:45:67:89:AB","name":"Polar H7"};
      // {"status":"disconnecting","address":"01:23:45:67:89:AB","name":"Polar H7"};
      // {"status":"disconnected","address":"01:23:45:67:89:AB","name":"Polar H7"};
      if(response.hasOwnProperty("status")){        
        switch(response.status){
          case "connected":
            // perform a look up of servcies, characteristics, and descriptors
            _this.discoverServices({
              success: function(){
                _onMethodSuccess();
              },
              
              error: function(errorModel){
                _onMethodError(errorModel);
              },
              
              deviceAddress: deviceAddress
            });
            
            break;

          case "disconnected":
            _stopTimeout();
            //options.onLostConnection();
            
            // close
            bluetoothle.close(
              function(){
                window.showDebugMessage('onConnecting Close Success');
                options.onLostConnection();
              },
              function(response){
                window.showDebugMessage('Close Failed: ' + response.message);
                options.onLostConnection();
              },
              
              // close params
              {
                address: deviceAddress
              }
            );
    
            break;
        }
      }else{
        _onMethodFailure(new ErrorModel("Unkown Connection Status"));
      }
    }
    
    function _onConnectFailure(response){
      response = response || {};
      
       //_onMethodFailure(new ErrorModel('Could not connect. Your device is turned off or out of range.'));
      // must disconnect from the connection
      bluetoothle.disconnect(
        //success
        function(response){
          // must check for 'disconnected' status
          if(response.status === 'disconnected'){
            window.setTimeout(function(){
              bluetoothle.close(
                // close success
                function(response){
                  _onMethodFailure(new ErrorModel('Could not connect. Your device is turned off or out of range.'));
                }, // end close success
                
                // close failure
                function(response){
                  _onMethodFailure(new ErrorModel('Could not connect. Your device is turned off or out of range.'));
                },//end close failure
                        
                // close params
                {
                  address: deviceAddress
                }
              );// end close
            }, 1000);//end close wait
          }//end disconnected status
        },//end disconnect success
        
        // error
        function(response){
          _onMethodFailure(new ErrorModel('Could not disconnect. Your device is turned off or out of range.'));
        }, // end disconnect failure
        
        // params
        {
          address: deviceAddress
        }
      );//end disconnect
      
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
      window.showDebugMessage("connect failure: " + errorModel.message);
      _stopTimeout();
      options.error(errorModel);
    };
    
    /* RUN THIS METHOD */
    _run();
  };
  
  return ConnectPlugin;
});