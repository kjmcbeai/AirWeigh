define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'models/profile/ProfileModel',
  'views/initial-setup/InitialSetupOutlineView',
  'views/initial-setup/InitialSetupInstallGuideView',
  'views/scan/ScanOutlineView',
  'views/scan/ScanListView',
  'views/sync/SyncDataView',
  'views/profile/ProfileCreateFormView',
  'require',
  'router'
], function($, _, Backbone, AppController, ProfileModel, InitialSetupOutlineView, InitialSetupInstallGuideView, ScanOutlineView, ScanListView, SyncDataView, ProfileCreateFormView, require, Router){
  var InitialSetupView = Backbone.View.extend({
    navStateMap: [], // keeps the current state of the navigation menu (disabled or not, so when loading is finished, it is put back in its correct state.
    
    subviews: [
      {
        name     : 'initial-setup-outline',
        class    : InitialSetupOutlineView,
        //backButtonTitle : 'Cancel',
        nextButtonTitle : "Let's go! <b>&#62;</b>"
      },
      {
        name  : 'initial-setup-install',
        class : InitialSetupInstallGuideView,
        backButtonTitle : 'Back',
        nextButtonTitle : 'Step two! <b>&#62;</b>'
      },
      {
        name  : 'scan-outline',
        class : ScanOutlineView,
        backButtonTitle : 'Back',
        nextButtonTitle : 'Step three! <b>&#62;</b>'
      },
      {
        name  : 'profile-form',
        class : ProfileCreateFormView,
        backButtonTitle : 'Back',
        nextButtonTitle : "Finished!"
      }
    ], // the subviews for this view
    
    subviewEvents: [], // keeps track of any events a subview may trigger during its lifetime.
    
    curSubviewIndex: 0, // the current index of the subview that the user is viewing.
    
    curSubviewInstance: null, // the instance of the current subview the user is viewing.
    
    el: '#page-content',
    
    events: {
      'click .config-window__footer button': 'onNavClick'
    },
    
    settingsModel: null,
    
    /**
     * Initializes this object's properties and any other configurations for when first created.
     */
    initialize: function(){
      var eventsModel = AppController.getEventsModel(),
          x;
      
      // router is a circular dependency, so require it
      Router = require("router");
      
      this.subviewEvents = [
        {
          event    : 'scansync:completed',
          callback : this.onScanSyncCompleted
        },
        {
          event    : 'formElementUpdated:profile',
          callback : this.onProfileFormUpdated
        }
      ];
      
      // add the subview events to the app events model
      //eventsModel.on('selected:device', this.onScanDeviceSelected, this);
      for(x = 0; x < this.subviewEvents.length; x+= 1){
        eventsModel.on(this.subviewEvents[x].event, this.subviewEvents[x].callback, this);
      }
      
      //this.tmpSettingsModel = new SettingsModel();
      this.settingsModel = AppController.getSettings();
      // create a new profilemodel to work with during the setup process
      this.settingsModel.setProfileInEditMode(new ProfileModel());
      
      // inititialize curSubView
      this.curSubviewIndex = 0;
      this.curSubviewInstance = null;
    }, // end /initialize/
    
    
    /**
     * Closes the view.
     */
    close: function(){
      var eventsModel = AppController.getEventsModel(),
          key;
      
      this.stop();
      
      // remove subevent callbacks and close subview instance
      for(key in this.subviewEvents){
        eventsModel.off(this.subviewEvents[key].event, this.subviewEvents[key].callback, this);
      }
      this.curSubviewInstance.close();
      
      this.settingsModel.getProfileInEditMode().unbind();
      this.settingsModel.setProfileInEditMode(null);
      
      this.$el.empty();
      this.$el.unbind();
    },
    
    stop: function(){
      
    },
    
    onStartLoading: function(){
      var that = this;
      
      // keep track of buttons current state
      this.navStateMap = [];
      
      this.$el.find('.nav-button-bar button').each(function(index){
        var $this = $(this);
        
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
     * On the event that the config view menu navigation button was clicked. 
     * Closes the previous view and opens the correct next view.
     * @param {Event} event the event that was triggered.
     */
    onNavClick: function(event){
      var action  = $(event.target).data('action'),
          that    = this;
      
      // check to see if cancel was pressed
      if(this.curSubviewIndex === 0 && action === 'back'){
        // back button not allowed in first slide, prevent further execution
        return;
      }
      
      if(this.curSubviewIndex === this.subviews.length - 1 && action === 'next'){
        // last slide, so save configuration settings
        this.settingsModel.get("profiles").add(this.settingsModel.getProfileInEditMode());
        
        AppController.updateSettings(this.settingsModel, {
          success: function(settingsModel, response, options){
            AppController.showMessage('Settings Saved');
            Router.closeModalWindow("initialSetup");
          },
          
          error: function(settingsModel, response, options){
            AppController.showErrorMessage('Error Saving Settings');
          }
        });
        
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
    
    onScanSyncCompleted: function(){
      // enable next button if there is at least 1 bluetooth device in profileInEditMode
      if(this.settingsModel.getProfileInEditMode().get("truckDevices").length > 0){
        // move to next slide by automatically triggering next button
        this.$el.find('.button-next').prop('disabled', false);
        this.$el.find('.button-next').trigger("click");
      }else{
        this.$el.find('.button-next').prop('disabled', true);
      }
    },
    
    /**
     * The event that the truck configuration view form has been updated.
     * @param {String} elementName the name of the element that was updated.
     * @param {Mixed}  elementValue the value of the element updated.
     * @param {Boolean} formIsValid whether or not the form is valid or not.
     */
    onProfileFormUpdated: function(elementName, elementValue, formIsValid){
      formIsValid = (formIsValid === true) ? true : false;
      // disabled will be the inverse of isValid, so use !isValid instead
      this.$el.find('.button-next').prop('disabled', !formIsValid);
    },
    
    /**
     * Renders this view to the screen.
     */
    render: function(){
      var data,
          template,
          subviewDetails;

      // configure data for template
      data = {
        navigation: {
          backAttrs: (this.curSubviewIndex > 0) ? '' : '', // removed disabled portion, now first view has a workable cancel button
          nextAttrs: (this.curSubviewIndex < this.subviews.length - 1) ? '' : 'disabled'
        }
      };
      // apply template
      template = _.template($('#tmplInitialSetup').html());
      this.$el.html(template(data));
      
      // apply the subview to the template subview content section
      subviewDetails  = this.subviews[this.curSubviewIndex];
      if(subviewDetails.name === "scan-outline"){
        this.$el.find('.button-next').prop('disabled', true);
      }
      
      this.curSubviewInstance = new subviewDetails.class({
        el: '.config-window__content .subview-element'
      }); 
      
      this.curSubviewInstance.render();
      
      // update any navigation buttons based on subview details if viable
      if(subviewDetails.hasOwnProperty('backButtonTitle')){
        this.$el.find('.button-back').html(subviewDetails.backButtonTitle);
      }else{
        this.$el.find('.button-back').html("");
        this.$el.find('.button-back').prop("disabled", true);
      }
      
      if(subviewDetails.hasOwnProperty('nextButtonTitle')){
        this.$el.find('.button-next').html(subviewDetails.nextButtonTitle);
      }
        
      // return this for chaining
      return this;
    }
  });
  
  return InitialSetupView;
});