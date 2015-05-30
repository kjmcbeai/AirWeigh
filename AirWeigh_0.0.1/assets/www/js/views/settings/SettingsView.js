define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'require',
  'router'
], function($, _, Backbone, AppController, require, Router){
  var SettingsView = Backbone.View.extend({    
    el: '#page-content',
    
    events: {
      'click .tmpl-nav': 'onNavClick'
    },
    
    initialize: function(){
      // router is a circular dependency, so require it
      Router = require('router');
    },
    
    onNavClick: function(event){
      // get the view
      var view = $(event.target).data('view'),
          that = this;

      if(view === 'deletesettings'){
        AppController.deleteSettings({
          success: function(settingsModel, response, options){
            
            AppController.showMessage('Settings Successfully Deleted');
            Router.closeModalWindow(that);
          },
          
          error: function(settingsModel, response, options){
            AppController.showMessage('Error Trying to Delete Settings');
            console.log('Error Deleting: ' + response.msg);
          }
        });
      }else if(view === "editProfile"){
        // set the profile in edit mode to the current profile
        AppController.getSettings().setProfileInEditMode(AppController.getSelectedProfile());
        Router.openViewModalWindow("editProfile");
      }else{
        Router.openViewModalWindow(view);
      }
    },
    
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
     * Renders the view and adds it to the el dom object.
     * @returns {SettingsView} returns this object for chaining.
     */
    render: function(){
      var data,
          template;
  
      data = {
        settings: AppController.getSettings(),
        inInitialSetupState: AppController.inInitialSetupState()
      };
      
      template = _.template($("#tmplSettings").html());
      
      this.$el.html(template(data));
      
      // return this for chaining
      return this;
    }
  });
  
  return SettingsView;
});