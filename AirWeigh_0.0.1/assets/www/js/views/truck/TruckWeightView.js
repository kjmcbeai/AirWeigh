define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'sherettewebs',
  'lib/sherettewebs/plugins/slider/SliderPlugin',
  'lib/sherettewebs/plugins/dial/MaskDialPlugin',
  'lib/sherettewebs/plugins/slideview/slideview',
  'require',
  'router',
  'BluetoothFactory', // remove after debug of revision number
  'models/bluetooth/BluetoothCharacteristicModel',
  'lib/sherettewebs/plugins/bluetooth/BluetoothPluginUtil'
], function($, _, Backbone, AppController, SheretteWebs, SliderPlugin, MaskDialPlugin, SlideViewPlugin, require, Router, BluetoothFactory, BluetoothCharacteristicModel, BluetoothPluginUtil){
  var _plugins = {
        slider : SliderPlugin,
        dial   : null
      },
      _modules = {
        weightBreakdown: {
          selector : '#weight-breakdown',
          element  : null
        }
      },
      _dialModel = {},
      TruckWeightView;
  
  
  /**
   * The view for the weight/main view of the application.
   */
  TruckWeightView = Backbone.View.extend({
    el: '#page-content',
    
    events: {
      'click .truck-header'        : 'openSettingsWindow',
      'click .axle-name'           : 'openAxleEditWindow',
      'click .device-name'         : 'openDeviceNameEditWindow',
      'click .order-device-button' : 'changeDeviceOrder',
      'click .order-axle-button'   : 'changeAxleOrder',
      'click .button-reconnect'    : 'reconnectToDevices',
      'click .total-weight-button' : 'openEditTotalWeightAlert',
      'click .weight-alert-button' : 'slideToAlertView',
      'click .close-dial__button'  : 'slideToWeightView'
    },
    
    profileModel: null,
    
    initialConnect: true,
    
    /**
     * Whether or not connection sequence has been completed or not.
     */
    connected: false,
    
    /**
     * Initializes the TruckWeightView.
     */
    initialize: function(){     
      this.refreshProfileModel();
      // reset weight
      if(this.profileModel){
        this.profileModel.resetWeight();
      }
      
      Router = require('router');
      
      // listen to connection status event
      this.attachAppEvents();
      
      // connect to devices
      if(AppController.getSelectedProfile()){
        //this.connectToTruckDevices();
      }
    },
    
    /**
     * Attaches all AppEvents associated to this view.
     */
    attachAppEvents: function(){
      var eventsModel = AppController.getEventsModel();
      
      eventsModel.on('bluetoothdevice:statuschanged', this.render, this);
      eventsModel.on('app:afterDeleteSettings', this.onDevicesUpdated, this);
      eventsModel.on('app:afterSaveSettings', this.onDevicesUpdated, this);
    },
    
    /**
     * Detaches all AppEvents associated to this view.
     */
    detachAppEvents: function(){
      var eventsModel = AppController.getEventsModel();
      
      eventsModel.off('bluetoothdevice:statuschanged', this.render);
      eventsModel.off('app:afterDeleteSettings', this.onDevicesUpdated);
      eventsModel.off('app:afterSaveSettings', this.onDevicesUpdated);
    },
    
    
    /**
     * The event that devices have been updated. A connection to truck devices need to be made, 
     * and this will signal that on resume, that a connection process needs to be made.
     */
    onDevicesUpdated: function(){
      this.initialConnect = true;
    },
    
    
    /**
     * Refreshed the profile model so that it's update with the selected profile on file.
     */
    refreshProfileModel: function(){
      if(this.profileModel){
        // unbind truckWeightUpdated to prevent mass binding of the event.
        //this.profileModel.off('truckWeightUpdated', this.updateWeightData, this);
      }
      
      this.profileModel = AppController.getSelectedProfile();
    },
    
    /**
     * Slides the the alert view of the slideview plugin.
     * @param {Event} event the event click that triggered this event.
     */
    slideToAlertView: function(event){
      var truckDeviceId  = $(event.currentTarget).data("truckdeviceid"),
          axleId         = $(event.currentTarget).data("axleid"),
          that           = this;
      
      this.configureDialModel(truckDeviceId, axleId);
      
      SlideViewPlugin.next("truck-weight", {
        done: function(){
          that.configureDialPlugin();
          _plugins.dial.run(that.getDialModelValue());
        }
      });
    },
    
    /**
     * Slides the slideview to the Weight View.
     * @param {Event} event the event click that triggered this event.
     */
    slideToWeightView: function(event){
      // reset the measurement text
      _plugins.dial.stop();
      this.$el.find(".weight-dial-text").text("0");
      this.$el.find(".weight-dial-measurement-text").text("Configuring Dial");
      this.$el.find('.alert-title').text("");
      
      SlideViewPlugin.previous("truck-weight", {
        done: function(){
          // do nothing for now
        }
      });
    },
    
    /**
     * Configures the dial plugin to be used based 
     */
    configureDialPlugin: function(){
      var $dialText            = this.$el.find(".weight-dial-text"),
          $dialMeasurementText = this.$el.find(".weight-dial-measurement-text"),
          $dialTitle           = this.$el.find('.alert-title'),
          that = this;
  
        $dialMeasurementText.html("<span>" + this.getDialModelName() + " weight in </span><span class='weight-dial-unit-measurement'>" + AppController.getSelectedProfile().get("unitMeasurement") + "</span>");
        //$dialTitle.text(this.getDialModelName());
      
      // update the dial using the selected axleId
      _plugins.dial = new MaskDialPlugin("#weight-dial", {
        fullDialValue : this.getDialModelMaxValue(),
        fullDialDegrees : 360,
        onUpdate: function(dialModel){
          $dialText.text(Math.round(dialModel.inProgressDialValue));
        },
        onComplete: function(dialModel){
           $dialText.text(Math.round(dialModel.dialValue));  
           _plugins.dial.run(that.getDialModelValue());
        }
      });
    },
    
    /**
     * Configures the model data that will be used when getting weight value for the mask dial.
     * @param {type} truckDeviceId the id for the truck device that was selected.
     * @param {type} truckAxleId the id for the truck axle that was selected.
     */
    configureDialModel: function(truckDeviceId, truckAxleId){
      var selectedProfile = AppController.getSelectedProfile(),
          truckDeviceModel, truckAxleModel;
      
      // prevent incorrect access
      if(!selectedProfile){
        throw new Error("Profile not found.");
      }
      
      // check to see if total weight is to be used
      if(truckDeviceId === 0 && truckAxleId === 0){
        // using total weight
        _dialModel = {
          type  : "totalweight",
          model : selectedProfile
        };
        
        return;
      }
      
      // fetch axle
      truckDeviceModel = selectedProfile.get("truckDevices").get(truckDeviceId);
      
      if(!truckDeviceModel){
        throw new Error("Device not found in profile.");
      }
      
      truckAxleModel = truckDeviceModel.get("truckWeightModel").get("truckAxles").get(truckAxleId);
      if(!truckAxleModel){
        throw new Error("Truck axle not found in profile.");
      }
      
      _dialModel = {
        type  : "truckaxle",
        model : truckAxleModel
      };
    },
    
    /**
     * @returns {String} the dial models name. "Total Weight" if its the total weight, otherwise the axle name.
     */
    getDialModelName: function(){
      // TOTAL WEIGHT
      if(_dialModel.type === "totalweight"){
        return "total";
      }
      // TRUCK AXLE
      if(_dialModel.type === "truckaxle"){
        return _dialModel.model.get("name").toLowerCase();
      }
      
      // DEFAULT
      return "";
    },
    
    /**
     * Gets the value that will be used for running the dial (this is either total weight or the weight value of the truck axle).
     * @returns {Number} the value the dial should run to.
     */
    getDialModelValue: function(){
      // TOTAL WEIGHT
      if(_dialModel.type === "totalweight"){
        return _dialModel.model.getTotalWeight();
      }
      // TRUCK AXLE
      if(_dialModel.type === "truckaxle"){
        return _dialModel.model.get("weight");
      }
      
      // DEFAULT
      return 0;
    },
    
    /**
     * @returns {Number} The value that will be used for the full dial value.
     */
    getDialModelMaxValue: function(){
      // TOTAL WEIGHT
      if(_dialModel.type === "totalweight"){
        return _dialModel.model.get("totalWeightAlert");
      }
      // TRUCK AXLE
      if(_dialModel.type === "truckaxle"){
        return _dialModel.model.get("alertWeight");
      }
      // DEFAULT
      return 5000;
    },
    
    
    /**
     * The event that the device needs to change order.
     * @param {Event} event the event that triggered this event.
     */
    changeDeviceOrder: function(event){
      var $curTarget   = $(event.currentTarget),
          direction    = $curTarget.data("dir"),
          itemIndex    = $curTarget.data("itemindex"),
          truckDevices = AppController.getSelectedProfile().get("truckDevices"),
          destModel    = null,
          targetModel  = null,
          that         = this;
  
      // should only be able to treat down for now
      if(direction === "down"){
        destModel   = truckDevices.at(itemIndex + 1); // the model that will move up
        targetModel = truckDevices.at(itemIndex); // the model that will move down
        
        // swap positions
        truckDevices.models.splice(itemIndex, 2, destModel, targetModel);
        //truckDevices.set(truckDevices.models);
        
        AppController.saveCurrentSettings({
          success: function(settingsModel){
            that.render();
          }
        });
      }else{
        window.showDebugMessage("Direction: " + direction + " not supported");
      }
    },
    
    /**
     * Changes the order of the truck axles.
     * @param {Event} event the event that triggered this event. Should have data: dir, deviceindex, and itemindex to help change the order.
     */
    changeAxleOrder: function(event){
      var $curTarget   = $(event.currentTarget),
          direction    = $curTarget.data("dir"),
          deviceIndex  = $curTarget.data("deviceindex"),
          itemIndex    = $curTarget.data("itemindex"),
          truckAxles   = null,
          destModel    = null,
          targetModel  = null,
          that         = this;
  
      truckAxles = AppController.getSelectedProfile().get("truckDevices").at(deviceIndex).get("truckWeightModel").get("truckAxles");
  
      // should only be able to treat down for now
      if(direction === "down"){
        destModel   = truckAxles.at(itemIndex + 1); // the model that will move up
        targetModel = truckAxles.at(itemIndex); // the model that will move down
        
        // swap positions
        truckAxles.models.splice(itemIndex, 2, destModel, targetModel);
        
        AppController.saveCurrentSettings({
          success: function(settingsModel){
            that.render();
          }
        });
      }else{
        window.showDebugMessage("Direction: " + direction + " not supported");
      }
    },
    
    /**
     * Opens the settings modal window.
     * @param {Event} event the event that triggered openSettingsWindow.
     */
    openSettingsWindow: function(event){
      this.stop();
      //need to setup what profile is being edited
      AppController.getSettings().setProfileInEditMode(AppController.getSelectedProfile());
      Router.openModalWindow("editProfile");
    },

    /**
     * Opens the edit axle modal window.
     * @param {Event} event the event that triggered the openAxleEditWindow event.
     */
    openAxleEditWindow: function(event){
      var $element = $(event.currentTarget),
          id = $element.data('axleid');

      this.profileModel.set("axleIdBeingEdited", id);

      this.stop();
      Router.openModalWindow('axleConfig');
    },
    
    /**
     * Opens edit view for total weight alert.
     * @param {Event} event the event that triggered this event.
     */
    openEditTotalWeightAlert: function(event){
      this.stop();
      Router.openModalWindow("truckTotalWeightConfig");
    },
    
    
    /**
     * Opens the edit view for device name/alerts.
     * @param {Event} event the event that triggered this event.
     */
    openDeviceNameEditWindow: function(event){
      var $element = $(event.currentTarget),
          id       = $element.data('truckdeviceid');
  
      // update the profile device being edited
      this.profileModel.set("truckDeviceIdBeingEdited", id);
      
      this.stop();
      Router.openModalWindow("truckDeviceEditName");
    },
    
    
    /**
     * Reconnects to the truck devices.
     * @param {Event} event the event that triggered the reconnectToDevices event.
     */
    reconnectToDevices: function(event){
      this.stop();
      this.initialConnect = true;
      this.resume();
    },
    
    /**
     * Stops any animations or timers in this view. Useful for modal window openings.
     */
    stop: function(){
      if(this.profileModel){
        this.profileModel.stopTruckFetchLoop();
        // remove listener
        //this.profileModel.off('truckWeightUpdated', this.updateWeightData);
        AppController.getEventsModel().off('truckWeightUpdated', this.updateWeightData);
      }
      
      if(_plugins.dial !== null){
        _plugins.dial.stop();
      }
    },
    
    
    /**
     * Resumes this view (connects to devices if needed and starts the truck weight view if needed).
     */
    resume: function(){
      this.refreshProfileModel();
      
      if(!AppController.inInitialSetupState() && this.profileModel){
        this.profileModel.resetWeight();
        AppController.getEventsModel().on('truckWeightUpdated', this.updateWeightData, this);
        
        if(this.initialConnect){
          this.connectToTruckDevices();
        }else{
          this.profileModel.startTruckFetchLoop();
          this.updateWeightData();
        }//--end if-else initialConnect
      }//--end if initialSetupState and profileModel exists
    },
    
    /**
     * Stops any animations/timers in the view, clears the view's content, 
     * and unbinds any events attached to the view.
     */
    close: function(){
      this.stop();
      this.$el.empty();
      this.$el.unbind();
      this.initialRender = true;
      
      if(this.profileModel !== null){
        this.profileModel.unbind();
        this.profileModel = null;
      }
      
      this.detachAppEvents();
    },
    
    /**
     * Renders the view to the $el property.
     */
    render: function(){
      var data,
          template;
          
      // make sure profileModel is up to date
      this.refreshProfileModel();

      data = {
        inInitialSetupState : AppController.inInitialSetupState(),
        profileModel        : this.profileModel,
        headerTitle         : (this.profileModel === null) ? '' : this.profileModel.get("name"),
        initialConnect      : this.initialConnect,
        connected           : this.connected
      };
      
      template = _.template($("#tmplTruckWeight").html());
      
      this.$el.html(template(data));
      
      /* Configure View Plugins/Modules */
      if(data.inInitialSetupState){
        // do any intial setup plugins/modules
      }else{
        this.configureNonIntialSetupPlugins();
      }//end if-else initial setup
     
      // return this for chaining
      return this;
    },
    
    /**
     * Configures the weight views plugins for the non intial setup scenario.
     */
    configureNonIntialSetupPlugins: function(){      
      // configure weight breakdown module
      _modules.weightBreakdown.element = $(_modules.weightBreakdown.selector);     
      
      SlideViewPlugin.initialize();
    },
    
    /**
     * Connects to the truck devices of the application's selected profile.
     */
    connectToTruckDevices: function(){
      var that = this;
      
      this.refreshProfileModel();
      this.initialConnect = true;
      this.connected      = false;
      
      AppController.connectToSelectedProfileDevices({
        success : function(){
          // start fetching sequence
          that.initialConnect = false;
          that.connected = true;
          
          if(that.profileModel){
            that.profileModel.startTruckFetchLoop();
            that.updateWeightData();
          }
        },
        error   : function(errorModel){
          that.initialConnect = false;
          that.connected = true;
          that.updateWeightData();
          AppController.showErrorMessage(errorModel.message);
        }
      });
    },
    
    /**
     * Updates the truck weight data and renders any data associated to those elements.
     */
    updateWeightData: function(){
      var data,
          template,
          templateString,
          weightBreakdownHtml;
      
      // make sure the profile model is up to date
      this.refreshProfileModel();
      
      data  = {
        profileModel         : this.profileModel,
        inInitialSetupState  : AppController.inInitialSetupState(),
        headerTitle          : (this.profileModel === null) ? '' : this.profileModel.get("name"),
        initialConnect       : this.initialConnect,
        connected            : this.connected
      },
      
      // recompile weight-breakdown template
      // and only update that portion of the tmplWeight html data.
      template = _.template($("#tmplTruckWeight").html());
      templateString = template(data);
      
      weightBreakdownHtml = $(templateString).find(_modules.weightBreakdown.selector).html();
      _modules.weightBreakdown.element.html(weightBreakdownHtml);  
      
      // need to stop this view, if all devices are offline
      if(this.profileModel.isAllDevicesOffline()){
        this.stop();
      }
    }
  });
  
  return TruckWeightView;
});