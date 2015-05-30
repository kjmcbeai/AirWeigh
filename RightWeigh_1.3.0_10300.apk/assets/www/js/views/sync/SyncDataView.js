define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'BluetoothDeviceCollection'
], function($, _, Backbone, AppController, BluetoothDeviceCollection){
  var SyncDataView = Backbone.View.extend({
    el: '#page-content',
    
    /**
     * The bluetooth devices that had an error connecting.
     */
    _deviceErrors: new BluetoothDeviceCollection(),
    
    /**
     * Whether or not the syncing proccess is still going. (Reading is completed, but waiting for disconnecting).
     */
    _inSyncCycle: false,
    
    /**
     * Whether or not the sync process is fully completed, along with disconnecting from the devices.
     */
    _completedSync: false,
    
    events: {
      'click .resync-button': 'resync'
    },
    
    profileInSyncMode: null,
    
    initialize: function(options){
      options = options || {};
      
      AppController.getEventsModel().trigger("startLoading:sync");
      
      this.profileInSyncMode = options.profileInSyncMode;
      
      this.startSyncCycle();
    },
    
    resync: function(){
      AppController.getEventsModel().trigger('resync');
    },
    
    startSyncCycle: function(){
      var that = this;
      
      if(!this.profileInSyncMode){
        throw new Error("SyncDataView: profileInSyncMode not specified during view creation.");
      }
      
      this._inSyncCycle   = true;
      this._completedSync = false;
      // reset deviceErrors
      that._deviceErrors.reset();

      AppController.connectToProfileDevices(this.profileInSyncMode, {
        ignoreConnectError : false,
        stopOnError        : false,
        
        // connect success
        success: function(){
          // begin reading cycle
          that.profileInSyncMode.fetch({
            success: function(profileModel, response, options){
              // data cycle completed, now disconnect from all devices
              that._inSyncCycle = false;
              that.render();
              
              AppController.disconnectFromProfileDevices(that.profileInSyncMode, {
                success: function(){
                  // sync cycle completed
                  that._completedSync = true;
                  that._inSyncCycle   = false;
                  
                  that.render();
                  
                  // let the parent view know what has happened during the syncing process
                  if(that._deviceErrors.length > 0){
                    AppController.getEventsModel().trigger("error:sync");
                  }else{
                    AppController.getEventsModel().trigger("stopLoading:sync");
                  }
                }
              });//--end disconnectFromProfileDevices
            },// end success profileInSyncMode.fetch
            
            configMode: true
          });//--end connectToProfileDevices success
        },
        
        // connect error
        error: function(bluetoothDeviceModel, errorModel){
          // keep track of which devices couldn't connect
          that._deviceErrors.add(bluetoothDeviceModel);
        }
      });
    },//--end /startSyncCycle/
    
    stop: function(){
      
    },
    
    close: function(){
      this.stop();
      // close up view elements
      this.$el.empty();
      this.$el.unbind();
    },
    
    render: function(){
      var template;
  
      template = _.template($("#tmplSyncData").html());
      
      this.$el.html(template({
        truckDevices       : this.profileInSyncMode.get("truckDevices"),
        completedSync      : this._completedSync,
        inSyncCycle        : this._inSyncCycle,
        deviceErrors       : this._deviceErrors
      }));

      // return this for chaining
      return this;
    }//--end /render/
  });
  
  return SyncDataView;
});