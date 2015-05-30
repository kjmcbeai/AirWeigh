/**
 * Scan View is the view that deals with scanning bluetooth devices and selecting one to connect to.
 * This view is a subview, so it has a controllerView for dispatching controller events.
 */
define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'BluetoothDeviceModel',
  'BluetoothDeviceCollection',
  'BluetoothScanModel'
], function($, _, Backbone, AppController, BluetoothDeviceModel, BluetoothDeviceCollection, BluetoothScanModel){  
  var ScanListView = Backbone.View.extend({
    model: null,
    
    selectedBluetoothDevices: null,
    
    isLoading: true, // whether or not the model is fetching data or not
    
    firstRun : true, // whether or not this is the first time trying to retrieve data or not
    
    jqueryMap: {
      rescanButton: null
    },
    
    initialize: function(){
      this.firstRun = true;
      this.model = new BluetoothScanModel();
      this.selectedBluetoothDevices = new BluetoothDeviceCollection();
      
      // bind the change event, so that when the model data is fetched, it calls the render method.
      this.model.bind('change', this.onModelChange, this);
      this.scanForDevices();
    },
    
    /**
     * The event that the model has changed.
     */
    onModelChange: function(){
      this.stopLoading();
      this.render();
      this.$el.find('.header__text').text('Select Device');
      this.$el.find('.header__text').addClass("scan-header");
    },
    
    el: '#page-content',
    
    controllerView: null,
    
    events: {
      "click .device-list li.selectable": "onDeviceSelected",
      "click .rescan": "scanForDevices",
      "click .scan-header": "scanForDevices"
    },
    
    onDeviceSelected: function(event){
      var $element = $(event.currentTarget),
          deviceAddress = null,
          deviceName    = null,
          bluetoothDeviceModel;
  
      deviceAddress = $element.data('address');
      deviceName    = $element.data('name');
      
      bluetoothDeviceModel = this.selectedBluetoothDevices.findWhere({
        address: deviceAddress
      });
      
      if(bluetoothDeviceModel){
        // already selected the device, so the user is wanting to remove from the list
        this.selectedBluetoothDevices.remove(bluetoothDeviceModel);
      }else{
        // haven't been added yet, so the user is wanting to add it
        bluetoothDeviceModel = new BluetoothDeviceModel({
          name: deviceName,
          address: deviceAddress
        });
        
        // bluetoothDevices will not be assigned a real db id, so apply the cid to it.
        bluetoothDeviceModel.set('id', bluetoothDeviceModel.cid);
        
        this.selectedBluetoothDevices.add(bluetoothDeviceModel);
      }
      
      // remove the hightlight class only if selected again (this allows for multi device selecting
      if($element.hasClass('highlight-box')){
        // already been highlighted so remove
        $element.removeClass('highlight-box');
        $element.find(".highlight-checkmark").hide();
      }else{
        $element.addClass('highlight-box');
        $element.find(".highlight-checkmark").show();
      }
      
      AppController.getEventsModel().trigger('selected:device', this.selectedBluetoothDevices);
    },
    
    /**
     * Rescans for bluetooth devices.
     * @param {Event} event the event that was triggered.
     */
    scanForDevices: function(event){
      var that = this;
      this.startLoading();
      
      // start fetching the data for the view
      this.model.fetch({
        inDemoMode  : AppController.inDemoMode(),
        testFailure : false,
        testTimeout : false,
        error       : function(model, response, options){
          that.stopLoading();
          AppController.showErrorMessage(response.msg);
          that.$el.find('.header__text').text('Error');
        }
      });
    },
    
    /**
     * Starts the loading process for this views
     * @returns {undefined}
     */
    startLoading: function(){
      this.isLoading = true;
      AppController.getEventsModel().trigger('startLoading:scan');
      this.toggleButtons(true); // make sure buttons are disabled during loading
      this.$el.find('.device-list').html('');
      this.$el.find('.header__text').text('Scanning for Devices');
      AppController.startLoadingIcon();
    },
    
    stopLoading: function(){
      this.firstRun = false;
      AppController.stopLoadingIcon();
      this.isLoading = false;
      this.toggleButtons(false);
      AppController.getEventsModel().trigger('stopLoading:scan');
    },
    
    /**
     * Toggles the buttons in the view based on the specified disabled param.
     * @param {boolean} disable true to disable buttons, false otherwise.
     */
    toggleButtons: function(disable){      
      this.$el.find('button').prop('disabled', disable);
      // next should always be disabled until device is selected by user
      this.$el.find('button.button-next').prop('disabled', true);
    },
    
    stop: function(){
      
    },
    
    close: function(){
      this.stop();
      this.$el.unbind();
      this.$el.empty();
      this.model.unbind();
      this.model = null;
    },
    
    render: function(){
      var data,
          template;

      data = {
        settings            : AppController.getSettings(),
        inInitialSetupState : AppController.inInitialSetupState(),
        foundDevices        : this.model.get('devices'),
        cachedTruckDevices  : AppController.getSettings().get("cachedTruckDevices"),
        firstRun            : this.firstRun
      };

      template = _.template($("#tmplScanList").html());
      
      this.$el.html(template(data));
      
      // toggle buttons if not loading
      if(this.isLoading){
        this.toggleButtons(true);
      }else{
        this.toggleButtons(false);
      }

      // return this for chaining
      return this;
    }
  });
  
  return ScanListView;
});