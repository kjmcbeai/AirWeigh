define([
  'jquery'
], function($){
  var _slideMap = {},
      SlideViewPlugin;
  
  SlideViewPlugin = {
    initialize: function(){
      this.configureSlideContainers();
    },
    
    configureSlideContainers: function(){
      // reset slide containers
      _slideMap = {};
      
      $(".slideview").each(function(){
        var $slideview = $(this),
            slideId    = $slideview.data("slideview-id"),
            slideWidth = $slideview.width(),
            slideModel = {
              curSlideIndex : 0,
              $slideview    : $slideview,
              $container    : $slideview.find('.slideview-container').first(), // should only be one
              $slides       : $slideview.find('.slideview-container__slide')
            };

        // configure container width
        slideModel.$container.width(slideWidth * slideModel.$slides.length);
        
        // configure the slides width
        slideModel.$slides.each(function(){
          $(this).width(slideWidth);
        });
        
        // add slideModel to map
        _slideMap[slideId] = slideModel;
      });
    },//--end /configureSlideContainers/
    
    next: function(slideId, options){
      var slideModel   = _slideMap[slideId],
          animateProperties;
  
      options = options || {};
      
      if(!slideModel){
        throw new Error("Slide model not found.");
      }
      
      // check to see if there is a next slide
      if(slideModel.curSlideIndex < slideModel.$slides.length - 1){
        // valid slide
        slideModel.curSlideIndex+= 1;
        animateProperties = {
          "right": slideModel.$slideview.width() * slideModel.curSlideIndex
        };
        
        slideModel.$container.animate(animateProperties, {
          duration : 500,
          easing   : "swing",
          done     : function(){
            if(options.done){
              options.done();
            }
          }
        });
      }//--end if slide viable
    },//--end /next/
    
    previous: function(slideId, options){
      var slideModel = _slideMap[slideId],
          animateProperties; 
  
      options = options || {};
      
      if(!slideModel){
        throw new Error("Slide model not found.");
      }
      
      // check to see if there is a previous slide
      if(slideModel.curSlideIndex > 0){
        slideModel.curSlideIndex-= 1;
        
        animateProperties = {
          right: slideModel.$slideview.width() * slideModel.curSlideIndex * -1
        };
        
        // valid slide
        slideModel.$container.animate(animateProperties, {
          duration : 500,
          easing   : "swing",
          done     : function(){
            if(options.done){
              options.done();
            }
          }
        });
      }//--end if slide viable
    }//--end /previous/
  };//--end SlideViewPlugin
  
  return SlideViewPlugin;
});