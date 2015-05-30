define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone){
  var FooterView = Backbone.View.extend({
    el: '#footer',
    
    close: function(){
      this.$el.empty();
      this.unbind();
    },
    
    render: function(){
      var data,
          template;
  
      data = {};
      template = _.template($("#tmplFooter").html());
      
      this.$el.html(template(data));
    }
  });
  
  // return the created View
  return FooterView;
});