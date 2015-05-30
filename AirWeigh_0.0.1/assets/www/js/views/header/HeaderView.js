define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone){
  var HeaderView = Backbone.View.extend({
    el: '#header',
    
    close: function(){
      this.$el.empty();
      this.unbind();
    },
    
    render: function(title){
      var data,
          template;
      
      data = {
        title: title,
        _: _
      };
      template = _.template($("#tmplHeader").html());
      
      this.$el.html(template(data));
    }
  });
  
  // return the created HeaderView Object
  return HeaderView;
});