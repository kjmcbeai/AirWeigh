define([
  'underscore',
  'backbone',
  'collections/truck/TruckDeviceCollection',
  'models/truck/TruckDeviceModel',
  'AppController',
  'require'
], function(_, Backbone, TruckDeviceCollection, TruckDeviceModel, AppController, require){
  var MAX_WEIGHT_PER_AXLE_IN_LBS = 25000, // in lbs
      _nextTruckDeviceIndex = 0,
      _inFetchingMode = false, // whether or not fetching loop should continue or not
      _availableTruckConfigImages = [
        {
          imgSrc     : "img/truck-configurations/default.png",
          numOfAxles : 1
        },
        {
          imgSrc     : "img/truck-configurations/one-axle.png",
          numOfAxles : 1
        },
        {
          imgSrc     : "img/truck-configurations/one-axle-b.png",
          numOfAxles : 1
        },
        {
          imgSrc     : "img/truck-configurations/default.png",
          numOfAxles : 2
        },
        {
          imgSrc     : "img/truck-configurations/two-axle-front.png",
          numOfAxles : 2
        },
        {
          imgSrc     : "img/truck-configurations/two-axle-back.png",
          numOfAxles : 2
        },
        {
          imgSrc     : "img/truck-configurations/default.png",
          numOfAxles : 3
        },
        {
          imgSrc     : "img/truck-configurations/three-axle.png",
          numOfAxles : 3
        },
        {
          imgSrc     : "img/truck-configurations/default.png",
          numOfAxles : 4
        },        
        {
          imgSrc     : "img/truck-configurations/four-axle.png",
          numOfAxles : 4
        },
        {
          imgSrc     : "img/truck-configurations/default.png",
          numOfAxles : 5
        },
        {
          imgSrc     : "img/truck-configurations/five-axle.png",
          numOfAxles : 5
        }
      ],
      ProfileModel;
  
  ProfileModel = Backbone.Model.extend({
    defaults: {
      id                       : null,
      name                     : '',
      configImgUrl             : null,
      truckDevices             : null,
      unitMeasurement          : 'lbs',
      axleIdBeingEdited        : 0,
      truckDeviceIdBeingEdited : 0,
      totalWeightAlert         : "",
      totalWeightWarning       : ""
    },
    
    
    
    
    /**
     * Initializes this ProfileModel.
     */
    initialize: function(options){
      options = options || {};
      
      // deal with loading model data correctly
      if(options.truckDevices){
        // attributes will be available if this data is being cloned
        if(options.truckDevices.attributes){
          this.set("truckDevices", new TruckDeviceCollection(options.truckDevices.attributes));
        }else{
          this.set("truckDevices", new TruckDeviceCollection(options.truckDevices));
        }
      }else{
        this.set("truckDevices", new TruckDeviceCollection());
      }
      
      if(this.get("id") === null){
        this.set('id', this.cid);
      }
      
      AppController = require("AppController");
    },
    
    /**
     * Resets all the weight data for this profile's devices.
     */
    resetWeight: function(options){
      options = options || {};
      
      // reset all truckDevices
      this.get("truckDevices").each(function(truckDevice){ 
        if(options.bluetoothDeviceModel){
          // only reset the weight only for the truckDevice that has the same address as the specified option device address
          if(truckDevice.get("bluetoothDeviceModel").get("address") === options.bluetoothDeviceModel.get("address")){
            truckDevice.get("truckWeightModel").resetWeight();
          }
        }else{
          truckDevice.get("truckWeightModel").resetWeight();
        }
      });//--end foreach truckDevice
    },
    
    /**
     * Gets the total weight of all the devices of this profile.
     * @returns {Number} the calculated weight.
     */
    getTotalWeight: function(){
      var totalWeight = 0.0;
      this.get("truckDevices").each(function(truckDevice){
        totalWeight+= truckDevice.get("truckWeightModel").getTotalWeight();
      });
    
      return AppController.convertWeight(totalWeight, true);
    },
    
    /**
     * Gets the total weight as a string value associated to this profile.
     * @returns {String} the string representation of the total weight.
     */
    getTotalWeightString: function(){
      return AppController.toIntString(this.getTotalWeight());
    },

    /**
     * Starts a fetching loop for retrieving truck weight data.
     */
    startTruckFetchLoop: function(){
      _inFetchingMode       = true;
      _nextTruckDeviceIndex = 0;
      this._fetchNextTruckDevice({
        loop: true
      });
    },//--end /startTruckFetchLoop/
    
    /**
     * Stops the truck fetching loop.
     */
    stopTruckFetchLoop: function(){
      // makes it to _fetchNextTruckDevice stops its cycle,
      // and returns out of the recursion loop
      _inFetchingMode = false;
    },
    
    
    /**
     * Fetches the profile data once.
     * @param {PlainObject} options the option for the fetch method.
     * options = {
     *   success: function(profileModel, response, options){
     *     alert("Fetch completed.");
     *   },
     *   
     *   error: function(profileModel, response, options){
     *     alert("Error: " + response.msg);
     *   }
     * };
     */
    fetch: function(options){
      options = options || {};

      _inFetchingMode = true;
      _nextTruckDeviceIndex = 0;
      
      //  add loop: false flag so fetching only happens once
      options.loop = false;
      this._fetchNextTruckDevice(options);
    },
    
    /**
     * Fetchs the data for the next truck device (the next bluetooth device).
     * This method is meant to be used only internally, 
     * should call startTruckFetchLoop or fetch to fetch data.
     * @param {PlainObject} options the options used in the fetch method.
     */
    _fetchNextTruckDevice: function(options){
      var truckDevices = this.get("truckDevices"),
          that = this,
          truckDeviceModel,
          success;
  
      options = options || {};
      success = options.success;
      
      if(_inFetchingMode === false || truckDevices.length === 0){
        // fetching should be stopped
        return;
      }
      
      // check to see if fetch has been completed and reset the looping process
      if(_nextTruckDeviceIndex >= truckDevices.length){
        if(!options.loop){
          // this is a single loop fetch
          _inFetchingMode = false;
          if(success){
            options.success = true;
            success(that, {msg: "Fetch Success"}, options);
          }
          // since this is a single loop fetch return from the recursion
          return;
        }else{
          // need to continue looping
          _nextTruckDeviceIndex = 0;
        } 
      }//--end if loop has reached one full loop
      
      truckDeviceModel = this.get("truckDevices").at(_nextTruckDeviceIndex);

      // make sure truckDevice is connected before fetching
      if(truckDeviceModel.get("bluetoothDeviceModel").get("status") !== "connected"){
        // ignore this device
        window.setTimeout(function(){
          _nextTruckDeviceIndex+= 1;
          that._fetchNextTruckDevice(options);
        }, 500);
      }else{
        // should wait a second before fetching to help ease overloading the call
        window.setTimeout(function(){
          truckDeviceModel.fetch({
            success: function(truckDeviceModel, response, roptions){
              //that.trigger("truckWeightUpdated");
              _nextTruckDeviceIndex+= 1;
              that._fetchNextTruckDevice(options);
            },

            error: function(truckDeviceModel, response, roptions){
              // silently ignore
              //that.trigger("truckWeightUpdated");
              
              _nextTruckDeviceIndex+= 1;
              that._fetchNextTruckDevice(options);
            },

            inDemoMode: AppController.inDemoMode(),

            configMode: options.configMode
          });
        }, 500);
      }//-end if-else read this device or not
    }//--end /_fetchNextTruckDevice/
  });
  
  /**
   * Gets the available truck configuration images for the profile (filters by number of axles associated to the profile).
   * Example:
   * var availableTruckConfigImages = ProfileModel.getAvailableTruckConfigImages();
   * alert("imgSrc: " + availableTruckConfigImages.imgSrc);
   * alert("numOfAxles: " + availableTruckConfigImages.numOfAxles);
   * @returns {Array} An array of the available truck configuration images.
   */
  ProfileModel.prototype.getAvailableTruckConfigImages = function(){
    var configImages = [],
        numOfAxles   = this.getNumOfAxles(),
        x;
    // filter through and only return the images with the same number of associated truck axles
    for(x = 0; x < _availableTruckConfigImages.length; x+= 1){
      if(_availableTruckConfigImages[x].numOfAxles === numOfAxles){
        // found match
        configImages.push(_availableTruckConfigImages[x]);
      }
    }//--end foreach availableTruckConfigImages
    
    return configImages;
  };
  
  
  /**
   * Gets the number of axles for all truck devices associated to this profile.
   * @returns {Number} the number of axles for all the truck devices associated to this profile.
   */
  ProfileModel.prototype.getNumOfAxles = function(){
    var numOfAxles = 0;
    
    this.get("truckDevices").each(function(truckDevice){
      numOfAxles+= truckDevice.getNumOfAxles();
    });
    
    return numOfAxles;
  };
  
  
  /**
   * Gets the maximum weight the truck devices are allowed to read based on the number of axles all the devices have combined.
   * @returns {Number} the maximum weight the truck devices are allowed to read.
   */
  ProfileModel.prototype.getMaxWeight = function(){
    var maxWeight = this.getNumOfAxles() * MAX_WEIGHT_PER_AXLE_IN_LBS;
    
    return AppController.convertWeight(maxWeight, false);
  };
  
  
  /**
   * Whether or not all devices are offline (either disconnected or error status).
   * @returns {Boolean} true if all devices are offline (either disconnect or error status), false if at least one device is connected or is connecting.
   */
  ProfileModel.prototype.isAllDevicesOffline = function(){
    var numOfDevicesOffline = 0,
        truckDevices = this.get("truckDevices");
    
    truckDevices.each(function(truckDevice){
      var deviceStatus = truckDevice.get("bluetoothDeviceModel").get("status");
      
      if(deviceStatus === "disconnected" || deviceStatus === "error"){
        numOfDevicesOffline+= 1;
      }
    });
    
    return (numOfDevicesOffline === truckDevices.length);
  };
  
  ProfileModel.prototype.isAllDevicesConnected = function(){
    var numOfConnectedDevices = 0,
        truckDevices = this.get("truckDevices"),
        numOfDevices = truckDevices.length;

    truckDevices.each(function(truckDevice){
      var deviceStatus = truckDevice.get("bluetoothDeviceModel").get("status");
      
      if(deviceStatus === "connected"){
        numOfConnectedDevices+= 1;
      }
    });
    
    return (numOfConnectedDevices === numOfDevices);
  };
  
  
  /**
   * Resets all devices connection status to disconnected.
   */
  ProfileModel.prototype.resetDevicesStatus = function(){
    this.get("truckDevices").each(function(truckDevice){
      truckDevice.get("bluetoothDeviceModel").set("status", "disconnected");
    });
  };
  
  /**
   * Replaces the bluetooth devices in this profile. Will order the devices based on the order in the collection. Will reset the weight information.
   * @param {BluetoothDeviceCollection} bluetoothDeviceCollection the collection of bluetooth devices to replace with.
   */
  ProfileModel.prototype.replaceBluetoothDevices = function(bluetoothDeviceCollection){
    var truckDevices       = new TruckDeviceCollection(),
        cachedTruckDevices = AppController.getSettings().get("cachedTruckDevices");
    
    bluetoothDeviceCollection.each(function(bluetoothDevice, index){
      // check to see if truckDevice is cached
      var cachedTruckDevice = cachedTruckDevices.getTruckDeviceByBluetoothDevice(bluetoothDevice);
      
      if(cachedTruckDevice){
        truckDevices.add(cachedTruckDevice);
      }else{
        truckDevices.add(new TruckDeviceModel({
          bluetoothDeviceModel: bluetoothDevice,
          name: bluetoothDevice.get("name") // for starting purposes use the device name as the name of the device until the user changes it
        }));
      }
    });//--end foreach bluetoothDevice
    
    // apply the new truckDevice collection to this object
    this.set("truckDevices", truckDevices);
  };//--end /replaceBluetoothDevices/
  
  return ProfileModel;
});