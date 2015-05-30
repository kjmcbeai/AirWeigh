define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'router',
  'require'
], function($, _, Backbone, AppController, Router, require){  
  var ProfileCreateFormView = Backbone.View.extend({
    el: '#page-content',
    
    events: {
      'click .nav-button'                           : 'onNavClick',
      'keyup .form-truck-profile input'             : 'onFormUpdated',
      'click .weight-switch input[type="checkbox"]' : 'onUnitMeasurementUpdated',
      'keypress form'                               : 'onKeyboardPress'
    },
    
    model: null,
    
    /**
     * Initializes this view.
     */
    initialize: function(){
      Router = require('router');
      
      if(this.model === null){
        this.model = AppController.getSettings().getProfileInEditMode();
      }
    },
    
    /**
     * Stops any action in this view (this doesn't unbind and empty the view, close does.
     */
    stop: function(){
      
    },
    
    /**
     * Closes this view.
     */
    close: function(){
      this.stop();
      this.$el.empty();
      this.$el.unbind();
      this.model.unbind();
      this.model = null;
    },
    
    /**
     * The event that a navigation button was pressed for this view.
     * @param {Event} event the event that triggered this method.
     */
    onNavClick: function(event){
      // get action of the event
      var action   = $(event.target).data('action');

      if(action === "save"){
        this.onSave();
      }else if(action === "cancel"){
        this.onCancel();
      }else if(action === "config-image"){
        this.openTruckConfigImageView(); 
      }else if(action === "select-devices"){
        this.openScanSyncView();
      }else if(action === "delete-profile"){
        this.deleteProfile();
      }else{
        window.showDebugMessage("Invalid Action in ProfileFormView.");
      }
    },
    
    openTruckConfigImageView: function(){
      Router.openModalWindow("truckConfigImage", "truck-config-image-view");
    },
    
    openScanSyncView: function(){
      Router.openModalWindow("scanSync", "scan-sync-view");
    },
    
    deleteProfile: function(){
      var that = this;
      
      AppController.deleteSettings({
          success: function(settingsModel, response, options){
            
            AppController.showMessage('Settings Successfully Deleted');
            Router.closeModalWindow("editProfile");
          },
          
          error: function(settingsModel, response, options){
            AppController.showMessage('Error Trying to Delete Settings');
            console.log('Error Deleting: ' + response.msg);
          }
        });
    },
    
    /**
     * The event that the cancel button was pressed.
     */
    onCancel: function(){
      AppController.getSettings().setProfileInEditMode(null);
      Router.closeModalWindow("editProfile");
    },
    
    /**
     * The event that the save button was pressed.
     */
    onSave: function(){
      var that     = this,
          settings = AppController.getSettings();
      
      // need to update settings to replace
      this.model.resetWeight();
      settings.get("profiles").set([this.model], {
        remove: false
      });
      
      AppController.saveCurrentSettings({
        success: function(){
          settings.setProfileInEditMode(null);
          AppController.showMessage("Settings Saved"); 
          Router.closeModalWindow("editProfile");
        }
      });
    },
    
    
    /**
     * The event the unit measurement toggle has been updated.
     * @param {Event} event the event that was triggered.
     */
    onUnitMeasurementUpdated: function(event){
      // find out which value was selected
      var unitMeasurement = $(event.currentTarget).is(":checked") ? "kg" : "lbs";
      
      this.model.set("unitMeasurement", unitMeasurement);
    },
    
    
    onKeyboardPress: function(event){
      // treat enter key as done editing text, not as enter
      if(event.keyCode === 13){
        event.preventDefault();
        // call blur to have the element to lose focus
        $(":focus").blur();
      }
    },
    
    /**
     * The event that the form has been updated.
     * @param {Event} event the event that triggered this method.
     */
    onFormUpdated: function(event){
      var $element = $(event.currentTarget),
          elementName  = $element.attr('name'),
          elementValue = $element.val(),
          isValid  = true,
          profile  = AppController.getSettings().getProfileInEditMode();
      
      isValid = this.validateForm();

      // update the profile model
      profile.set(elementName, elementValue);
      
      // trigger form changed events
      AppController.getEventsModel().trigger('formElementUpdated:profile', elementName, elementValue, isValid);
    },
    
 
    /**
     * Validates this view's form.
     * @returns {Boolean} true if form is valid, false otherwise.
     */
    validateForm: function(){
      var isValid = true,
          $form    = $('form[name="form-truck-profile"]');
      
      // validate form
      if($form.find('input[type="text"].required').each(function(index){
        if($(this).val().length === 0){
          isValid = false;
        }
      }));

      // disabled will be the inverse of isValid, so use !isValid instead
      this.$el.find('.form-button-bar .button-save').prop('disabled', !isValid);
      
      return isValid;
    },
    
    
    /**
     * Renders this view.
     * @returns {ProfileFormView} the class itself used for chaining.
     */
    render: function(){
      var template;
      
      template = _.template($('#tmplProfileEditForm').html()); 
      
      this.$el.html(template({
        APP_VERSION: AppController.getAppVersion(),
        inInitialSetupState: AppController.inInitialSetupState(),
        profileModel: this.model
      }));
      
      // focus the first element
      $("input").focus(function(){
        var $this = $(this);
        window.setTimeout(function(){
          $this.select();
        }, 100);
      });
      $("input[autofocus]").trigger("focus");
      
      // automatically check and see if form is validated
      this.validateForm();
      
      return this;
    }
  });
  
  return ProfileCreateFormView;
});