/**
 * Filename    : js/router.js
 * Author      : Brandon Sherette
 * Description : Application Router object for dealing with page navigation and views.
 */
define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'views/header/HeaderView',
  'views/footer/FooterView',
  'views/truck/TruckWeightView',
  'views/initial-setup/InitialSetupView',
  'views/settings/SettingsView',
  'views/profile/ProfileEditFormView',
  'views/truck/TruckConfigImageView',
  'views/truck/TruckTotalWeightConfigView',
  'views/truck/TruckDeviceEditNameView',
  'views/scan/ScanSyncView',
  'views/send/SendView',
  'views/truck/TruckAxleConfigView',
  'views/connection/ConnectionStatusView',
  'lib/sherettewebs/plugins/modal-window/ModalWindowPlugin',
  'views/bluetoothunit/BluetoothUnitConnectView'
], function($, _, Backbone, AppController, HeaderView, FooterView, TruckWeightView, InitialSetupView, SettingsView, ProfileEditFormView, TruckConfigImageView, TruckTotalWeightConfigView, TruckDeviceEditNameView, ScanSyncView, SendView, TruckAxleConfigView, ConnectionStatusView, ModalWindowPlugin, BluetoothUnitConnectView){
  var MODAL_BUTTON_CLASS_NAME  = 'sw-plugin-modal-window-button',
      _modalViewMap = {
        initialSetup           : InitialSetupView,
        settings               : SettingsView, // the key value must be the modal button's "data-modal-view" value
        editProfile            : ProfileEditFormView,
        truckConfigImage       : TruckConfigImageView,
        truckDeviceEditName    : TruckDeviceEditNameView,
        scanSync               : ScanSyncView,
        send                   : SendView,
        axleConfig             : TruckAxleConfigView,
        connectionStatus       : ConnectionStatusView,
        truckTotalWeightConfig : TruckTotalWeightConfigView
      },
      _$modalButtons,
      _initialLoad = true,
      AppRouter;

  AppRouter = Backbone.Router.extend({
    // the routes to the various single page application pages
    routes: {      
      // default home page
      '*actions' : 'showWeight'
      /*'*actions' : 'connectUnitTest'*/
    }
  });
  
  // Return Router Object
  return {
    /**
     * The current view that is being displayed.
     */
    currentView: null,
    
    /**
     * The modal views that are open.
     */
    openedModalWindows: {},
    
    /**
     * Initializes the router object.
     * Sets up router listeners, 
     * configures header/footer modal windows,
     * renders header/footer views, 
     * and starts router history.
     */
    initialize: function(){
      var appRouter  = new AppRouter(),
          headerView = new HeaderView(),
          footerView = new FooterView(),
          that       = this;
  
      _initialLoad = true;
      
      // render constant views
      //headerView.render();
      footerView.render();
      
      // configure modal window urls
      this.configureModalWindows();
      // configure normal route urls
      appRouter.on('route:showWeight', function(){
        that.showView(new TruckWeightView());
      });
      
      appRouter.on('route:connectUnitTest', function(){
        that.showView(new BluetoothUnitConnectView());
      });
      
      // Router App Events
      AppController.getEventsModel().on('route:showAlertView', function(options){
        
      });
      
      // start backbone history navigation
      Backbone.history.start();
    },
    
    /**
     * Configures the modal windows for the main page navigation.
     */
    configureModalWindows: function(){ 
      var instance   = this;
      _$modalButtons = $("." + MODAL_BUTTON_CLASS_NAME);
      
      // initialize the plugin with any settings the windows need to have
      ModalWindowPlugin.init({
        
      });
      
      _$modalButtons.each(function(index, element){
        var $this        = $(this),
            viewName     = $this.data('modal-view'),
            modalElementId = 'modal-window-view';
            //modalElementId = $this.data('modal-element-id');
            
        // register modal containers
        ModalWindowPlugin.register(modalElementId);
        
        // attach click listeners to modal buttons
        $this.on('click', function(){
          // Bluetooth click will go to initial setup view if in initial setup state
          if(viewName === 'settings' && AppController.inInitialSetupState()){
            instance.openSettingsModalWindow();
          }else{
            // need to setup the profile in edit mode if editProfile has been selected
            if(viewName === "editProfile"){
              AppController.getSettings().setProfileInEditMode(AppController.getSelectedProfile());
            }
            
            instance.openModalWindow(viewName, modalElementId);
          }
        });
      });
    },
    
    /**
     * Opens the settings view modal window. In this case, Bluetooth Modal Window.
     */
    openSettingsModalWindow: function(){
      // find settings modal window data
      var viewName       = 'initialSetup',
          modalElementId = 'modal-window-view';
          //modalElementId = 'modal-initial-setup';

      ModalWindowPlugin.register(modalElementId);
  
      this.openModalWindow(viewName, modalElementId);
    },
    
    /**
     * Opens the specified view as a modal window.
     * @param {String} viewName the name of the view to open.
     * @param {String} modalElementId the element id where the modal window is located.
     * @throws {ErrorModel} if viewName doesn't have a view class mapped to that name.
     */
    openModalWindow: function(viewName, modalElementId){
      var that         = this,
          ViewClass    = _modalViewMap[viewName],
          viewInstance = null,
          docHeight    = $(document).height(),
          docWidth     = $(document).width(),
          modalHeight;
  
      // default modalElementId
      modalElementId = modalElementId || 'modal-window-view';
      
      if(ViewClass === undefined){
        throw new Error("ViewClass not found. Expected View Name: " + viewName);
      }
      
      // register modalElementId if needed
      ModalWindowPlugin.register(modalElementId);

      // stop any animations/any plugins in the current view.
      this.currentView.stop();

      viewInstance = new ViewClass({
        el: '#' + modalElementId
      });
      viewInstance.render();
      
      
     // if modal window is a config-window, adjust height of the element to almost the full screen
      if(viewName === 'settings'){
        
        modalHeight = docHeight - (docHeight * .6);
        viewInstance.$el.height(modalHeight);
        
      }else if(viewName === 'initialSetup' || viewName === "editProfile"){

        modalHeight = docHeight - (docHeight * .1);
        viewInstance.$el.height(modalHeight);
 
      }else if(viewName === 'axleConfig' || viewName === 'truckDeviceEditName' || viewName === "truckTotalWeightConfig"){

        modalHeight = docHeight - (docHeight * .3);
        viewInstance.$el.height(modalHeight);

      }else if(viewName === 'truckConfigImage' || viewName === "scanSync"){
        
        modalHeight = docHeight - (docHeight * .3);
        viewInstance.$el.height(modalHeight);
        viewInstance.$el.width(docWidth - (docWidth * .2));
        
      }else{

        modalHeight = docHeight - (docHeight * .2);
        viewInstance.$el.height(modalHeight);

      }
      
      // add modal window to open modal windows map
      this.openedModalWindows[viewName] = {
        instance  : viewInstance,
        elementId : modalElementId
      };

      ModalWindowPlugin.open(modalElementId, {
        onClose: function(){
          that.closeModalWindow(viewInstance);
        },
        
        disableMaskClose: true
      });
    },
    
    /**
     * Closes the specified views modal window (if it exists), then reshows the current view.
     * @param {String} viewName the name of the view you wish to close, this should correlate to the router's _modalViewMap.
     * @param {Boolean} showCurrentView whether or not the current view should be rerendered or not.
     */
    closeModalWindow: function(viewName, showCurrentView){
      var modalView = this.openedModalWindows[viewName];
      
      showCurrentView = (showCurrentView === undefined) ? true : showCurrentView;
      
      // close the view instance restart the current view
      if(modalView){
        modalView.instance.close();
        ModalWindowPlugin.close(modalView.elementId);
        delete this.openedModalWindows[viewName];
      }
      
      if(showCurrentView){
        this.showView(this.currentView);
      }
    },
    
    
    /*
     * Closes the current view.
     */
    closeCurrentView: function(){
      this.currentView.close();
      this.currentView = null;
    },
    
    /**
     * Closes all the opened modal windows.
     * @param {Boolean} showCurrentView whether or not the current view should be rerendered or not.
     */
    closeAllModalWindows: function(showCurrentView){
      var key;
      
      for(key in this.openedModalWindows){
        this.closeModalWindow(key, false);
      }
      
      if(showCurrentView){
        this.showView(this.currentView);
      }
    },
    
    /**
     * Configures and renders the specified view.
     * @param {Backbone.View} view the view to configure and render.
     */
    showView: function(view){
      // close any view currently displayed
      if(this.currentView !== null && this.currentView !== view){
        this.currentView.close();
      }
      
      if(view === null){
        // use default view
        view = new TruckWeightView();
      }
      
      // update current view and finish setting up the view
      this.currentView = view;
      this.currentView.render();
      // resume if available
      if(this.currentView.resume){
        this.currentView.resume();
      }
      
      if(AppController.inInitialSetupState()){
        // initial setup, so open settings settings modal window
        this.openSettingsModalWindow();
      }
      
      /* Added by Brandon Sherette on 2014.11.11 */
      if(_initialLoad){
        // remove splash screen, wait a second to let all views be fully rendered before removing the splashscreen
        window.setTimeout(function(){
          if(navigator && navigator.splashscreen){
            navigator.splashscreen.hide();
          }

          _initialLoad = false;
        }, 1000);
      }//--End _initialLoad
    }//--End /showView/
  };
});