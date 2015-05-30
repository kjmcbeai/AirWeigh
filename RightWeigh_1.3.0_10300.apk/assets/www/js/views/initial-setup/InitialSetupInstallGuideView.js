define([
  'jquery',
  'underscore',
  'backbone',
  'AppController'
], function($, _, Backbone, AppController){
  var InitialSetupInstallGuideView = Backbone.View.extend({    
    el: '#page-content',
    
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
     * @returns {InitialSetupInstallGuideView} returns this object for chaining.
     */
    render: function(){
      var data,
          template;
  
      data = {
        settings: AppController.getSettings()
      };
      
      template = _.template($("#tmplInitialSetupInstallGuide").html());
      
      this.$el.html(template(data));
      
      // return this for chaining
      return this;
    }
  });
  
  return InitialSetupInstallGuideView;
});