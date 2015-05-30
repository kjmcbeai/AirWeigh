define([
  'underscore',
  'backbone',
  'AppController',
  'BluetoothFactory',
  'ErrorModel',
  'require'
], function(_, Backbone, AppController, BluetoothFactory, ErrorModel, require){
  var _bluetoothPlugin  = BluetoothFactory.getInstance(),
      _isDisconnecting = false,
      /* CONSTANTS */
      CONNECT_ERROR_REFRESH_TIMER_LENGTH = 7000,
      _requireAppController,
      AppBluetoothController;
      
  _requireAppController = function(){
    if(AppController === undefined){
      AppController = require("AppController");
    }
  };
  
  /**
   * Application Bluetooth Controller
   * Deals with any application bluetooth connectivity in a singleton manner.
   */
  AppBluetoothController = {
    
    
    /**
     * Attempts to Connect to the device found in app settings.
     * @param {PlainObject} options the options to apply to connect.
     * @example AppBluetoothController.connect({
     *   success: function(){
     *     // perform bluetooth action since you are now connected to your device or was already connected.
     *   }
     * });
     */
    connect: function(options){
      var that = this;
      
      // make sure to require AppController
      _requireAppController();
      
      options = options || {};
      
      // make sure device address has been loaded properly and the application isn't in intial setup state.
      // IGNORE this for now since SyncData can happen without being in the initialSetupState
      /*
      if(AppController.inInitialSetupState()){
        this.onActionError(new ErrorModel('Trying to connect when not setup properly.'));
        return;
      }
      */
      
      if(AppController.inDemoMode()){
        // you are connected since bluetooth functionality is not used in demo mode
        if(options.success){
          options.success(options.bluetoothDeviceModel);
        }
        return;
      }
      
      _isDisconnecting = false;
      
      if(!options.bluetoothDeviceModel){
        this.onActionError("You need to specify a bluetoothDeviceModel to try connecting to.");
        return;
      }
      
      // check to see if already connected
      _bluetoothPlugin.isConnected(options.bluetoothDeviceModel.get("address"), {
        // isConnected success
        success: function(isConnected){
          window.showDebugMessage("isConnected: " + isConnected);
          
          if(isConnected !== undefined){
            // already connected so call success
            if(options.success){
              options.success(options.bluetoothDeviceModel);
            }
          }else{
            // need to connect to the device
            _bluetoothPlugin.connect(options.bluetoothDeviceModel.get('address'), {
              success: function(){
                // DEBUG TESTING CONNECT ERROR
                /*
                if(Math.random() > .5){
                  options.error(options.bluetoothDeviceModel, new Error("Failed to connect to device: " + options.bluetoothDeviceModel.get("address")));
                }else{
                  if(options.success){
                    options.success(options.bluetoothDeviceModel);
                  }
                }
                */
                
                if(options.success){
                  options.success(options.bluetoothDeviceModel);
                }
              },

              error: function(errorModel){
                //window.showDebugMessage("AppBluetoothController failed to connect to: " + options.bluetoothDeviceModel.get("address"));
                if(options.error){
                  options.error(options.bluetoothDeviceModel, errorModel);
                }
              },//end error

              onLostConnection: function(){
                //window.showDebugMessage('On Lost Connection. Is Disconnecting: ' + that.isDisconnecting());
                if(!that.isDisconnecting()){
                  if(options.onLostConnection){
                    options.onLostConnection(options.bluetoothDeviceModel);
                  }else{
                    that.onActionError('Lost Connection');
                  }
                }
              }//end onLostConnection
            }); //-- END Connect
          }//end if-else isConnected
        },//end success isConnected
        
        // isConnected Error
        error: function(errorModel){
          options.error(options.bluetoothDeviceModel, errorModel);
          window.showDebugMessage('Is Connected Failed in AppBluetoothController.connect: ' + errorModel.message);
        }//end error isConnected
      });
    },//-- End /connect/
    
    
    reconnect: function(options){
      _bluetoothPlugin.reconnect({
        success: function(){
          
        },
        
        error: function(errorModel){
          
        }
      });
    },
    
    
    /**
     * Disconnects the user from the bluetooth device.
     * @param {PlainObject} options the options for disconnecting.
     * @example AppBluetoothController.disconnect({
     *   success: function(){
     *     alert('Successfully disconnected from your device.');
     *   },
     *   
     *   error: function(errorModel){
     *     alert('Error disconnecting: ' + errorModel.message);
     *   }
     * });
     */
    disconnect: function(options){
      var that = this;
      
      options = options || {};
      _isDisconnecting = true;
      _requireAppController();
      
      // demo mode doesn't deal with actual bluetooth functionality
      //window.showDebugMessage("inDemoMode disconnect? " + AppController.inDemoMode());
      if(AppController.inDemoMode()){
        options.success();
        // return to prevent further execution
        return;
      }
      
      _bluetoothPlugin.disconnect({
        success: function(){
          if(options.success){
            options.success();
          }else{
            // default success will be silent for now
          }
        },
        
        error: function(errorModel){
          if(options.error){
            options.error(errorModel);
          }else{
            that.onActionError(errorModel.message);
          }
        },
        
        deviceAddress: options.deviceAddress
      });
    },
    
    isDisconnecting: function(){
      return _isDisconnecting;
    },
    
    /**
     * Whether or not bluetooth is enabled on the device.
     * @param {PlainObject} options the options for this method.
     * options = {
     *   success: function(){
     *     alert("Bluetooth Enabled.");
     *   },
     *   
     *   error: function(errorModel){
     *     alert("Error: " + errorModel.message);
     *   }
     * };
     */
    bluetoothEnabled: function(options){
      options = options || {};
      
       _requireAppController();
       
      if(AppController.inDemoMode()){
        options.success();
        // prevent further execution
        return;
      }
      
      _bluetoothPlugin.isEnabled({
        success: function(){
          options.success();
        },
        
        error: function(errorModel){
          options.error(errorModel);
        }
      });
    },
    
    /**
     * The event that a Bluetooth Controller action was successful.
     * @param {String} message the message to display, if undefined, no message will be displayed (it will be silent).
     */
    onActionSuccess: function(message){
      if(message){
        AppController.showMessage(message);
      }
    },
    
    
    /**
     * The event that a Bluetooth Controller Action resulted in an error.
     * @param {String} message the message to display, if undefined, no message will be displayed (it will be silent).
     */
    onActionError: function(message){
      if(message){
        AppController.showErrorMessage(message);
      }
    }
  };//-- End AppBluetoothController
  
  
  return AppBluetoothController;
});