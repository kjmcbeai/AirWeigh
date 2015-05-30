define([
  'underscore',
  'backbone',
  'AppController',
  'collections/profile/ProfileCollection',
  'collections/truck/TruckDeviceCollection',
  'models/truck/TruckDeviceModel',
  'BluetoothDeviceModel',
  'models/truck/TruckWeightModel',
  'collections/truck/TruckAxleCollection',
  'models/truck/TruckAxleModel',
  'ErrorModel',
  'localstorage'
], function(_, Backbone, AppController, ProfileCollection, TruckDeviceCollection, TruckDeviceModel, BluetoothDeviceModel, TruckWeightModel, TruckAxleCollection, TruckAxleModel, ErrorModel){
  var _profileInEditMode = null,
      SettingsModel;

  SettingsModel = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage('rwls_settings'),
    
    defaults: {
      id: 1,
      profiles: null,
      cachedTruckDevices: null
    },
    
    initialize: function(options){
      options = options || {};
      
      if(options.profiles){
        if(options.profiles.attributes){
          this.set("profiles", new ProfileCollection(options.profiles.attributes));
        }else if(options.profiles.get){
          this.set("profiles", options.profiles);
        }else{
          this.set("profiles", new ProfileCollection(options.profiles));
        }
      }else{
        this.set('profiles', new ProfileCollection());
      }
      
      if(options.cachedTruckDevices){
        if(options.cachedTruckDevices.attributes){
          this.set("cachedTruckDevices", new TruckDeviceCollection(options.cachedTruckDevices.attributes));
        }else if(options.cachedTruckDevices.get){
          this.set("cachedTruckDevices", options.cachedTruckDevices);
        }else{
          this.set("cachedTruckDevices", new TruckDeviceCollection(options.cachedTruckDevices));
        }
      }else{
        this.set("cachedTruckDevices", new TruckDeviceCollection());
      }
    },
    
    save: function(key, val, options){
      var cachedTruckDevices = this.get("cachedTruckDevices");
      
      cachedTruckDevices.set(this.get("profiles").at(0).get("truckDevices").models, {
        remove: false
      });
      
      // perform parent save
      Backbone.Model.prototype.save.apply(this, arguments);
    },
    
    parse: function(response){
      var profiles,
          cachedTruckDevices;
      
      response = response || {};
      
      // need to parse model data (profiles, and cachedTruckDevies)
      profiles = (response.profiles) ? new ProfileCollection(response.profiles) : new ProfileCollection();      
      cachedTruckDevices = (response.cachedTruckDevices) ? new TruckDeviceCollection(response.cachedTruckDevices) : new TruckDeviceCollection();
      
      return _.extend({}, response, {
        profiles: profiles,
        cachedTruckDevices: cachedTruckDevices
      });
    },//--end /parse/
    
    /**
     * Sets the profile that is in editing mode.
     * @param {ProfileModel} profileModel the profile that is in editing mode.
     */
    setProfileInEditMode: function(profileModel){
      _profileInEditMode = profileModel;
    },
    
    /**
     * Gets the ProfileModel that is currently being edited. Returns null if no profile is being edited.
     * @returns {ProfileModel} the profile model being edited. Returns null if no profile is being edited.
     */
    getProfileInEditMode: function(){
      return _profileInEditMode;
    }
  });
    
  return SettingsModel;
});