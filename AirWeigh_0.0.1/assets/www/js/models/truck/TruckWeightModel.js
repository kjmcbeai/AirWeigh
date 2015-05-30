define([
  'underscore',
  'backbone',
  'AppController',
  'models/truck/TruckAxleModel',
  'collections/truck/TruckAxleCollection',
  'require'
], function(_, Backbone, AppController, TruckAxleModel, TruckAxleCollection, require){ 
  var TruckWeightModel = Backbone.Model.extend({
    defaults: {
      id          : null,
      serviceUuid : "0f9652d2-b1f3-43ff-94bc-2b30d95c5d24",
      truckAxles  : null, // TruckAxleCollection
      axleIdBeingEdited: null
    },
    
    defaultTruckAxleCollectionDetails: [
      {
        name       : '',
        weightUuid : 'baba4957-3cc2-4e47-8af8-d59b23c6c733',
        nameUuid   : 'c68223ed-3a76-4c7c-9b1d-06ee8daa9eaa'
      },
      {
        name       : '',
        weightUuid : 'ce014254-c5bd-42af-a67a-2ab91156ec6b',
        nameUuid   : 'd1d15f56-c9c1-4aa7-ba05-3fb91a024a23'
      },
      {
        name       : '',
        weightUuid : '03481b90-3fb5-4cc3-bb55-fa8c436709e',
        nameUuid   : '8bd62e7b-dd15-47ed-bdda-ee1f49ca50c5'
      },
      {
        name       : '',
        weightUuid : '24f380c2-74ac-4510-8df6-f4461e3c6a6f',
        nameUuid   : '358277a5-e79d-4703-9f99-fd071fdf7922'
      },
      {
        name       : '',
        weightUuid : '57ada721-3e24-4b39-9987-7601b4767e53',
        nameUuid   : 'c3598046-f9a1-49d5-b389-f4c723b61ea4'
      },
      {
        name       : '',
        weightUuid : '7d2ea577-c73e-435f-9610-5ea12a04db6a',
        nameUuid   : '1cc79e99-eb52-41e3-aada-21e3a24ff9ed'
      }
    ],
    
    readAxleModelIndex: 0,
    
    isFetchingData: false,
    
    _readNextAxleModelIndex: 0,
    
    inFetchingMode: false, // Whether or not the weight model is in a fetching mode state (looping through the axle data).
    
    
    /**
     * Initializes the TruckWeightModel.
     */
    initialize: function(options){
      var truckAxles = new TruckAxleCollection(),
          prePopulateAxles = false,
          x;
  
      options = options || {};
      
      // load model data
      if(options.truckAxles){
        if(options.truckAxles.attributes){
          this.set("truckAxles", new TruckAxleCollection(options.truckAxles.attributes));
        }else{
          this.set("truckAxles", new TruckAxleCollection(options.truckAxles));
        }
      }else{
        this.set("truckAxles", new TruckAxleCollection());
        prePopulateAxles = true;
      }
  
      AppController = require('AppController');
      
      // add default truck axle details if needed
      if(prePopulateAxles){
        if(AppController.inDemoMode()){
          // simulated truckAxleData

          truckAxles = new TruckAxleCollection([
            new TruckAxleModel({
              name: '',
              weight: 0,
              enum: 1
            }),
            new TruckAxleModel({
              name: '',
              weight: 0,
              enum: 2
            }),
            new TruckAxleModel({
              name: '',
              weight: 0,
              enum: 3
            })
          ]);// end axle collection
        }else{
          for(x = 0; x < this.defaultTruckAxleCollectionDetails.length; x+= 1){
            truckAxles.push(new TruckAxleModel(this.defaultTruckAxleCollectionDetails[x]));
          }
        }//-- End if-else app in demo mode or not

        this.set('truckAxles', truckAxles);
      }//--end if prepopulate truck axles
      
      
      if(this.get("id") === null){
        this.set('id', this.cid);
      }
      this.readAxleModelIndex = 0;
      this.get('truckAxles').bind('change', this.onAxleChange, this);
    },
    
    /**
     * Overrides the unbind method for this model.
     */
    unbind: function(){
      // call main unbind
      Backbone.Model.prototype.unbind.apply(this, arguments);
      
      // unbind truckAxles
      this.get('truckAxles').unbind();
    },
    
    /**
     * The event that the truck axle has been modified.
     * @param {TruckAxleModel} truckAxleModel the truckAxle that has been modified.
     */
    onAxleChange: function(truckAxleModel){
      AppController.getEventsModel().trigger("truckWeightUpdated");
      this.trigger('change');
    },
    
    
    /**
     * Fetches data for the TruckWeightModel.
     * @param {PlainObject} options the options for the fetch.
     * options = {
     *   success: function(truckDeviceModel, response, options){
     *     alert("Fetch was successful.");
     *   },
     *   
     *   error: function(truckDeviceModel, response, options){
     *     alert("Error: " + response.msg);
     *   },
     *   
     *   inDemoMode: false, // whether or not to simulate device reading or not.
     *   
     *   deviceAddress: "52:11:A6:54:F2:A0", // the address for the device to use for reading.
     *   
     *   configMode: false // whether or not the data being fetched is only configuration type of data.
     * };
     * @throws {ErrorModel} if device address wasn't specified in options.
     */
    fetch: function(options){
      var that = this,
          success;
  
      options = options || {};
      success = options.success;

      // make sure deviceAddress is specified:
      if(options.deviceAddress === undefined){
        throw new ErrorModel("Device Address not specified in fetch options for TruckWeightModel.");
      }
      // fetching requires fetching from each truck axle, 
      // fetching from a truck axle must happen one at a time otherwise will cause reading errors
      
      // fetch any truckWeightModel specific data
      // no specific data to fetch so far
      
      // reset readNextAxleModelIndex to 0 to start a one loop process where all truck axles are fetched before truckWeightModel has finished its reading process
      this._readNextAxleModelIndex = 0;
      this._readNextAxleModel({
        success: function(){
          // at this point all Truck Axle Models in the truckAxles property collection has been read once
          
          // if in configMode, need to configure truckAxles that are configured to be used
          if(options.configMode){
            that.configureTruckAxles();
          }
          
          options.success = true;
          success(that, {msg: "Fetch Completed."}, options);
        },
        
        error: function(model, response, roptions){
          options.success = false;
          options.error(that, response, options);
        },
        
        inDemoMode: options.inDemoMode,
        
        deviceAddress: options.deviceAddress,
        
        configMode: options.configMode
      });
    }, //-- End /fetch/
    
    
    /**
     * Reads the next axle model in the truckAxles collection. This should be a private method and only used by the fetch method.
     * @param {PlainObject} options the options for this method.
     * options.success    : function(){};
     * options.error      : function(){};
     * options.inDemoMode : false; // true to not use bluetooth functionality but simulate data, false to use bluetooth reading for fetching data
     */
    _readNextAxleModel: function(options){
      var truckAxleCollection = this.get("truckAxles"),
          that = this,
          truckAxleModel = null,
          success;
  
      options = options || {};
      success = options.success;

      // check to see if reading of truck axles has been completed
      if(this._readNextAxleModelIndex >= truckAxleCollection.length){
        // reading has been completed
        options.success = true;
        success(that, {msg: "Fetch Successful."}, options);
        // let any listeners know that the reading/fetching has been fully completed
        //this.trigger('fetchCompleted');
        // prevent further execution of this recursion
        return;
      }
      
      truckAxleModel = truckAxleCollection.at(this._readNextAxleModelIndex);
      
      // should wait a second before fetching
      window.setTimeout(function(){
        truckAxleModel.fetch({
          success: function(model){
            AppController.getEventsModel().trigger("truckWeightUpdated");
            // read next axle
            that._readNextAxleModelIndex+= 1;
            that._readNextAxleModel(options);
          }, 
          error: function(model, response, roptions){
            // silently ignore and set weight value to 0
            model.set("weight", 0);
            AppController.getEventsModel().trigger("truckWeightUpdated");
            that._readNextAxleModelIndex+= 1;
            that._readNextAxleModel(options);
          },
          // need to provide serviceUuid, so that truckAxle can complete a read bluetooth operation
          serviceUuid: that.get("serviceUuid"),

          deviceAddress: options.deviceAddress,

          inDemoMode: options.inDemoMode,
          
          configMode: options.configMode
        });//---end truckAxleModel.fetch
      }, 500);
    }//--end /_readNextAxleModel/
  });//-- End TruckWeightModel
  
  /**
   * Loops through each of the current truckAxles and checks if they are configured to be used or not,
   * and updates this object truck axles to be just those elements.
   */
  TruckWeightModel.prototype.configureTruckAxles = function(){    
    var updatedTruckAxles = new TruckAxleCollection();
    
    this.get("truckAxles").each(function(truckAxle){
      // enum value 0 means that this particular axle is not configured to be used by the bluetooth device
      if(truckAxle.get("enum") !== 0){
        updatedTruckAxles.add(truckAxle);
      }
    });
    
    // update truck axles
    this.set("truckAxles", updatedTruckAxles);
  };
  
  
  /**
   * Resets the weight values for each truck axle.
   */
  TruckWeightModel.prototype.resetWeight = function(){
    this.get("truckAxles").each(function(truckAxle){
      truckAxle.set("weight", 0);
    });//--end foreach truckAxle
    
    AppController.getEventsModel().trigger('truckWeightUpdated');
  };
  
  
  /**
   * @returns {Number} the number of axles associted to this model.
   */
  TruckWeightModel.prototype.getNumOfAxles = function(){
    return this.get("truckAxles").length;
  };
 
  /**
   * @returns {Number} The total weight for all the truckAxles.
   */
  TruckWeightModel.prototype.getTotalWeight = function(){
    var totalWeight = 0,
        truckAxles = this.get('truckAxles');

    truckAxles.each(function(axleModel) {
      totalWeight += axleModel.get('weight');
    });

    return totalWeight;
  };
  
  /**
   * Gets the total weight in its string format.
   * Example: 1200.56 will be returned as "1,200".
   * @returns {String} The total weight as a string.
   */
  TruckWeightModel.prototype.getTotalWeightString = function(){
    var totalWeight = this.getTotalWeight().toFixed(0);
    
    return Number(totalWeight).toLocaleString();
  };
  
  return TruckWeightModel;
});