define([
  'underscore',
  'backbone',
  'ErrorModel',
  'AppController',
  'BluetoothFactory',
  'models/bluetooth/BluetoothCharacteristicModel',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginUtil',
  'require'
], function(_, Backbone, ErrorModel, AppController, BluetoothFactory, BluetoothCharacteristicModel, BluetoothPluginUtil, require){
  var TruckAxleModel = Backbone.Model.extend({
    defaults: {
      id            : null,
      name          : '',
      weight        : 0,
      alertWeight   : "",
      warningWeight : "",
      enum          : 0,
      weightUuid    : null,
      nameUuid      : null
    },
    
    ENUM_NAMES: [
      "Not Configured",
      "Axle 1",
      "Axle 2",
      "Axle 3",
      "Axle 4",
      "Estimated Steer Axle",
      "Measured Steer Axle",
      "Drive Axle",
      "Trailer A",
      "Trailer B",
      "Cal Config 1",
      "Cal Config 2"
    ],
    
    initialize: function(){
      AppController = require('AppController');
      
      if(this.get("id") === null){
        this.set('id', this.cid);
      }
    },
    
    /**
     * Fetches configuration properties for the truck axle.
     * Use this method for initial reading/syncing data.
     * @param {PlainObject} options options for the fetch method.
     * options = {
     *   success: function(truckAxleModel, response, options){
     *     alert("Read successful.");
     *   },
     *   
     *   error: function(truckAxleModel, response, options){
     *     alert("Error: " + response.msg);
     *   },
     *   
     *   serviceUuid: "0f9652d2-b1f3-43ff-94bc-2b30d95c5d24", // the serviceUuid used for axle bluetooth fetching
     *   
     *   deviceAddress: "00:07:80:72:BE:00", // address for the device with this axle data
     *   
     *   inDemoMode: false // whether or not to simulate the data
     * };
     * @throws {ErrorModel} Error when serviceUuid or deviceUuid isn't specified in options (ErrorModel.CODE_MAP.MISSING_ARGUMENT).
     */
    fetchConfig: function(options){
      var bluetoothPlugin = BluetoothFactory.getInstance(),
          that = this,
          bluetoothCharacteristicModel = null,
          success;

      options = options || {};
      
      success = options.success;
      
      // make sure required options are available
      if(!options.deviceAddress){
        throw new ErrorModel("deviceAddress not found as option in TruckAxleModel.", ErrorModel.CODE_MAP.MISSING_ARGUMENT);
      }
      if(!options.serviceUuid){
        throw new ErrorModel("serviceUuid not found as option in TruckAxleModel.", ErrorModel.CODE_MAP.MISSING_ARGUMENT);
      }
      
      if(options.hasOwnProperty("inDemoMode") && options.inDemoMode === true){
        this.runFetchConfigDemo(options);
        // prevent further execution
        return;
      }
      
      // begin the reading of the characteristic enum
      bluetoothCharacteristicModel = new BluetoothCharacteristicModel({
        serviceUuid        : options.serviceUuid,
        characteristicUuid : this.get("nameUuid"),
        type               : BluetoothPluginUtil.CHARACTERISTIC_VALUE_TYPES.INT,
        value              : 0,
        endianType         : BluetoothPluginUtil.ENDIAN_TYPES.BIG_ENDIAN
      });
      
      // read the enumName characteristic
      bluetoothPlugin.read(bluetoothCharacteristicModel, {
        success: function(characteristicModel){
          that.set("enum", characteristicModel.get("value"));
          // set the name of the axle as the mapped name for the enum value found, unless it already has a name saved from previous build
          if(that.get("name") === ""){
            that.set("name", that.ENUM_NAMES[that.get("enum")]);
          }
          
          options.success = true;
          if(success){
            success(that, {msg: "Axle name read successful."}, options);
          }
        },
        
        error: function(errorModel){
          options.success = false;
          if(options.error){
            options.error(that, {msg: "Failed to read axle name/enum."}, options);
          }
        },
        
        deviceAddress: options.deviceAddress
      });
    },
    
    /**
     * Fetches data from the bluetooth device for the truck axle.
     * @param {PlainObject} options the options for the fetch method.
     * options = {
     *   success: function(truckAxleModel, response, options){
     *     alert("Read successful.");
     *   },
     *   
     *   error: function(truckAxleModel, response, options){
     *     alert("Error: " + response.msg);
     *   },
     *   
     *   serviceUuid: "0f9652d2-b1f3-43ff-94bc-2b30d95c5d24",
     *   
     *   deviceAddress: "00:07:80:72:BE:00"
     * };
     * @throws {ErrorModel} Error when serviceUuid isn't specified in options (ErrorModel.CODE_MAP.MISSING_ARGUMENT).
     */
    fetch: function(options){
      var bluetoothPlugin = BluetoothFactory.getInstance(),
          that = this,
          bluetoothCharacteristicModel = null,
          success;
      
      options = options || {};

      // check if in configMode
      if(options.configMode === true){
        this.fetchConfig(options);
        // prevent further execution (running in config mode instead of regular fetch
        return;
      }
      
      success = options.success;
      
      // make sure device address exists
      if(options.deviceAddress === undefined){
        throw new ErrorModel("Device Address Undefined for options.deviceAddress in TruckAxleModel.");
      }
      
      // simulate data if in demo mode
      if(options.hasOwnProperty('inDemoMode') && options.inDemoMode === true){
        this.runFetchDemo(options);
        return;
      }
      
      if(!options.serviceUuid){
        options.success = false;
        options.error(that, ErrorModel('options.serviceUuid is missing', ErrorModel.CODE_MAP.MISSING_ARGUMENT), options);
      }
      
      // setup a bluetoothCharacteristicModel to read from
      bluetoothCharacteristicModel = new BluetoothCharacteristicModel({
        serviceUuid: options.serviceUuid,
        characteristicUuid: that.get('weightUuid'),
        type: BluetoothPluginUtil.CHARACTERISTIC_VALUE_TYPES.INT,
        endianType: BluetoothPluginUtil.ENDIAN_TYPES.BIG_ENDIAN,
        value: 0
      });
      
      bluetoothPlugin.read(bluetoothCharacteristicModel, {
        success: function(bluetoothCharacteristicModel){
          options.success = true;
          
          that.set('weight', Number(bluetoothCharacteristicModel.get('value')));
          if(success){
            success(that, {code: ErrorModel.CODE_MAP.OK, msg: 'Success'}, options);
          }
        },
        
        error: function(errorModel){
          options.success = false;
          options.error(that, {msg: errorModel.message}, options);
        },
        
        deviceAddress: options.deviceAddress
      });
    }
  });//--end TruckAxleModel
  
  /**
   * Runs a dummy/demo case of the fetch method. Used when testing out the axle fetch model without bluetooth connectivity.
   * @param {PlainObject} options the options provided by fetch. See fetch for more details.
  */
  TruckAxleModel.prototype.runFetchDemo = function(options){
    var that = this,
        success;

    options = options || {};
    success = options.success;

    // simulate wait for server response with a timeout
    window.setTimeout(function(){
      that.set('weight', Number(Math.floor(Math.random(0.75, 1) * 1000)));
      options.success = true;

      if (success){
        success(that, {msg: 'Data fetched successfully.', code: ErrorModel.CODE_MAP.OK}, options);
      }
    }, 1000);
  };//--end /runFetchDemo/
  
  /**
   * Runs a demo of the fetch config operation.
   * @param {PlainObject} options the options for the fetch. See fetchConfig for more details.
   */
  TruckAxleModel.prototype.runFetchConfigDemo = function(options){
    var that = this,
        success;

    options = options || {};
    success = options.success;
    
    // simulate the wait process
    window.setTimeout(function(){
      that.set("enum", Number(Math.floor(Math.random(0, 1) * 11)));
      // need to setup initial name for axle based on enum
      
      // only set name to enum value if one wasnt already saved prior
      if(that.get("name") === ""){
        that.set("name", that.ENUM_NAMES[that.get("enum")]);
      }
      
      options.success = true;
      
      if(success){
        success(that, {msg: 'Data fetched successfully.', code: ErrorModel.CODE_MAP.OK}, options);
      }
    }, 1000);
  };//--end /runFetchConfigDemo/
  
  /**
   * @returns {String} the weight in a string representation (example: 1200.56 will be returned as 1,200).
   */
  TruckAxleModel.prototype.getWeightString = function(){
    return AppController.toIntString(AppController.convertWeight(this.get("weight")));
  };
  
  
  // return the class
  return TruckAxleModel;
});