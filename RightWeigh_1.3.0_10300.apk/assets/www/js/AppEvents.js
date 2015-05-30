define([
  'AppController',
  'AppBluetoothController',
  'require',
  'router',
  'views/truck/TruckWeightView'
], function(AppController, AppBluetoothController, require, Router, TruckWeightView){
  var AppEvents;
  
  Router = require('router');
  
  /* AppController Events */  
  AppController.getEventsModel().on('app:beforeDeleteSettings', function(response){
    AppEvents.onBeforeDeleteSettings(response);
  });
  AppController.getEventsModel().on('app:afterDeleteSettings', function(response){
    AppEvents.onAfterDeleteSettings(response);
  });
  
  
  AppEvents = {
    onBeforeDeleteSettings: function(response){
      response = response || {};

      // disconnect from the device if viable
      AppController.disconnectFromSelectedProfileDevices({
        success: function(){
          //window.showDebugMessage('Delete Before Settings Disconnect Successful.'); 
       },
        error: function(errorModel){
          window.showDebugMessage('Delete Before Settings Disconnect Failed. Message: ' + errorModel.message);
        }
      });//--end /AppController.disconnectFromSelectedProfileDevices/
    },
    
    onAfterDeleteSettings: function(response){
      // do nothing for now, but it's ready to go if needed
    },
    
    /**
     * On the event that the application has just entered a pause state.
     * Should be disconnecting from any bluetooth device at this point.
     */
    onAppPause: function(){      
      //window.showDebugMessage("onAppPause");
      // close the current view and any modal views present
      Router.closeAllModalWindows(false); // false to make sure current view isnt rendered again
      Router.closeCurrentView(); 
      
      AppController.disconnectFromSelectedProfileDevices();
    },
    
    
    /**
     * The event that the application has resumed from a pause state.
     */
    onAppResume: function(){
      //window.showDebugMessage('App Resumed');
      // start the user back at the home/main view
      Router.showView(new TruckWeightView());
    }
  };
  
  return AppEvents;
});