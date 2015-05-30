/**
 * Filename    : js/app.js
 * Author      : Brandon Sherette
 * Description : The main controller for the application.
 */
define([
  'jquery',
  'underscore',
  'backbone',
  'router',
  'AppController'
], function($, _, Backbone, Router, AppController){
  var App;
  
  App = {
    /**
     * Initializes the application.
     */
    initialize: function(){
      var settings = AppController.getSettings();
      AppController.startLoadingIcon();
      
      // fetch AppController Settings
      settings.fetch({
        success: function(){          
          AppController.stopLoadingIcon();
          Router.initialize();
        },
        
        error: function(settings, response, options){
          AppController.stopLoadingIcon();
          response = response || '';
          
          // should be the only reason for an error is no record found
          if(response.toLowerCase() === 'record not found'){
            // everythign is ok
            Router.initialize();
          }else{
            AppController.showErrorMessage('Failed to load settings.');
          }
        }
      }); 
    }
  };
  
  return App;
});