define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'router',
  'require'
], function($, _, Backbone, AppController, Router, require){
  var TruckDeviceEditNameView = Backbone.View.extend({
    el: '#page-content',
    
    model: null,
    
    initialize: function(){
      Router = require("router");
      
      this.model = this.loadModel();
    },
    
    events: {
      'keyup .form input'                   : 'onFormUpdated',
      'click .config-window__footer button' : 'onNavClick',
      'keypress form'                       : 'onKeyboardPress'
    },
    
    /**
     * Loads the model for this view.
     * @returns {TruckDeviceModel} the TruckDeviceModel that was found being the one to be edited. Returns null if not model was found.
     */
    loadModel: function(){
      var profileModel,
          idToFind,
          truckDevices,
          truckDevice,
          x;
      
      // fetch the id being edited
      profileModel = AppController.getSelectedProfile();
      truckDevices = profileModel.get("truckDevices");
      idToFind     = profileModel.get("truckDeviceIdBeingEdited");
      
      for(x = 0; x < truckDevices.length; x+= 1){
        truckDevice = truckDevices.at(x);
        if(truckDevice.get("id") === idToFind){
          return truckDevice;
        }
      }//end foreach truckDevice
      
      return null;
    },//--end /loadModel/
    
    stop: function(){
      
    },
    
    close: function(){
      this.stop();
      this.$el.unbind();
      this.$el.empty();
    },
    
    
    /**
     * The event that a navigation button has been pressed (or save and cancel).
     * @param {Event} event the event that was triggered.
     */
    onNavClick: function(event){
      var action  = $(event.target).data('action'),
          that    = this,
          inputValue = this.$el.find("input[name='truckdevice:name']").val();
        
      if(action === 'cancel'){  
        // cancel action
        Router.closeModalWindow("truckDeviceEditName");
      }else if(action === 'save' && inputValue.match(/[ a-zA-Z0-9\:]+$/)){
        this.model.set("name", inputValue);
        
        AppController.saveCurrentSettings({
          success: function(){
            AppController.showMessage("Truck Device Named Saved");
            Router.closeModalWindow("truckDeviceEditName");
          },
          
          error: function(errorModel){
            AppController.showErrorMessage(errorModel.message);
          }
        });
      }
    },
    
    onKeyboardPress: function(event){
      // treat enter key as done editing text, not as enter
      if(event.keyCode === 13){
        event.preventDefault();
        // call blur to have the element to lose focus
        $(":focus").blur();
      }
    },
    
    onFormUpdated: function(event){
      var $form    = $(event.currentTarget.form),
          $element = $(event.currentTarget),
          elementName  = $element.attr('name'),
          elementValue = $element.val(),
          isValid  = this.validateForm();
    },
    
    validateForm: function(){
      var $form   = this.$el.find("form"),
          isValid = true;
      
      // validate form
      if($form.find('input[type="text"].required').each(function(index){
        if($(this).val().length === 0){
          isValid = false;
        }
      }));
      
      return isValid;
    },
    
    render: function(){
      var template;
      
      if(this.model === null){
        AppController.showErrorMessage("Truck Device Not Found.");
        
        return this;
      }
      
      template = _.template($("#tmplTruckDeviceEditName").html());
      this.$el.html(template({
        truckDeviceModel: this.model
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
      
      // return this for chaining
      return this;
    }//--end /render/
  });
  
  return TruckDeviceEditNameView;
});