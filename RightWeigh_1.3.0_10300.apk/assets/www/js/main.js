/**
 * Filename    : js/main.js
 * Author      : Brandon Sherette
 * Description : Configures requirejs and sets up any other configurations before
 *               initializing the App. 
 */
require.config({
  baseUrl: 'js/',
  
  paths: {
    jquery        : 'lib/jquery/jquery-min',
    underscore    : 'lib/underscore/underscore-min',
    backbone      : 'lib/backbone/backbone-min',
    localstorage  : 'lib/backbone/backbone.localStorage',
    sherettewebs  : 'lib/sherettewebs/sherettewebs',
    easing        : 'lib/easing/easing',
    ErrorModel    : 'lib/sherettewebs/models/ErrorModel',
    SettingsModel : 'models/settings/SettingsModel',
    BluetoothDeviceModel : 'models/bluetooth/BluetoothDeviceModel',
    BluetoothScanModel   : 'models/bluetooth/BluetoothScanModel',
    BluetoothFactory        : 'lib/sherettewebs/plugins/bluetooth/BluetoothFactory',
    BluetoothDeviceCollection  : 'collections/bluetooth/BluetoothDeviceCollection'
  }
});

// require files that need to be loaded right away
require([
  'jquery',
  'app', // app.js in the current directory that intializes the application.
  'AppEvents'
], function($, App, AppEvents){   
  // set local to true to display just in a web browser for some display debugging, false for mobile testing
  var local = false;
  
  // listen for when the device is ready to initilalize the application
  if(local){
    $(document).ready(function(){
      App.initialize();
    });
  }else{
    document.addEventListener('deviceready', function(){
      // add an event for when the application is paused (when home button is pressed for example)
      document.addEventListener('pause', AppEvents.onAppPause, false);
      document.addEventListener('resume', AppEvents.onAppResume, false);
      
      // keep the device from sleeping during operation
      if(window.plugins && window.plugins.insomnia && window.plugins.insomnia.keepAwake){
        window.plugins.insomnia.keepAwake();
      }
      
      // make sure document is ready for any jquery type items in any of the modules.
      $(document).ready(function(){
        App.initialize();
      });
    }, false);
  }
});