define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'router'
], function($, _, Backbone, AppController, Router){
  var REGEXP_EMAIL = /^\S{2,}@\S{2,}\.\w{2,}$/;
  
  var SendView = Backbone.View.extend({
    el: '#page-content',
    
    formIsValid: false,

    events: {
      'click .nav-button' : 'onNavClick',
      'keyup input'       : 'onFormUpdated',
      'keypress input'    : 'onKeyboardPress'
    },
    
    profileModel: null,
    

    /**
     * Initializes this object's properties and any other configurations for when first created.
     */
    initialize: function(){
      this.profileModel = AppController.getSelectedProfile();
      // router is a circular dependency, so require it
      Router = require("router");
    }, // end /initialize/

    /**
     * Stops any animations or timers in this view. Useful for modal window openings.
     */
    stop: function(){
      
    },
    
    /**
     * Closes the view.
     */
    close: function(){
      this.stop();
      this.$el.empty();
      this.$el.unbind();
    },
    
    /**
     * @param {Event} event the event that was triggered.
     */
    onNavClick: function(event){
      var action  = $(event.target).data('action'),
          that = this;
        
      if(action === 'cancel'){
        Router.closeModalWindow("send");
      }else if(action === 'send'){
        this.validateForm();
        
        if(this.formIsValid){
          this.sendEmail();
        }
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
      this.validateForm();
    },
    
    validateForm: function(){
      // validate form
      var $emailTextbox = this.$el.find("#send-email-address"),
          emailAddress  = $emailTextbox.val();
      
      if(emailAddress.match(REGEXP_EMAIL)){
        this.$el.find(".button-save").prop("disabled", false);
        $emailTextbox.addClass("valid");
        $emailTextbox.removeClass("invalid");
        this.formIsValid = true;
      }else{
        this.$el.find(".button-save").prop("disabled", true);
        $emailTextbox.addClass("invalid");
        $emailTextbox.removeClass("valid");
        this.formIsValid = false;
      }
    },

    /**
     * Send email
     */
    sendEmail: function(){
      var emailDetails = this.composeEmailDetails();
      //window.location.href = link;
      
      /* UPDATED BY BRANDON SHERETTE ON 2015.3.16 v1.2.6 to use new email plugin */
      cordova.plugins.email.isAvailable(function(isAvailable){
        if(isAvailable){
          // send email
          cordova.plugins.email.open(emailDetails, this.onEmailClose, this);
        }else{
          // notify user that email cannon be performed
          AppController.showErrorMessage("Your device doesn't support email or this device doesn't have an email address associated to it.");
        }
      });
    },//--end /sendEmail/
    
    /**
     * The event that the email client has been closed.
     */
    onEmailClose: function(){
      
    },
    
    /**
     * Composes the details for the email to be sent.
     * @returns {PlainObject} the email details to be used.
     */
    composeEmailDetails: function(){
      var emailAddressTo = this.$el.find('#send-email-address').val(), // TODO: validate for valid email
          body,
          units = this.profileModel.get("unitMeasurement"),
          bluetoothDevice,
          truckWeightModel,
          emailDetails = {
            to          : [emailAddressTo], // email addresses for TO field
            cc          : [], // email addresses for CC field
            bcc         : [], // email addresses for BCC field
            attachments : [], // file paths or base64 data streams
            subject     : "Right Weigh Load Scales App", // subject of the email
            body        : "", // email body (for HTML, set isHtml to true)
            isHtml      : true // indicats if the body is HTML or plain text
          };
      
      body = "<!DOCTYPE html><html><meta name='viewport' content='width=device-width' /><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /><head></head><body>";
      body+= "<p>Truck Profile Name: '" + this.profileModel.get("name") + "'</p>";
      this.profileModel.get("truckDevices").each(function(truckDevice){
        // bluetoothDevice data
        bluetoothDevice = truckDevice.get('bluetoothDeviceModel');
        
        body += "<p>Device Name: " + truckDevice.get("name") + "</p>";
        
        // truckWeight data
        truckWeightModel = truckDevice.get("truckWeightModel");
        truckWeightModel.get("truckAxles").each(function(truckAxle){
          body += "<p>Truck Axle Name: " + truckAxle.get("name") + "<br />";
          body += "Truck Axle Weight: " + truckAxle.get("weight") + " " + units + "<br />";
          body += "Truck Axle Alert Weight: " + truckAxle.get("alertWeight") + " " + units + "</p>";
        });//--end foreach truckAxle
      });//--end foreach truckDevice
            
      body+= "<p>Total Weight: " + this.profileModel.getTotalWeight() + units + "</p>";
      body+= "</body></html>";
      
      emailDetails.body = body;
      
      return emailDetails;
    },//--end /composeEmailDetails/

    /**
     * Renders this view.
     * @returns {SendView} this view for chaining.
     */
    render: function(){
      var data = {},
          template;
      
      // profileModel should not be null
      if(this.profileModel === null){
        AppController.showErrorMessage("Profile Not Found");
        // don't let the view render, since this shouldn't be happening to begin with
        return this;
      }
      
      template = _.template($("#tmplSend").html());
      this.$el.html(template(data));
      
      this.validateForm();
      
      // return this for chaining
      return this;
    }
  });
  
  return SendView;
});