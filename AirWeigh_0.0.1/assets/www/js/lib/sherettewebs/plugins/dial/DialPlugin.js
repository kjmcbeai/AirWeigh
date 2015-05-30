define([
  'sherettewebs'
], function(SheretteWebs){
  var _dialModel = {
        dialValue        : 0,
        prevDialValue    : 0,
        distance         : 0,
        degrees          : 0,
        dialValueDecimal : 0.0,
        fullDialValue    : 100,
        fullDialDegrees  : 360
      },
      _containerElement = null,
      _settings         = {
        onComplete        : function(){},
        textElement       : null,
        textSuffixValue   : '',
        textSuffixElement : null
      },
      _tweenMax, // the tween animation instance used for this dial plugin
      DialPlugin;
  
  DialPlugin = {
    /**
     * Initializes the dial plugin.
     * @param {HtmlElement} dialHtmlElement the container html element that contains the dial to animate.
     * @param {PlainObject} options the options for this dial.
     * @example 
     * SheretteWebs.DialPlugin.init(document.getElementById('dial'), {
     *   dialTextHtmlElement : document.getElementById('dial-text'), // the element that will display the dial value text
     *   fullDialValue       : 5000, // what a full dial represents
     *   fullDialDegrees     : 180, // how far the dial will go in degrees
     *   onComplete          : function(){} // the function that will be called once the dial has completed it's animation sequence
     * }); 
     */
    init: function(dialHtmlElement, options){
      // reset any previous settings
      this.reset();
      
      options           = options || {};
      _containerElement = dialHtmlElement;
      
      _dialModel.fullDialValue    = options['fullDialValue'] || 100;
      _dialModel.fullDialDegrees  = options['fullDialDegrees'] || 360;
      _settings.onComplete        = options['onComplete'] || function(){};
      _settings.textElement       = options['dialTextHtmlElement'] || null;
      _settings.textSuffixValue   = options['textSuffixValue'] || '';
      _settings.textSuffixElement = options['textSuffixElement'] || null;
    },
    
    /**
     * Runs the dial with the specified value.
     * @param {Number} dialValue the value to move the dial to.
     */
    run: function(dialValue){      
      _dialModel.dialValue = dialValue;
      _dialModel.dialValueDecimal = _dialModel.dialValue / _dialModel.fullDialValue;
      _dialModel.degrees = _dialModel.dialValueDecimal * _dialModel.fullDialDegrees;
      _dialModel.distance = _dialModel.dialValue - _dialModel.prevDialValue;
      
      _tweenMax = TweenMax.to(_containerElement, 3, {
        rotation       : _dialModel.degrees,
        onUpdateParams:["{self}"],
        onUpdate       : this.onUpdate,
        onComplete     : this.onComplete
      });
    },
    
    /**
     * Stops the dial plugin. Clears any tween/animations.
     */
    stop: function(){
      _tweenMax.kill();
    },
    
    /**
     * Resets the dial with startin dial settings.
     */
    reset: function(){
      _dialModel = {
        dialValue        : 0,
        prevDialValue    : 0,
        distance         : 0,
        degrees          : 0,
        dialValueDecimal : 0.0,
        fullDialValue    : 100,
        fullDialDegrees  : 360
      };
    },
    
    onUpdate: function(tween){
      var textValue = SheretteWebs.Util.toIntString(tween.totalProgress() * _dialModel.distance + _dialModel.prevDialValue);
      
      if(_settings.textElement !== null){
        if(_settings.textSuffixElement === null){
          _settings.textElement.textContent = textValue + _settings.textSuffixValue;;
        }else{
          _settings.textElement.textContent       = textValue;
          _settings.textSuffixElement.textContent = _settings.textSuffixValue;
        } 
      }
    },
    
    onComplete: function(){
      // update prevDialValue after dial has been completed
      _dialModel.prevDialValue = _dialModel.dialValue;
      _settings.onComplete.call();
    },
    
    /**
     * Gets the dial model.
     * Available Properties:
     * dialModel = {
     *   dialValue, // the value the dial is animating to
     *   dialValueDecimal, // the decimal/percent of how much of the full dialValue the dial value is (dialValue / fullDialValue)
     *   fullDialValue, // the value that represents the dial when it reaches full capacity
     *   fullDialDegrees // the degrees that represents the dial when it reaches full capacity (ex. 180 for half circle, 360 for full circle)
     * }
     * @returns {PlainObject} the dial model used for stoing dial specific data.
     */
    getDialModel: function(){
      return _dialModel;
    },
    
    /**
     * @returns {HtmlElement} the html  element that that dial is contained in (the element that rotates).
     */
    getContainerElement: function(){
      return _containerElement;
    },
    
    /**
     * @returns {HtmlElement} the html element that the text representation will be displayed on. Returns null, if no element was specified during initialization.
     */
    getTextElement: function(){
      return _settings.textElement;
    }
  };
  
  return DialPlugin;
});