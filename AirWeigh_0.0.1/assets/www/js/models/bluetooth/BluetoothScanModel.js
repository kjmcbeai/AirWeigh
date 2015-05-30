define([
  'underscore',
  'backbone',
  'AppController',
  'BluetoothDeviceModel',
  'BluetoothDeviceCollection',
  'ErrorModel',
  'BluetoothFactory'
], function(_, Backbone, AppController, BluetoothDeviceModel, BluetoothDeviceCollection, ErrorModel, BluetoothFactory){
  var BluetoothScanModel = Backbone.Model.extend({  
    defaults: {
      devices: null
    },
    
    /**
     * The time to wait before timing out from the /fetch/ method.
     */
    timeoutLength: 10000,
    
    /**
     * Timer for fetch timeouts.
     */
    timeoutTimer: null,
    
    /**
     * Whether or not the model is currently trying to load data from a fetch call.
     */
    loadingData: false,
    
    initialize: function(){
      this.set('devices', new BluetoothDeviceCollection());
    },
    
    /**
     * Fetches/Scans for bluetooth BluetoothScanModel.devices.
     * @param {PlainObject} options the options for the fetch method.
     * Options Allowed:
     * options = {
     *   success    : function(model, response, options){}, // the function that will be called if the fetch call was successful
     *   error      : function(model, response, options){}, // the function to call if there was an error
     *   inDemoMode : true, // true if you want to use dummy data, false or not specified to fetch real data from available bluetooth luetoothBluetoothScanModel.devices
     *   testFailure: false, // set to true if you want to have the fetch fail to test failing cases
     *   testTimeout: false // set to true to test out if there is a timeout, overrides testFailure.
     * }
     */
    fetch: function(options){
      var that     = this,
          options  = options ? _.clone(options) : {},
          success  = options.success,
          bluetoothPlugin = null;
  
      this._startFetchLoading(options);

      // load up dummy data if this is a demo, otherwise fetch data from bluetooth device
      if(options.hasOwnProperty('inDemoMode') && options.inDemoMode === true){
        this._runDemoModeFetch(options);
      }else{
        // fetch via bluetooth, this is the non demo fetch and will be used in production
        bluetoothPlugin = BluetoothFactory.getInstance();
        bluetoothPlugin.scan({
          success: function(bluetoothBluetoothDeviceCollection){
            // request has been completed, so stop fetch loading
            options.success = true;
            
            that._stopFetchLoading();
            that.set('devices', bluetoothBluetoothDeviceCollection);
            
            // force the change event if there wasnt an update, this call loads and must be stopped
            if(that.hasChanged() === false){
              that.trigger('change');
            }
            
            if(success){
              success(that, {code: ErrorModel.CODE_MAP.OK, msg: 'Success'}, options);
            }
          },
          
          error: function(errorModel){
            that._stopFetchLoading();
            options.success = false;
            options.error(that, {msg: errorModel.message, code: ErrorModel.CODE_MAP.INTERNAL_SERVER_ERROR}, options);
          },
          
          timeoutLength: 5000
        });
      }
    }, //--End /fetch/
    
    /**
     * Start/Configures the loading of the fetch data process, should not be called directly.
     * @param {type} options the options used in the /fetch/ method.
     */
    _startFetchLoading: function(options){
      var that = this;
      
      this.loadingData = true;
      
      // setup timeout for not fetching data from scan
      this.timeoutTimer = window.setTimeout(function(){
        if(that.loadingData === true){
          // timeout error
          that._stopFetchLoading();
          options.error(that, {code: ErrorModel.CODE_MAP.REQUEST_TIMEOUT, msg: 'Scan Timeout'});
        }else{
          AppController.showDebugMessage("BluetoothScanModel Problem");
        }
      }, this.timeoutLength);
    }, //--End /_startFetchLoading/
    
    
    /**
     * Stops the timeout and sets the loadingData flag to false.
     */
    _stopFetchLoading: function(){
      window.clearTimeout(this.timeoutTimer);
      this.loadingData = false;
    }, //--End /_stopFetchLoading/
    
    
    /**
     * Runs the fetch call in demo mode. Should not be called directly, but set inDemoMode to true in options for the fetch call.
     * @param {PlainObject} options the options for the fetch call.
     */
    _runDemoModeFetch: function(options){
      var success  = options.success;
      
      if(options.hasOwnProperty('testTimeout') && options.testTimeout === true){
        // allow the timeout to happen
        return;
      }
      
      //fetch by dummy data, simulate time for fetching data by using timeout
      window.setTimeout.call(this, function() {
        // request completed, so stop fetch loading
        this._stopFetchLoading();
        
        // perform dummy test failure test
        if (options.hasOwnProperty('testFailure') && options.testFailure === true) {
          options.success = false;
          options.error(this, {code: ErrorModel.CODE_MAP.INTERNAL_SERVER_ERROR, msg: 'Failed to fetch data.'}, options);
        } else {
          // peform dummy success test
          this._addDummyData();
          options.success = true;
          if (success) {
            success(this, {code: ErrorModel.CODE_MAP.OK, msg: 'Success'}, options);
          }
        }
      }, 2000);
    }, //--End /_runDemoModeFetch/
    
    
    /**
     * Adds dummy data to the bluetooth device collection (devices) in this model.
     */
    _addDummyData: function(){ 
      var devices = new BluetoothDeviceCollection();
      
      devices.push(new BluetoothDeviceModel({
        id      : 1,
        name    : 'RWLS-F2:CC:44:21:24:J1',
        address : '24:21:80:72:B2:L4'
      }));
      
      devices.push(new BluetoothDeviceModel({
        id      : 2,
        name    : 'RWLS-A2:N1:55:22:11:2D',
        address : '10:21:B2:L1:76:A0'
      }));
      
      devices.push(new BluetoothDeviceModel({
        id      : 3,
        name    : 'RWLS-L2:4R:B2:L2:00:A2',
        address : '00:02:A4:33:75:B7'
      }));
      
      devices.push(new BluetoothDeviceModel({
        id      : 4,
        name    : 'RWLS-21:A2:24:AD:64:L1',
        address : '02:C2:54:82:U7:J3'
      }));
      
      devices.push(new BluetoothDeviceModel({
        id      : 5,
        name    : 'RWLS-F6:2A:41:66:F2:L9',
        address : '05:C2:54:82:U7:B2'
      }));
      
      devices.push(new BluetoothDeviceModel({
        id      : 6,
        name    : 'RWLS-D2:E3:4B:L2:7C:5R',
        address : '0L:C6:AS:42:U2:L1'
      }));
      
      this.set('devices', devices);
    } //--End /_addDummyData/
  }); //--End BluetoothScanModel creation
  
  return BluetoothScanModel;
});