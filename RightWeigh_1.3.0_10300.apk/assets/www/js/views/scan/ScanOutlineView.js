define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'router',
  'require'
], function($, _, Backbone, AppController, Router, require){
  var ScanOutlineView = Backbone.View.extend({    
    el: '#page-content',
    
    events: {
      'click .button-scan' : 'openScanSyncView'
    },
    
    initialize: function(){
      Router = require('router');
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
     * Opens the ScanSyncView modal window.
     */
    openScanSyncView: function(){
      Router.openModalWindow('scanSync', "scan-sync-view");
    },
    
    /**
     * Renders the view and adds it to the el dom object.
     * @returns {ScanOutlineView} returns this object for chaining.
     */
    render: function(){
      var template;
      
      template = _.template($("#tmplScanOutline").html());
      
      this.$el.html(template({
        
      }));
      
      // return this for chaining
      return this;
    }
  });
  
  return ScanOutlineView;
});