define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'router',
  'require'
], function($, _, Backbone, AppController, Router, require){
  var ConnectionStatusView = Backbone.View.extend({
    el: "#page-content",
    
    events: {
      'click .nav-button-bar button': 'onNavClick'
    },
    
    profileModel: null,
    
    /**
     * Initializes the view, this is called during the object creation process.
     */
    initialize: function(){
      Router = require('router');
      //this.profileModel = AppController.getSelectedProfile();
      AppController.getEventsModel().on('bluetoothdevice:statuschanged', this.render, this);
    },
    
    stop: function(){
      
    },
    
    close: function(){
      this.stop();
      AppController.getEventsModel().off('bluetoothdevice:statuschanged', this.render);
      this.$el.empty();
      this.$el.unbind();
    },
    
    onNavClick: function(event){
      // get the view
      var action = $(event.target).data('action');
      
      switch(action){
        case 'close':
          Router.closeModalWindow("connectionStatus");
          break;
          
        default:
          window.showErrorMessage("Action '" + action + "' Not Available");
      }//--end switch action
    },//--end /onNavClick/
    
    /**
     * Renders the view.
     * @returns {ConnectionStatusView} returns this object for chaining.
     */
    render: function(){
      var template,
          data = {
            truckDevices : AppController.getSelectedProfile().get("truckDevices")
          };
      
      template = _.template($("#tmplStatusConnection").html());
      this.$el.html(template(data));
      
      // return this for chaining
      return this;
    }
  });
  
  return ConnectionStatusView;
});