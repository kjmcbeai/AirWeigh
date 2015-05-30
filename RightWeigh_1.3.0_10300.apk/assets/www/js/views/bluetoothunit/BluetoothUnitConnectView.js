define([
  'jquery',
  'underscore',
  'backbone',
  'BluetoothFactory',
  'require'
], function($, _, Backbone, BluetoothFactory, require){
  var _deviceDetails = {
        deviceAddress: "00:07:80:2D:DC:CB"
      },
      BluetoothUnitConnectView;
  
  
  BluetoothUnitConnectView = Backbone.View.extend({
    el: "#page-content",
    
    events: {
      'click .nav-button': 'onNavClick'
    },
    
    bluetoothPlugin: null,
    
    initialize: function(){      
      this.bluetoothPlugin = BluetoothFactory.getInstance();
    },
    
    stop: function(){
      
    },
    
    close: function(){
      this.stop();
      this.$el.unbind();
      this.$el.empty();
    },
    
    onNavClick: function(event){
      var action = $(event.currentTarget).data("action");
      
      if(action === "connect"){
        this.connectToDevice();
      }else{
        window.showDebugMessage("Action Not Found");
      }
    },
    
    connectToDevice: function(){
      /*
      this.bluetoothPlugin.connect(_deviceDetails.deviceAddress, {
        success: function(){
          window.showDebugMessage("Connected Device: " + _deviceDetails.deviceAddress);
        },
        
        error: function(errorModel){
          window.showDebugMessage("Connect Error: " + JSON.stringify(errorModel));
        }
      });
      */
      window.showDebugMessage("Attempting to connect");
      //bluetoothle.initialize(_onInitialize, _onInitializeError, {request: false});
      bluetoothle.initialize(
        // success
        function(response){
          window.showDebugMessage("Intialize Success: " + JSON.stringify(response));
          
          window.setTimeout(function(){
            bluetoothle.connect(
              function(response){
                window.showDebugMessage("Connect Success: " + JSON.stringify(response));
              },

              // error
              function(response){
                window.showDebugMessage("Connect Error: " + JSON.stringify(response));
              },

              // params
              {
                address: _deviceDetails.deviceAddress
              }
            );
          }, 1000);
        }, 
        // error
        function(response){
          window.showDebugMessage("Initialize Error: " + JSON.stringify(response));
        }, 
        // params
        {request: false});
    },
    
    render: function(){
      var template = _.template($("#tmplBluetoothUnitConnect").html());
      
      this.$el.html(template({
        
      }));
      
      // return this for chaining
      return this;
    }
  });
  
  _onInitialize = function(response){
    window.showDebugMessage("Initialize Success: " + JSON.stringify(response));
  };
  
  _onInitializeError = function(response){
    window.showDebugMessage("Initilaize Error: " + JSON.stringify(response));
  };
  
  return BluetoothUnitConnectView;
});