define([
  'jquery',
  'underscore',
  'backbone',
  'SettingsModel',
  'sherettewebs',
  'AppBluetoothController'
], function($, _, Backbone, SettingsModel, SheretteWebs, AppBluetoothController){  
  var APP_NAME            = 'Right Weigh',
      APP_VERSION         = "v1.3.0",
      KG_PER_LBS          = 0.453592,
      _settingsModel      = null,
      _inDemoMode         = false,
      _inConnectedMode    = false,
      _eventsModel        = null,
      _$loadingIcon       = null,
      
      _confirmOptions = {
        message: 'Confirm Message',
        confirm: function(){
          alert('Confirm was pressed.');
        },
        title: 'Confirm',
        buttonLabels: 'confirm,cancel'
      },
      
      _alertOptions  = {
        message: 'Alert',
        callback: null,
        title: 'Alert',
        buttonName: 'OK'
      },
      
      _connectToSelectedProfileDevicesOptions = {
        success: function(){AppController.showMessage("Connect to Devices Completed.");},
        error: function(errorModel){AppController.showErrorMessage("Failed to connected to selected profile devices. Message: " + errorModel.message);},
        ignoreConnectError: true,
        stopOnError: false
      },
      
      _nextDeviceToConnectIndex = 0,
      _nextDeviceToDisconnectIndex = 0,
      
      AppController;
  
  /**
   * The application controller. This controller is used for application wide type of actions.
   */
  AppController = {
    /**
     * @returns {String} The application's name.
     */
    getAppName: function(){
      return APP_NAME;
    },
    
    /**
     * Gets the app version.
     * @returns {String} the app version number
     */
    getAppVersion: function(){
      return APP_VERSION;
    },
    
    /**
     * Gets the local storage prefix used for saving data.
     * @returns {String} the storage prefix used for the application.
     */
    getStoragePrefix: function(){
      return 'rwls_';
    },
    
    /**
     * Gets the app settings.
     * @returns {SettingsModel}
     */
    getSettings: function(){
      if(_settingsModel === null){
        _settingsModel = new SettingsModel();
      } 
      
      return _settingsModel;
    },
    
    
    /**
     * Saves the current settings model stored in AppController.
     * @param {PlainObject} options check AppController.updateSettings options for more details.
     */
    saveCurrentSettings: function(options){
      this.updateSettings(this.getSettings(), options);
    },
    
    
    /**
     * Updates the settings with the data from the sent in settings model.s
     * @param {SettingsModel} settingsModel the settings model data to update settings with.
     * @param {PlainObject} options the options for this method. The available options are below:
     * options = {
     *   success: function(settingsModel){
     *   
     *   }
     * }
     */
    updateSettings: function(settingsModel, options){
      var settingsClone = settingsModel.clone(),
          that = this;
      
      settingsModel = settingsModel || {};
      options       = options || {};
      
      // save the settings data via clone, so we can replace settings model to the complete saved state (the relational heirarchy)
      settingsClone.save({}, {
        success: function(){
          // reset settings model to the complete version (the relational functions and data)
          _settingsModel = settingsModel;
          that.getEventsModel().trigger('app:afterSaveSettings', {
            success: true
          });
          options.success(_settingsModel);
        }
      });
    },
    
    /**
     * Deletes the app settings from the server/storage.
     * @param {PlainObject} options the options for deleting. Options are:
     * var options = {
     *   success : function(settingsModel, response, options){},
     *   error   : function(settingsModel, response, options){}
     * };
     */
    deleteSettings: function(options){
      var that = this;
      
      options = options || {};
      
      // about to delete settings, so trigger beforeDeleteSettings event
      /*
      this.getEventsModel().trigger('app:beforeDeleteSettings', {
        
      });
      */
      // start loading icon for waiting
      this.startLoadingIcon();
      
      // disconnect from the device if viable
      this.disconnectFromSelectedProfileDevices({
        success: function(){
          _settingsModel.destroy({
            success: function(){
              _settingsModel = new SettingsModel();
              that.getEventsModel().trigger('app:afterDeleteSettings', {
                success: true
              });
              
              that.stopLoadingIcon();
              if(options.success){
                options.success();
              }
            },//end success

            error: function(errorModel){
              that.stopLoadingIcon();
              if(options.error){
                options.error(errorModel);
              }
            }//end error
          });//end settingsModel.destroy
        },
        error: function(errorModel){
          that.stopLoadingIcon();
          if(options.error){
            options.error(errorModel);
          }
        }
      });//--end /AppController.disconnectFromSelectedProfileDevices/
    },
    
    
    /**
     * Fetches the data for the settings model.
     */
    fetchSettings: function(){
      if(_settingsModel === null){
        _settingsModel = new SettingsModel();
      }
      
      //TODO maybe add some sort of success handler
      _settingsModel.fetch({});
    },//--end /fetchSettings/
    
    /**
     * Whether or not the application is in a initial setup state or not.
     * @returns {Boolean} true if the application is in an initial setup state (no settings/proiles are saved), false otherwise.
     */
    inInitialSetupState: function(){
      var settings = this.getSettings(),
          profiles = settings.get('profiles');
      
      return (profiles === null || profiles.length === 0);
    },//--end /inInitialSetupState/
    
    /**
     * Gets the selected profile that will be used during the application's interactivity (truck weight view and etc...).
     * @returns {ProfileModel} the profile model that a user has selected during the intial load, null if profile doesn't exist.
     */
    getSelectedProfile: function(){
      // TODO: add actual functionality for selecting a profile, for now just using the first profile
      var selectedProfile = this.getSettings().get('profiles').at(0);
      
      return (selectedProfile) ? selectedProfile : null;
    },
    
    
    /**
     * Connects to the selected profiles bluetooth devices. Shortcut for connectToProfileDevices with the selectedProfileModel.
     * @param {PlainObject} See connectToProfileDevices for list of options.
     */
    connectToSelectedProfileDevices: function(options){
      this.connectToProfileDevices(this.getSelectedProfile(), options);
    },
    
    
    /**
     * Connects to all the devices in the specified profileModel.
     * @param {ProfileModel} profileModel the profileModel with the devices to connect to.
     * @param {PlainObject} options success and error callback options.
     * options.success = function(){};
     * options.error = function(errorModel){};
     */
    connectToProfileDevices: function(profileModel, options){
      var that = this;
      
      options = SheretteWebs.Util.mergeOptions(_connectToSelectedProfileDevicesOptions, options);
      
      _inConnectedMode = true;
      _nextDeviceToConnectIndex = 0;
      
      // reset devices status to disconnected
      profileModel.resetDevicesStatus();
      
      // check to make sure bluetooth is on
      AppBluetoothController.bluetoothEnabled({
        success: function(){
          that._connectToNextTruckDevice(profileModel.get("truckDevices"), options);
        },
        
        error: function(errorModel){
          options.error(new Error("Bluetooth Not Enabled"));
        }
      });
    },
    
    
    /**
     * Connects to the selected profile device (this is a private method, and a recursion method used by connectToSelectedProfileDevices).
     * @param {TruckDeviceCollection} truckDeviceCollection the truckDeviceCollection associated to the selectedProfileModel.
     */
    _connectToNextTruckDevice: function(truckDeviceCollection, options){
      var bluetoothDeviceModel,
          that = this;
      
      if(_nextDeviceToConnectIndex >= truckDeviceCollection.length){
        // finished connecting
        options.success();
        // recursion has been completed, return back
        return;
      }
      
      bluetoothDeviceModel = truckDeviceCollection.at(_nextDeviceToConnectIndex).get("bluetoothDeviceModel");
      // update status to connecting
      bluetoothDeviceModel.set("status", "connecting");
      this.getEventsModel().trigger('bluetoothdevice:statuschanged', bluetoothDeviceModel);
      
      window.setTimeout(function(){
        AppBluetoothController.connect({
          success: function(rBluetoothDevice){
            bluetoothDeviceModel.set("status", "connected");
            that.getEventsModel().trigger('bluetoothdevice:statuschanged');
            that._connectToNextTruckDevice(truckDeviceCollection, options);
          },

          error: function(rBluetoothDevice, errorModel){
            bluetoothDeviceModel.set("status", "error");
            that.getEventsModel().trigger('bluetoothdevice:statuschanged');
            
            if(options.ignoreConnectError){
              that._connectToNextTruckDevice(truckDeviceCollection, options);
            }else{
              if(options.stopOnError){
                options.error(rBluetoothDevice, errorModel);
              }else{
                // trigger error, but continue connecting process
                options.error(rBluetoothDevice, errorModel);
                // continue trying to connect to all devices
                that._connectToNextTruckDevice(truckDeviceCollection, options);
              }
            }
          },
          
          onLostConnection: function(rBluetoothDevice){
            bluetoothDeviceModel.set("status", "disconnected");
            // need to reset the weight for the this device
            that.getSelectedProfile().resetWeight({
              bluetoothDeviceModel: bluetoothDeviceModel
            });
            that.getEventsModel().trigger('bluetoothdevice:statuschanged');
          },
          
          bluetoothDeviceModel: bluetoothDeviceModel
        });
      }, 2000);
      
      // increment index for next pass
      _nextDeviceToConnectIndex+= 1;
    },//--end /_connectToNextSelectedProfileDevice/
    
    
    /**
     * Disconnects the user from the selected profile connected bluetooth devices.
     * @param {PlainObject} options the options for this object.
     * options.success: function(){
     *   // disconnect was successful
     * }
     * options.error: function(errorModel){
     *   // error tring to disconnect from the devices
     * }
     */
    disconnectFromSelectedProfileDevices: function(options){
      var selectedProfile = this.getSelectedProfile();
      
      // make sure profile is available
      if(selectedProfile){
        this.disconnectFromProfileDevices(selectedProfile, options);
      }else{
        // This can happen if the profile has been recently deleted or this is the first time the user has started the application 
        // and the AppEvent.pause event occurred and didn't check to see if profile existed first.
        // No need to notify the user or this issue.
        window.showDebugMessage("disconnectFromSelectedProfileDevices selectedProfile doesn't exist.");
      }
    },//--end /disconnectFromSelectedProfileDevices/
    
    
    /**
     * Disconnects the user from the specified profile connected bluetooth devices.
     * @param {ProfileModel} the profileModel to disconnect from.
     * @param {PlainObject} options the options for this object.
     * options.success: function(){
     *   // disconnect was successful
     * }
     * options.error: function(errorModel){
     *   // error tring to disconnect from the devices
     * }
     */
    disconnectFromProfileDevices: function(profileModel, options){
      _inConnectedMode = false;
      _nextDeviceToDisconnectIndex = 0;
      
      this._disconnectFromNextSelectedProfileDevice(profileModel.get("truckDevices"), options);
    },//--end /disconnectFromProfileDevices/
    
    
    /**
     * Disconnects from the next device in the list of devices associated to the selected profile.
     * @param {TruckDeviceCollection} truckDeviceCollection the collection of truckDevices to disconnect from.
     * @param {PlainObject} options the options for this method (see disconnectFromSelectedProfileDevices options for more details).
     */
    _disconnectFromNextSelectedProfileDevice: function(truckDeviceCollection, options){
      var that = this,
          deviceAddress,
          bluetoothDevice,
          truckDeviceModel;
      
      options = options || {};
      
      // check to see if at the end of the iteration
      if(_nextDeviceToDisconnectIndex >= truckDeviceCollection.length){
        // disconnect process has been completed
        if(options.success){
          options.success();
        }
        // prevent further execution
        return;
      }
      
      bluetoothDevice  = truckDeviceCollection.at(_nextDeviceToDisconnectIndex).get("bluetoothDeviceModel");
      bluetoothDevice.set("status", "disconnecting");
      this.getEventsModel().trigger('bluetoothdevice:statuschanged');
      
      deviceAddress    = bluetoothDevice.get("address");
      
      // need to wait a second before disconnecting from multiple devices to prevent bluetooth errors
      window.setTimeout(function(){
        AppBluetoothController.disconnect({
          success: function(){
            // update status
            bluetoothDevice.set("status", "disconnected");
            that.getEventsModel().trigger('bluetoothdevice:statuschanged');
            
            _nextDeviceToDisconnectIndex+= 1;
            that._disconnectFromNextSelectedProfileDevice(truckDeviceCollection, options);
          },

          error: function(errorModel){
            // silently ignore
            window.showDebugMessage("Failed to disconnect: " + deviceAddress + " message: " + errorModel.message || errorModel);
            
            // update status
            bluetoothDevice.set("status", "disconnected");
            that.getEventsModel().trigger('bluetoothdevice:statuschanged');

            _nextDeviceToDisconnectIndex+= 1;
            that._disconnectFromNextSelectedProfileDevice(truckDeviceCollection, options);
          },

          deviceAddress: deviceAddress
        });
      }, 2000);
    },//--end /_disconnectFromNextSelectedProfileDevice/
    
    
    /**
     * @returns {Boolean} true if devices are connected/connecting, false if disconnecting/disconnected.
     */
    inConnectedMode: function(){
      return _inConnectedMode;
    },
    
    
    /**
     * Gets the events model used for the entire application.
     * @returns {Backbone.Events} the events model used for the entire application.
     */
    getEventsModel: function(){
      if(_eventsModel === null){
        _eventsModel = {};
        _.extend(_eventsModel, Backbone.Events);
      }
      
      return _eventsModel;
    },
    
    
    /**
     * Converts the specified weight to the correct value based on the profiles unitMeasurement of the selected profile.
     * @param {Number} weight the weight in lbs (will be converted to kg if nessessary).
     * @returns {Number} the converted weight value.
     */
    convertWeight: function(weight){
      // clone a copy of the value to not change it by reference
      var convertedWeight = Number(JSON.parse(JSON.stringify(weight)));
  
      if(this.getSelectedProfile().get("unitMeasurement") === "kg"){
        convertedWeight *= KG_PER_LBS;
      }
 
      return Math.round(convertedWeight);
    },//--end /convertWeight/
    
    /**
     * Formats the specified number into an integer string.
     * @example 
     * SheretteWebs.Util.toIntString(20421.42); // returns 20,421
     * @param {Number} number the number to format.
     * @returns {String} the formatted int.
     */
    toIntString: function(number){
      return Number(number.toFixed(0)).toLocaleString();
    },
    
    
    /**
     * @returns {Boolean} Whether or not the application is in demo mode or not (this means using dummy data for app simulation).
     */
    inDemoMode: function(){
      return _inDemoMode;
    },
    
    
    /**
     * Shows the loading icon to the user.
     */
    startLoadingIcon: function(){
      if(_$loadingIcon === null){
        _$loadingIcon = $('#icon-loading');
      }
      
      _$loadingIcon.show();
    },
    
    
    /**
     * Stops showing the loading icon to the user.
     */
    stopLoadingIcon: function(){
      if(_$loadingIcon === null){
        _$loadingIcon = $('#icon-loading');
      }
      
      _$loadingIcon.hide();
    },
    
    /**
     * Shows a debug message to the console.
     * @param {String} msg the message to show.
     */
    showDebugMessage: function(msg){
      if(window.showDebugMessage){
        window.showDebugMessage(msg);
      }else{
        console.log(msg);
      }
    },
    
    /**
     * Shows an error messsage to the user.
     * @param {String} msg the message to display.
     */
    showErrorMessage: function(msg){
      if(window.navigator && window.navigator.notification){
        window.navigator.notification.alert(msg, null, this.getAppName() + ' Error');
      }else{
        alert(msg);
      }
    },
    
    /**
     * Shows a message to the user.
     * @param {String} msg the message to display.
     */
    showMessage: function(msg){
      if(window.navigator && window.navigator.notification){
        window.navigator.notification.alert(msg, null, this.getAppName() + ' Notification');
      }else{
        alert(msg);
      }
    },
    
    /**
     * Shows a confirm popup box.
     * @param {PlainObject} options the options used for the confirm box.
     * options = {
     *   message      : "The message for the box.",
     *   confirm      : function(){},
     *   title        : "The title of the box."m
     *   buttonLabels : {}
     * };
     */
    showConfirm: function(options){
      options = options || {};
      options = SheretteWebs.Util.mergeOptions(_confirmOptions, options);
      
      if(window.navigator && window.navigator.notification){
        window.navigator.notification.confirm(options.message, options.confirm, options.title, options.buttonLabels);
      }else{
        alert('Confirm not supported');
      }
    },
    
    
    /**
     * Shows an alert box.
     * @param {PlainObject} options the options for the alert box.
     * options = {
     *   message    : "The alert message.",
     *   callback   : function(){},
     *   title      : "Alert Title",
     *   buttonName : "The label for the button name"
     * };
     */
    showAlert: function(options){
      options = options || {};
      options = SheretteWebs.Util.mergeOptions(_alertOptions, options);
      
      if(window.navigator && window.navigator.notification){
        window.navigator.notification.alert(options.message, options.callback, options.title, options.buttonName);
      }else{
        alert(options.message);
      }
    }
  };
  
  return AppController;
});