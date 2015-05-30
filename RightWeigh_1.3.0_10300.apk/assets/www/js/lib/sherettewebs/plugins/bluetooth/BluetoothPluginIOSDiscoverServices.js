define([
  'sherettewebs',
  'ErrorModel'
], function(SheretteWebs, ErrorModel){
  var DiscoverServicesPlugin = function(options){
    var _this = this,
        _action = "Discover Services",
        _serviceUuids = [],
        _characteristicUuids = [],
        _curServiceIndex,
        _curServiceUuid,
        _curCharacteristicUuids,
        _curCharacteristicIndex,
        _serviceMap = {},
        _timeoutTimer = null;

    function _init(){
      options = options || {};
      
      if(!options.deviceAddress){
        throw new Error("Discover Services: options.deviceAddress is undefined.");
      }
    }

    function _run(){
      _init();
      
      if(bluetoothle && bluetoothle.initialize){
        bluetoothle.services(
          // success
          function(response){
            _serviceUuids = response.serviceUuids;
            _curServiceIndex = 0;
            _readNextService();
          },
          
          //error
          function(response){
            _onMethodFailure(new ErrorModel(JSON.stringify(response)));
          },
          
          // params
          {
            address: options.deviceAddress
          }
        );//--end services
      }else{
        _onMethodFailure(new ErrorModel("Bluetooth feature not installed in this app."));
      }
    }//--end _run

    
    function _readNextService(){
      var serviceUuid,
          characteristicUuids;
      
      // check to see if there are no more services to read
      if(_curServiceIndex >= _serviceUuids.length){
        // completed entire reading sequence, call success
        _onMethodSuccess();
        
        // prevent further exectuion
        return;
      }
      
      _curServiceUuid = _serviceUuids[_curServiceIndex];
      
      _curCharacteristicUuids = [];
      
      bluetoothle.characteristics(
        // success
        function(response){
          // loop through all characterisitcs and add the uuid to an array for searching for
          for(var x = 0; x < response.characteristics.length; x+= 1){
            _curCharacteristicUuids.push(response.characteristics[x].characteristicUuid);
          }
          
          // read descriptor for these characteristics
          _curCharacteristicIndex = 0;
          _readNextCharacteristic();
        },
        
        // error
        function(response){
          // ignore for now
          _curServiceIndex+= 1;
          _readNextService();
        },
        
        // params
        {
          address: options.deviceAddress,
          serviceUuid: _curServiceUuid
        }
      );//--end characteristics
    }//--end readNextService
    
    
    function _readNextCharacteristic(){
      var characteristicUuid;
      
      // check if there if sequence has ended
      if(_curCharacteristicIndex >= _curCharacteristicUuids.length){
        // read sequence completed
        _curServiceIndex+= 1;
        _readNextService();
        
        // prevent further execution
        return;
      }
      
      characteristicUuid = _curCharacteristicUuids[_curCharacteristicIndex];
      
      bluetoothle.descriptors(
        // success
        function(response){          
          _curCharacteristicIndex+= 1;
          _readNextCharacteristic();
        },
        
        // error
        function(response){
          // ignore for now
          _curCharacteristicIndex+= 1;
          _readNextCharacteristic();
        },
        
        // params
        {
          address: options.deviceAddress,
          serviceUuid: _curServiceUuid,
          characteristicUuid: characteristicUuid
        }
      );//--end descxriptors
    }//--end readDescriptors
    
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