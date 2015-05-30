define([
  'jquery'
], function($){
  var MODAL_ELEMENT_CLASS_NAME      = 'sw-plugin-modal-window', // match this with css class
      MODAL_MASK_ELEMENT_CLASS_NAME = 'sw-plugin-modal-window-mask', // match this with css class
      STARTING_ZINDEX = 4000,
      FADE_DURATION = 500,
      _settings = {},
      _modalWindowMap  = {},
      ModalWindowPlugin;
  
  ModalWindowPlugin = {
    /**
     * Initializes the modal window plugin with the specified settings.
     * @param {PlainObject} settings the settings for the registered modal windows.
     * @example
     * var modalPlugin = ModalWindowPlugin.init({
     *   
     * });
     * @returns {undefined}
     */
    init: function(settings){      
      _settings = settings || {};
    },
    
    /**
     * Registers the specified element id as a modal window and sets up 
     * any styling or features for the modal window.
     * @param {String} elementId the id for the element container which to be treated as a modal window.
     * @return {PlainObject} the data for the registered modal in an object.
     * @example 
     * var modalWindow = ModalWindowPlugin.register('myElementId');
     * modalWindow will be formatted with the following properties:
     * 
     * modalWindow.elementId       // the id for the modal window element.
     * modalWindow.$element        // the jquery object for the modal window element.
     * modalWindow.$contentElement // the jquery object for the actual content for the modal window (use this for updating data for the modal window).
     * modalWindow.$closeButton    // the jquery object for the close button.
     */
    register: function(elementId){
      var addToDocument = false,
          $element,
          $contentElement,
          $closeButton,
          $maskElement,
          modalWindow;
          
      // check to see if registering window is needed
      if(_modalWindowMap.hasOwnProperty(elementId)){
        return _modalWindowMap['elementId'];
      }
      
      if(document.getElementById(elementId) === null){
        // create and append the element to body
        addToDocument = true;
        $element     = $("<div id='" + elementId + "'><div class='sw-plugin-modal-window-content'></div></div>");
        $maskElement = $("<div id='" + elementId + "-mask' class='" + MODAL_MASK_ELEMENT_CLASS_NAME + "'></div>").hide().appendTo('body');
      }else{
        $element     = $("#"+elementId);
        $maskElement = $("#"+elementId+"-mask"); 
      }
      
      $contentElement = $element.children('.sw-plugin-modal-window-content');
      
      // add close button to modal 
      $closeButton = $("<div class='sw-plugin-modal-window-close'>X</div>").appendTo($element);

      $element.hide();
      // only add modal class if it doesn't already exist
      if(!$element.hasClass(MODAL_ELEMENT_CLASS_NAME)){
        $element.addClass(MODAL_ELEMENT_CLASS_NAME);
      }
      
      

      // add the element if nessessary
      if(addToDocument){
        $('body').append($element);
        // add mask
        $('body').append($maskElement);
      }
      
      // cache the modal window data
      modalWindow = {
        elementId       : elementId,
        $element        : $element,
        $contentElement : $contentElement,
        $closeButton    : $closeButton,
        $maskElement    : $maskElement
      };
      _modalWindowMap[elementId] = modalWindow;
      
      return modalWindow;
    },
    
    /**
     * Alias for run.
     * @see ModalWindowPlugin.run
     */
    open: function(elementId, options){
      this.run(elementId, options);
    },
    
    /**
     * Opens the specified modal, registeres the modal if it's not already registered.
     * @param {String} elementId the id for the htmlElement to open.
     * @param {PlainObject} options the run options.
     * @example 
     * ModalWindowPlugin.run('myElementId', {
     *   height  : '500px', // the specific height for the modal window, default is auto.
     *   onClose : function(){console.log('myElementId is now closed.');} // the function that will be called once the window is closed. 
     * });
     */
    run: function(elementId, options){
      var instance = this,
          zIndex   = STARTING_ZINDEX,
          $modalWindowElement,
          $modalMaskElement;

      options = options || {};
      
      // register window if it's not already
      if(!_modalWindowMap.hasOwnProperty(elementId)){
        this.register(elementId);
      }
      
      $modalWindowElement = _modalWindowMap[elementId].$element;
      $modalMaskElement   = _modalWindowMap[elementId].$maskElement;
      // configure modalwindow element settings
      if(options.hasOwnProperty('height')){
        $modalWindowElement.css({
          'height'     : options['height'],
          'max-height' : options['height']
        });
      }
      
      // update z-index based on how many modal windows are open currently
      $('body').find(".modal-on").each(function(index){
        // only increment z-index if the window element isn't the same one 
        // (sometimes the same window is open during the opening process).
        if($(this).attr('id') !== elementId){
          zIndex+= 1;
        }
      });

      $modalWindowElement.css({
        "z-index": zIndex + 1
      });
      $modalMaskElement.css({
        "z-index": zIndex
      });
      
      if(options.hasOwnProperty('onResize')){
        $(window).resize(function(){
          options['onResize'].call(instance, $modalWindowElement);
        });
      }
     
      // show the modal window
      $modalWindowElement.fadeIn(FADE_DURATION);
      $modalMaskElement.fadeIn(FADE_DURATION);
      
      $modalWindowElement.removeClass("modal-off");
      $modalWindowElement.addClass("modal-on");

      // add click event on mask
      if(!options.disableMaskClose){
        $modalMaskElement.on('click', function(){
          instance.close(elementId, options);
        });
      }
      
      // add click event on close button
      _modalWindowMap[elementId].$closeButton.on('click', function(){
        instance.close(elementId, options);
      });
    },//-- End /run/
    
    /**
     * Alias for stop
     * Closes the modal window.
     * @see ModalWindowPlugin.stop for more details.
     */
    close: function(elementId, options){
      this.stop(elementId, options);
    },
    
    /**
     * Alias for stop
     * Closes the modal window.
     * @param {String} elementId the id for the modal window container to close.
     */
    stop: function(elementId, options){
      var $maskElement,
          $element;
      
      options = options || {};
      
      if(_modalWindowMap.hasOwnProperty(elementId)){ 
        $maskElement   = _modalWindowMap[elementId].$maskElement;
        $element     = _modalWindowMap[elementId].$element;

        // unbind any events
        $maskElement.off();
        _modalWindowMap[elementId].$closeButton.off();
        
        $element.removeClass("modal-on");
        $element.addClass("modal-off");

        // fadeout the window
        $maskElement.fadeOut(FADE_DURATION);

        _modalWindowMap[elementId].$element.fadeOut(FADE_DURATION, function(){
          // call the onClose method if found
          if(options.hasOwnProperty('onClose')){
            options.onClose.call();
          }
        });
      }//end if modalWindow exists
    }//--End /stop/
  };//-- End ModalWindowPlugin Object
  
  return ModalWindowPlugin;
});