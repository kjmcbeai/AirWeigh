define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'router'
], function($, _, Backbone, AppController, Router){
  var VALIDATE_WEIGHT_REGEX = /^([0-9\.]+|)$/,
      VALIDATE_NAME_REGEX   = /[ a-zA-Z0-9]+$/,
      TruckConfigView;
  
  TruckConfigView = Backbone.View.extend({

    _inputValue: null,

    el: '#page-content',
    
    events: {
      'keyup .form-truck-config input'      : 'onFormUpdated',
      'click .config-window__footer button' : 'onNavClick',
      'keypress form'                       : 'onKeyboardPress'
    },
    
    /**
     * TruckAxleModel
     */
    model: null,
    
    formIsValid: false,

    initialize: function(){
      // router is a circular dependency, so require it
      Router = require("router");
      this.model = this.loadModel();
    },
    
    /**
     * Loads the model for this view.
     * @returns {TruckAxleModel} the TruckAxleModel to work with in this view, returns null if TruckAxleModel wasn't found.
     */
    loadModel: function(){
      var selectedProfile = AppController.getSelectedProfile(),
          truckAxleId     = selectedProfile.get("axleIdBeingEdited"),
          truckDevices    = selectedProfile.get("truckDevices"), 
          truckAxles, truckAxle,
          x, y;
      
      if(selectedProfile === null || truckAxleId === 0){
        //AppController.showErrorMessage("Selected profile not found.");
        return null;
      }

      for(x = 0; x < truckDevices.length; x+= 1){
        truckAxles = truckDevices.at(x).get("truckWeightModel").get("truckAxles");
        // iterate through the truckAxles
        for(y = 0; y < truckAxles.length; y+= 1){
          truckAxle = truckAxles.at(y);
          
          if(truckAxle.get("id") === truckAxleId){
            // found match
            return truckAxle;
          }
        }//--end for truckAxles
      }//--end for truckDevices
      
      // no match found at all, return null
      return null;
    },
    
    /**
     * Stops any animation or anything else needed to stop (doesn't close the data, basically pauses any action).
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
      /*
      this.model.unbind();
      this.model = null;
      */
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
     * The event that the form of this view has been updated.
     * @param {event} event the event that occurred.
     */
    onFormUpdated: function(event){
      var $form    = $(event.currentTarget.form),
          $element = $(event.currentTarget),
          elementName  = $element.attr('name'),
          elementValue = $element.val(),
          isValid  = this.validateForm();
    },
    
    validateForm: function(){
      var $form   = this.$el.find("form"),
          $alertWeight = $form.find("#alertWeight"),
          $name = $form.find("#name"),
          $warningWeight = $form.find("#warningWeight"),
          isValid = true;
      
      // validate form
      if($form.find('input[type="text"].required').each(function(index){
        if($(this).val().length === 0){
          $(this).addClass("invalid");
          isValid = false;
        }else{
          $(this).removeClass("invalid");
        }
      }));
      
      // validate axle name
      if($name.val().match(VALIDATE_NAME_REGEX)){
        $name.removeClass("invalid");
      }else{
        $name.addClass("invalid");
        isValid = false;
      }
      
      // validate alert weight
      if(!$alertWeight.val() || $alertWeight.val().match(VALIDATE_WEIGHT_REGEX)){
        $alertWeight.removeClass("invalid");
        
        // update warning text
        if($alertWeight.val().length > 0){
          $warningWeight.parent().show();
        }else{
          $warningWeight.parent().hide();
          $warningWeight.val("");
        }
      }else{
        $alertWeight.addClass("invalid");
        isValid = false;
      }
      
      // validate warning
      if(!$alertWeight.val() || ($warningWeight.val().match(VALIDATE_WEIGHT_REGEX) && Number($warningWeight.val()) < Number($alertWeight.val()))){
        $warningWeight.removeClass("invalid");
      }else{
        $warningWeight.addClass("invalid");
        isValid = false;
      }

      // disabled will be the inverse of isValid, so use !isValid instead
      this.$el.find('.form-button-bar .button-save').prop('disabled', !isValid);
      
      return isValid;
    },
    
    /**
     * The event that a navigation button has been pressed (or save and cancel).
     * @param {Event} event the event that was triggered.
     */
    onNavClick: function(event){
      var action  = $(event.target).data('action');
        
      if(action === 'cancel'){  
        // cancel action
        Router.closeModalWindow("axleConfig");
      }else if(action === 'save' && this.validateForm()){
        this.model.set("name", this.$el.find('#name').val());
        this.model.set("alertWeight", this.$el.find("#alertWeight").val().trim());
        this.model.set("warningWeight", this.$el.find("#warningWeight").val().trim());
        
        AppController.saveCurrentSettings({
          success: function(){
            AppController.showMessage("Axle Configuration Saved");
            Router.closeModalWindow("axleConfig");
          },
          
          error: function(errorModel){
            AppController.showErrorMessage(errorModel.message);
          }
        });
      }
    },

    /**
     * Renders this view.
     */
    render: function(){
      var template;
  
      if(this.model === null){
        AppController.showErrorMessage("Truck axle data not found.");
        return this;
      }
      
      template = _.template($("#tmplTruckAxleConfig").html());
      this.$el.html(template({
        axleModel: this.model
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
    }
  });
  
  return TruckConfigView;
});