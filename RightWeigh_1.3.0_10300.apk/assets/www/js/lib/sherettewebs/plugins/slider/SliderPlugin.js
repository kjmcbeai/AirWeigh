define([
  'jquery'
], function($){
  var ACTIVE_PAGE_ICON_URL = './img/sw/plugin/slider/active-page-icon.png',
      INACTIVE_PAGE_ICON_URL = './img/sw/plugin/slider/inactive-page-icon.png',
      currentSlideIndex = 0,
      snapPoints = [], // the snap point positions that the slides are located (the left most point)
      slideIsSnapped = false, // whether or not a slide is currently snapped in position
      $slideModule, // this is the main parent to the entire slide module (contains the wrapper, container, slides, and slide-navigation).
      $slideWrapper, $slideContainer, $slides,
      $slideNavigation, // the main container that holds the navigation for the slider.
      $slideNavigationIcons, // the container for the slide page icons (shows what page the user is on).
      slideWidth, // determines the width for the slides and the slide container (this is the width of the slide-wrapper)
      slideModuleSelector, // determines which slide container to create slides from.
      draggableSlideContainer, // the Draggable Object for the slide container
      // methods
      configureSlides, configureDraggableContainer, configurePageIcons;

  /**
   * Configures the slides with the correct styles and snap points.
   */
  configureSlides = function() {
    // apply styles to the slides and add the snap points for the slides
    $slides.each(function(index) {
      $(this).css({
        float: 'left',
        width: slideWidth
      });

      // add the snap point for this slide
      snapPoints.push(-1 * slideWidth * index);
    });
  };

  /**
   * Configures the slide draggable container (aka slideContainer).
   */
  configureDraggableContainer = function() {
    draggableSlideContainer = Draggable.create($slideContainer, {
      type: 'left',
      throwProps: true,
      minDuration: 0.25,
      maxDuration: 0.75,
      edgeResistance: 0.6,
      zIndex: 1,
      onDragStart: function() {
        slideIsSnapped = false;
      },
      snap: {
        /**
         * The draggable "left" type.
         * @param {Number} endPosition the value the drag ended at.
         */
        left: function(endPosition) {
          var previousSlideIndex = currentSlideIndex,
                  lastEndPosition;

          // only snap if slide hasn't been snapped in position already
          if (!slideIsSnapped) {
            slideIsSnapped = true;
            lastEndPosition = snapPoints[currentSlideIndex];

            if (endPosition < lastEndPosition + slideWidth / 2 && currentSlideIndex < $slides.length - 1) {
              currentSlideIndex += 1;
            }

            if (endPosition > lastEndPosition - slideWidth / 2 && currentSlideIndex > 0) {
              currentSlideIndex -= 1;
            }
          }//-- end slide is not snapped

          // update page icon
          updatePageNavigation(currentSlideIndex, previousSlideIndex);

          // return the position value to snap the slide to
          return snapPoints[currentSlideIndex];
        }//end left snap type
      }//end snap property
    });//-- END draggable container
  };//-- END /configureDraggableContainer/

  /**
   * Configures and adds the page icons for each individual slide. 
   * This helps distinquish to the user, what page they are on in the slides.
   */
  configurePageNavigation = function() {
    var html = '',
            x;

    html += '<ul class="slide-page-icons">';
    for (x = 0; x < $slides.length; x += 1) {
      if (x === 0) {
        html += '<li class="active-page-icon"><img src="' + ACTIVE_PAGE_ICON_URL + '" alt="Slide Page Icon" /></li>';
      } else {
        html += '<li class="inactive-page-icon"><img src="' + INACTIVE_PAGE_ICON_URL + '" alt="Slide Page Icon" /></li>';
      }
    }
    html += '</ul>';

    // append icon list to navigation container
    $slideNavigationIcons = $(html).appendTo($slideNavigation);
  };

  /**
   * Updates the page navigation icon for the current slide that is active.
   * @param {int} currentSlideIndex the index for the current slide.
   * @param {int} previousSlideIndex the index for the previous slide.
   */
  updatePageNavigation = function(currentSlideIndex, previousSlideIndex) {
    // only make update if there has been a change in slide
    if (currentSlideIndex !== previousSlideIndex) {
      $slideNavigationIcons.find('img').eq(previousSlideIndex).attr('src', INACTIVE_PAGE_ICON_URL);
      $slideNavigationIcons.find('img').eq(currentSlideIndex).attr('src', ACTIVE_PAGE_ICON_URL);
    }
  };

  // RETURN PUBLIC METHODS/PROPERTIES
  return {
    /**
     * Initializes the Dial Application.
     * @param {string} containerId the id for the slide container to create from.
     * @throws Error if the container id doesn't exist.
     */
    init: function(containerId) {
      // make sure containerId exists
      if (document.getElementById(containerId) === null) {
        throw new Error('Container id "' + containerId + '" doesn\'t exist');
      }

      // configure this object's properties
      slideModuleSelector = "#" + containerId;
      currentSlideIndex = 0;
      snapPoints = [];
      $slideModule = $(slideModuleSelector);
      $slideWrapper = $(slideModuleSelector + " .slide-wrapper");
      $slideContainer = $(slideModuleSelector + " .slide-container");
      $slides = $(slideModuleSelector + " .slide");
      $slideNavigation = $(slideModuleSelector + " .slide-navigation");
 
      // slide container should always be 100% of parent container's height, 
      // so the entire slide is a slideable area.
      $slideContainer.height('100%');
  
      // slide wrapper determines the width of the slides and the slide container
      slideWidth = $slideWrapper.width();
      // make sure to force the same width to the slides. 
      // Sometimes it will change for some reason.
      $slideWrapper.width(slideWidth);
      // set slide container width to the width of the slide wrapper * the 
      // amount of slides the container will have.
      $slideContainer.width(slideWidth * $slides.length);

      // finish any configurations
      configureSlides();
      configureDraggableContainer();
      configurePageNavigation();
    }//end init method
  };// end return object
});