/**
 * TruckDeviceModel - Model in charge of truck related data that deals with a single bluetooth device.
 */
define([
  'underscore',
  'backbone',
  'BluetoothDeviceModel',
  'models/truck/TruckWeightModel',
  'BluetoothFactory',
  'models/bluetooth/BluetoothCharacteristicModel',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginUtil'
], function(_, Backbone, BluetoothDeviceModel, TruckWeightModel, BluetoothFactory, BluetoothCharacteristicModel, BluetoothPluginUtil){
  var SERVICE_UUID = "180A",
      FIRMWARE_CHAR_UUID = "2A26",
      TruckDeviceModel;
  
  TruckDeviceModel = Backbone.Model.extend({
    defaults: {
      id: null,
      bluetoothDeviceModel: null,
      truckWeightModel: null,
      name: '',
      firmwareVersion: 0.0
    },
    
    initialize: function(options){
      options = options || {};
    
      if(this.get("id") === null){
        this.set('id', this.cid);
      }
      
      
      if(options.bluetoothDeviceModel){
        if(options.bluetoothDeviceModel.attributes){
          this.set("bluetoothDeviceModel", new BluetoothDeviceModel(options.bluetoothDeviceModel.attributes));
        }else{
          this.set("bluetoothDeviceModel", new BluetoothDeviceModel(options.bluetoothDeviceModel));
        }
      }else{
        this.set("bluetoothDeviceModel", new BluetoothDeviceModel());
      }
      
      if(options.truckWeightModel){
        if(options.truckWeightModel.attributes){
          this.set("truckWeightModel", new TruckWeightModel(options.truckWeightModel.attributes));
        }else{
          this.set("truckWeightModel", new TruckWeightModel(options.truckWeightModel));
        }
      }else{
        this.set("truckWeightModel", new TruckWeightModel());
      }
      
      // add event listeners
      //this.get('truckWeightModel').bind('fetchCompleted', this.onTruckWeightFetchCompleted, this);
    },
    
    unbind: function(){
      // call main unbind
      Backbone.Model.prototype.unbind.apply(this, arguments);
      
      // unbind truckWeightModel
      this.get('truckWeightModel').unbind();
    },
    
    
    /**
     * Fetches this models data.
     * @param {PlainObject} options the options for this fetch method.
     * var options = {
     *  success: function(){
     *  
     *  },
     *  
     *  error: function(){
     *  
     *  },
     *  
     *  inDemoMode: false,
     *  deviceAddress: "A2:21:45:L2:00:A2",
     *  configMode: false
     * };
     */
    fetch: function(options){
      options = options || {};
      
      if(options.configMode){
        // fetch firmware version before fetching truckWeight data
        this.fetchConfigMode(options);
      }else{
        this.fetchTruckWeight(options);
      }
    }, //--end /fetch/
    
    
    /**
     * Fetches all configuration model data.
     * @param {PlainObject} options the options for this fetch method.
     * var options = {
     *  success: function(){
     *  
     *  },
     *  
     *  error: function(){
     *  
     *  },
     *  
     *  inDemoMode: false,
     *  deviceAddress: "A2:21:45:L2:00:A2",
     *  configMode: false
     * };
     */
    fetchConfigMode: function(options){
      var that = this,
          deviceAddress = this.get("bluetoothDeviceModel").get("address"),
          success,
          bluetoothPlugin = BluetoothFactory.getInstance(),
          bluetoothCharacteristicModel;

      options = options || {};
      success = options.success;
      
      // FETCH FIRMWARE VERSION
      // check if in demo mode
      if(options.inDemoMode){
        this.set("firmwareVersion", "1.0");
        this.fetchTruckWeight(options);
        // prevent further execution
        return;
      }
      
      bluetoothCharacteristicModel = new BluetoothCharacteristicModel({
        serviceUuid: SERVICE_UUID,
        characteristicUuid: FIRMWARE_CHAR_UUID,
        type: BluetoothPluginUtil.CHARACTERISTIC_VALUE_TYPES.STRING,
        value: "0.0",
        endianType: BluetoothPluginUtil.ENDIAN_TYPES.BIG_ENDIAN
      });
      bluetoothPlugin.read(bluetoothCharacteristicModel, {
        success: function(characteristicModel){
          that.set("firmwareVersion", characteristicModel.get("value"));
          
          // now finish fetching truckweight data
          that.fetchTruckWeight(options);
        },
        
        error: function(errorModel){
          that.set("firmwareVersion", 0.0);
          options.success = false;
          options.error(that, errorModel, options);
        },
        
        deviceAddress: deviceAddress
      });
    },
    
    
    /**
     * Fetches just the truck weight model.
     * @param {PlainObject} options the options for this fetch method.
     * var options = {
     *  success: function(){
     *  
     *  },
     *  
     *  error: function(){
     *  
     *  },
     *  
     *  inDemoMode: false,
     *  deviceAddress: "A2:21:45:L2:00:A2",
     *  configMode: false
     * };
     */
    fetchTruckWeight: function(options){
      var that = this,
          deviceAddress = this.get("bluetoothDeviceModel").get("address"),
          success;
  
      options = options || {};
      success = options.success;
      
      // fetch data for truckweight model
      this.get("truckWeightModel").fetch({
        success: function(truckWeightModel, response, roptions){
          options.success = true;
          success(that, response, options);
        },
        
        error: function(truckWeightModel, response, roptions){
          options.success = false;
          options.error(that, response, options);
        },
        
        inDemoMode: options.inDemoMode,
        
        deviceAddress: deviceAddress,
        
        configMode: options.configMode
      });
    }
  });//--end TruckDeviceModel Class
  
  /**
   * Resets the weight for the this.truckWeightModel.
   */
  TruckDeviceModel.prototype.resetWeight = function(){
    this.get("truckWeightModel").resetWeight();
  };
  
  /**
   * @returns {Number} the number of axles associated to this truck device.
   */
  TruckDeviceModel.prototype.getNumOfAxles = function(){
    return this.get("truckWeightModel").getNumOfAxles();
  };
  
  return TruckDeviceModel;
});