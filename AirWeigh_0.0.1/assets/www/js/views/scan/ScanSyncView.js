define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'models/profile/ProfileModel',
  'views/scan/ScanListView',
  'views/sync/SyncDataView',
  'router',
  'require'
], function($, _, Backbone, AppController, ProfileModel, ScanListView, SyncDataView, Router, require){
  var _waitingToDisconnect = false,
      ScanSyncView;
    
  ScanSyncView = Backbone.View.extend({
    el: "#page-content",
    
    events: {
      'click .config-window__footer button': 'onNavClick'
    },
    
    navStateMap: [], // keeps the current state of the navigation menu (disabled or not, so when loading is finished, it is put back in its correct state.
    
    subviews: [
      {
        name            : "scanlist",
        class           : ScanListView,
        backButtonTitle : "Cancel",
        nextButtonTitle : "Continue <b>&#62;</b>"
      },
      {
        name            : "syncdata",
        class           : SyncDataView,
        backButtonTitle : "Back",
        nextButtonTitle : "Continue"
      }
    ],
    
    subviewEvents: [],
    
    curSubviewIndex: 0,
    
    profileInSyncMode: null,
    
    curSubviewInstance: null,
    
    initialize: function(){
      var eventsModel = AppController.getEventsModel(),
          that = this,
          x;
      
      // router is a circular dependency, so require it
      Router = require('router');
      
      this.profileInSyncMode = new ProfileModel();
      
      // setup subview events
      this.subviewEvents = [
        {
          event    : 'selected:device',
          callback : this.onScanDeviceSelected
        },
        {
          event    : 'startLoading:scan',
          callback : this.onStartLoadingScan
        },
        {
          event    : 'stopLoading:scan',
          callback : this.onStopLoading
        },
        {
          event    : 'startLoading:sync',
          callback : this.onStartLoading
        },
        {
          event    : 'stopLoading:sync',
          callback : this.onStopLoading
        },
        {
          event    : 'error:sync',
          callback : this.onSyncError
        },
        {
          event    : 'resync',
          callback : this.resync
        }
      ];
      
      // add the subview events to the app events model
      //eventsModel.on('selected:device', this.onScanDeviceSelected, this);
      for(x = 0; x < this.subviewEvents.length; x+= 1){
        eventsModel.on(this.subviewEvents[x].event, this.subviewEvents[x].callback, this);
      }
      
      if(AppController.inConnectedMode()){
        _waitingToDisconnect = true;
        AppController.disconnectFromSelectedProfileDevices({
          success: function(){
            _waitingToDisconnect = false;
            that.render();
          },
          
          error: function(){
            window.showErrorMessage("Error Disconnecting From Devices.");
          }
        });
      }
    },
    
    stop: function(){
      
    },
    
    close: function(){
      var eventsModel = AppController.getEventsModel(),
          key;

      this.stop();
      
      // remove subevent callbacks and close subview instance
      for(key in this.subviewEvents){
        eventsModel.off(this.subviewEvents[key].event, this.subviewEvents[key].callback, this);
      }
      this.curSubviewInstance.close();
      
      this.$el.empty();
      this.$el.unbind();
    },
    
    onStartLoading: function(){
      var that = this;
      
      // keep track of buttons current state
      this.navStateMap = [];
      
      this.$el.find('.nav-button-bar button').each(function(index){
        var $this = $(this);
        
        //that.navStateMap.push($this.prop('disabled'));
        that.navStateMap.push("");
        $this.prop('disabled', true);
      });
    },
    
    onStartLoadingScan: function(){
      var that = this;
      
      // keep track of buttons current state
      this.navStateMap = [];
      
      this.$el.find('.nav-button-bar button').each(function(index){
        var $this = $(this);
        
        // button next should always be disabled until the view allows it
        if($this.hasClass('button-next')){
          $this.prop('disabled', true);
        }
        
        that.navStateMap.push($this.prop('disabled'));
        $this.prop('disabled', true);
      });
    },
    
    onStopLoading: function(){
      var that = this;
      
      // re-enable navigation buttons
      this.$el.find('.nav-button-bar button').each(function(index){
        $(this).prop('disabled', that.navStateMap[index]);
      });
    },
    
    /**
     * The event that an error occurred during the sync process. More than likely this is due to a connect error.
     * @param {Error} errorModel the error that occurred during the sync.
     */
    onSyncError: function(errorModel){
      this.onStopLoading();
      
      // disable next button since there was an error, user should either go back and select new devices or rescan
      this.$el.find('.nav-button-bar button.button-next').prop('disabled', true);
      
      AppController.showErrorMessage(errorModel.message || errorModel);
    },
    
        
    /**
     * On the event that a device in the scan subview has been selected.
     * @param {BluetoothDeviceCollection} bluetoothDevices the collection of bluetooth device models that was selected during a scan.
     */
    onScanDeviceSelected: function(bluetoothDevices){
      this.profileInSyncMode.replaceBluetoothDevices(bluetoothDevices);
      
      // device has been selected, enable next button and keep track of the selected device
      if(bluetoothDevices.length > 0){
        this.$el.find('.button-next').prop('disabled', false);
      }else{
        this.$el.find('.button-next').prop('disabled', true); 
      }
    },
    
    /**
     * On the event that the config view menu navigation button was clicked. 
     * Closes the previous view and opens the correct next view.
     * @param {Event} event the event that was triggered.
     */
    onNavClick: function(event){
      var action  = $(event.target).data('action'),
          that    = this;
      
      // check to see if cancel was pressed
      if(this.curSubviewIndex === 0 && action === 'back'){
        Router.closeModalWindow("scanSync", false);
        // prevent further execution
        return;
      }
      
      if(this.curSubviewIndex === this.subviews.length - 1 && action === 'next'){
        // last slide, need to update profileInEditMode to use data found during syncMode
        this.updateProfileInEditMode();
        AppController.getEventsModel().trigger("scansync:completed");
        Router.closeModalWindow("scanSync", false);
        
        return;
      }
  
      switch(action){
        case 'next':
          this.curSubviewIndex+= 1;
          break;
          
        case 'back':
          this.curSubviewIndex-= 1;
          break;
          
        default:
          AppController.showErrorMessage('Action not found, try again.');
      }
      
      // clear old subview
      this.curSubviewInstance.close();
      this.curSubviewInstance.remove();
      this.curSubviewInstance = null;
      
      // rerender the page
      this.render();
    },
    
    
    updateProfileInEditMode: function(){
      var profileInEditMode = AppController.getSettings().getProfileInEditMode();
      
      // need to update bluetoothDeviceModels and truckDevices of the model
      profileInEditMode.set("truckDevices", this.profileInSyncMode.get("truckDevices"));
      // reset the configImgUrl
      profileInEditMode.set("configImgUrl", "");
    },
    
    resync: function(){
      var that = this;
      
      // make sure to close current subview instance since it will be reinitialized
      this.curSubviewInstance.close();
      
      // check if needed to disconnect
      if(AppController.inConnectedMode()){
        _waitingToDisconnect = true;
        AppController.disconnectFromProfileDevices(that.profileInSyncMode, {
          success: function(){
            _waitingToDisconnect = false;
            that.render();
          },
          
          error: function(){
            window.showErrorMessage("Error Disconnecting From Devices.");
          }
        });
      }
      
      this.render();
    },
    
    /**
     * Renders this view to the screen.
     */
    render: function(){
      var data,
          template,
          subviewDetails;
  
      // configure data for template
      if(_waitingToDisconnect){
        data = {
          navigation: {
            backAttrs: 'disabled', // removed disabled portion, now first view has a workable cancel button
            nextAttrs: 'disabled'
          },

          message: "Disconnecting From Devices In Progress...."
        };
      }else{
        data = {
          navigation: {
            backAttrs: (this.curSubviewIndex > 0) ? '' : '', // removed disabled portion, now first view has a workable cancel button
            nextAttrs: (this.curSubviewIndex < this.subviews.length - 1) ? '' : 'disabled'
          },
          
          message: null
        };
      }

      // apply template
      template = _.template($('#tmplScanSync').html());
      this.$el.html(template(data));
      
      if(!_waitingToDisconnect){
        AppController.stopLoadingIcon();
        
        // apply the subview to the template subview content section
        subviewDetails  = this.subviews[this.curSubviewIndex];
        this.curSubviewInstance = new subviewDetails.class({
          el: this.$el.selector + ' .config-window__content .subview-element',

          profileInSyncMode: this.profileInSyncMode
        });

        this.curSubviewInstance.render();

        // update any navigation buttons based on subview details if viable
        if(subviewDetails.hasOwnProperty('backButtonTitle')){
          this.$el.find('.button-back').html(subviewDetails.backButtonTitle);
        }else{
          this.$el.find('.button-back').html("");
          this.$el.find('.button-back').addClass("button-hide");
        }

        if(subviewDetails.hasOwnProperty('nextButtonTitle')){
          this.$el.find('.button-next').html(subviewDetails.nextButtonTitle);
        }
      }else{
        AppController.startLoadingIcon();
      }//--end if-else not waiting to disconnect
      
        
      // return this for chaining
      return this;
    }
  });
  
  return ScanSyncView;
});