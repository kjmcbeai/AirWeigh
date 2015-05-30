define([
  'jquery',
  'underscore',
  'backbone',
  'AppController',
  'router',
  'require'
], function($, _, Backbone, AppController, Router, require){
  var TruckConfigImageView = Backbone.View.extend({
    el: '#page-content',
    
    _$currentSelectionElement: null,
    
    /**
     * {ProfileModel} the ProfileModel in Edit Mode.
     */
    model: null,
    
    events: {
      'click .config-window__footer button' : 'onNavClick',
      'click .truck-config-image'           : 'onConfigImageClick'
    },
    
    /**
     * Initializes this view.
     */
    initialize: function(){
      Router = require('router');
      
      this.model = AppController.getSettings().getProfileInEditMode();
    },
    
    onConfigImageClick: function(event){
      var $target = $(event.currentTarget),
          imgSrc  = $target.children('img').attr("src");
  
      // remove highlight
      if(this._$currentSelectionElement){
        this._$currentSelectionElement.removeClass('highlight-box');
      }
      
      // add highlight to current target
      $target.addClass('highlight-box');
      
      // update the cached selection element
      this._$currentSelectionElement = $target;
      
      this.model.set("configImgUrl", imgSrc);
    },
    
    onNavClick: function(event){
      // get action of the event
      var action   = $(event.target).data('action');

      if(action === "save"){
        Router.closeModalWindow("truckConfigImage", false);
      }else{
        window.showDebugMessage("Invalid Action in ProfileFormView.");
      }
    },
    
    stop: function(){
      
    },
    
    /**
     * Closes this view (unbinds events and emptys the html for this view.
     */
    close: function(){
      this.stop();
      this.$el.unbind();
      this.$el.empty();
    },
    
    /**
     * Renders this view.
     * @returns {TruckConfigImageView} this view for chaining.
     */
    render: function(){
      var template;
      
      template = _.template($("#tmplTruckConfigImage").html());
      
      this.$el.html(template({
        availableTruckConfigImages: this.model.getAvailableTruckConfigImages()
      }));
      
      // return this for chaining
      return this;
    }
  });
  
  return TruckConfigImageView;
});