define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'router',
  'require'
], function($, _, Backbone, AppController, Router, require){
  var VALIDATE_WEIGHT_REGEX = /^([0-9\.]+|)$/,
      TruckTotalWeightConfigView;
  
  TruckTotalWeightConfigView = Backbone.View.extend({
    el: "#page-content",
    
    events: {
      'keyup .form-truck-config input'      : 'onFormUpdated',
      'click .config-window__footer button' : 'onNavClick',
      'keypress form'                       : 'onKeyboardPress'
    },
    
    /**
     * ProfileModel
     */
    model: null,
    
    formIsValid: false,
    
    initialize: function(){
      // router is a circular dependency, so require it
      Router = require("router");
      this.model = this.loadModel();
    },
    
    loadModel: function(){
      return AppController.getSelectedProfile();
    },
    
    stop: function(){
      
    },
    
    close: function(){
      this.stop();
      this.$el.unbind();
      this.$el.empty();
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
      var action  = $(event.target).data('action'),
          that    = this,
          inputValue = this.$el.find('#axle-input').val();
        
      if(action === 'cancel'){  
        // cancel action
        Router.closeModalWindow("truckTotalWeightConfig");
      }else if(action === 'save' && this.validateForm()){
        this.model.set("totalWeightAlert", this.$el.find("#alertWeight").val().trim());
        this.model.set("totalWeightWarning", this.$el.find("#warningWeight").val().trim());
        
        AppController.saveCurrentSettings({
          success: function(){
            AppController.showMessage("Total Weight Configuration Saved");
            Router.closeModalWindow("truckTotalWeightConfig");
          },
          
          error: function(errorModel){
            AppController.showErrorMessage(errorModel.message);
          }
        });
      }
    },
    
    render: function(){
      var template;
  
      if(this.model === null){
        AppController.showErrorMessage("Truck axle data not found.");
        return this;
      }
      
      template = _.template($("#tmplTruckTotalWeightConfig").html());
      this.$el.html(template({
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
      
      // return this for chaining
      return this;
    }
  });
  
  return TruckTotalWeightConfigView;
});