/**
 * Mask Dial Plugin
 * @author Brandon Sherette
 * @description Helps create a mask dial.
 * @version 0.0.4
 * Created on 2014.9.6
 * Modified on 2015.3.7
 * 
 * Modifications
 * --------------------
 * v0.0.4 (2015.3.7)
 *   - Made it so that the dial can't exceed the dial max degree cap.
 * 
 * v0.0.3 (2014.9.16)
 *   - Added easing functionality with the easing library.
 *   - Cleaned up code to fit the new easing functionality.
 */

// Allow both AMD or Regular implementation
(function(MaskDialPlugin){
  if(typeof define === 'function' && define.amd){
    define(['jquery', 'easing'], MaskDialPlugin);
  }else{
    MaskDialPlugin(jQuery, easing);
  }
}(function($, Easing){
  var DIRECTION_FORWARD    = 1,
      DIRECTION_BACKWARD   = -1,
      TIMELINE_STATUS_PLAY = 1,
      TIMELINE_STATUS_STOP = 0,
      TIMELINE_STATUS_END  = -1,
      _dialModel = {},
      _settings = {},
      _dialMaskAngleCoordinates = [],
      _dialAnimationModel = {},
      _jqueryMap = {},
      _configureMaskAngleCoordinates,
      _calculateAngleCoordinates,
      _endAnimation,
      _rotateDial,
      _animate,
      _onUpdate,
      _onComplete,
      MaskDialPlugin;
      
  // setup animation frame
  window.requestAnimationFrame =  window.requestAnimationFrame || 
                                  window.mozRequestAnimationFrame ||
                                  window.webkitRequestAnimationFrame || 
                                  window.oRequestAnimationFrame;
  
  /**
   * Creates a new MaskDialPlugin with the specified dialHtmlElement and settings.
   * @param {String} dialContainerHtmlElement the selector for the html element container that holds the entire dial.
   * @param {PlainObject} settings the settings you wish to apply to the MaskDialPlugin.
   * @example 
   * var maskDial = new MaskDialPlugin($('#weight-dial'), {
   *   fullDialValue : 5000,
   *   fullDialDegrees : 360,
   *   onUpdate : function(tween, dialModel){
   *     // maybe update the text display for the dial
   *   },
   *   onComplete : function(){
   *     // dial's animation has been completed, maybe refresh the data at this time
   *   }
   * });
   * @returns {MaskDialPlugin} the created MaskDialPlugin.
   */
  MaskDialPlugin = function(dialContainerHtmlElement, settings){
    var $dialContainer = $(dialContainerHtmlElement);
    
    _jqueryMap = {
      dialContainer     : $dialContainer,
      dial              : $dialContainer.find('.mask-dial__dial'), 
      rotatableElements : $dialContainer.find('.dial-rotate')
    };
    
    _settings = $.extend(this.defaultSettings, settings);
    _configureMaskAngleCoordinates();
    this.resetDialModel();
    this.resetDialAnimationModel();
  };
  
  /**
   * Configures the mask angle coordinates. 
   * These are the set coordinates for all 45 degree sections of the dial.
   */
  _configureMaskAngleCoordinates = function(){
    _dialMaskAngleCoordinates = [
      "0px " + _jqueryMap.dial.height() + "px", // 45
      "0px " + _jqueryMap.dial.height() / 2 + "px", // 90
      "0px 0px", // 135
      _jqueryMap.dial.width() / 2 + "px 0px", // 180
      _jqueryMap.dial.width() + "px 0px", // 225
      _jqueryMap.dial.width() + "px " + _jqueryMap.dial.height() / 2 + "px", // 270
      _jqueryMap.dial.width() + "px " + _jqueryMap.dial.height() + "px", // 315
      _jqueryMap.dial.width() / 2 + "px " + _jqueryMap.dial.height() + "px" // 360
    ];
  };
  
  /**
   * The default settings for the Mask Dial Plugin.
   */
  MaskDialPlugin.prototype.defaultSettings = {
    fullDialValue   : 100,
    fullDialDegrees : 360,
    onUpdate        : function(dialModel){},
    onComplete      : function(dialModel){}
  };
  
  /**
   * Resets the dial model settings.
   */
  MaskDialPlugin.prototype.resetDialModel = function(){
    _dialModel = {
      dialValue           : 0, // the current dial value to achieve when animating
      prevDialValue       : 0, // the previous dial value (if it was runned perviously)
      distance            : 0, // the distance from the last dial placement
      direction           : 1, // 1 for foward (default), -1 for backwards
      degrees             : 0, // the calculated degrees the dial will rotate
      dialValueDecimal    : 0.0, // the decimal representing the percentage of the dial will rotate to
      fullDialValue       : _settings.fullDialValue, // what a full dial will represent
      fullDialDegrees     : _settings.fullDialDegrees, // the full dial value in degrees (360 is a full circle)
      inProgressDialValue : 0, // the value of the dial it's currently at during the running animation sequence this is updated within the onUpdate method
      inProgressDegrees   : 0 // the degree value the dial is currently at during the running animation sequence
    };
  };
  
  MaskDialPlugin.prototype.resetDialAnimationModel = function(){
   _dialAnimationModel = {
     curDegrees         : 0,
     iteration          : 0,
     totalIteration     : 15,
     isCompleted        : false,
     timelineStatus     : TIMELINE_STATUS_STOP
   };
  };
  
  /**
   * Runs the dial with the specified value.
   * @param {int} dialValue the value the dial with rotate to based on the fullDialValue settings.
   */
  MaskDialPlugin.prototype.run = function(dialValue){
    // configure the new settings for the dial model for this run
    _dialModel.prevDegrees = _dialModel.degrees;
    _dialModel.dialValue = dialValue;
    _dialModel.dialValueDecimal = _dialModel.dialValue / _dialModel.fullDialValue;
    _dialModel.degrees = _dialModel.dialValueDecimal * _dialModel.fullDialDegrees;
    _dialModel.distance = _dialModel.dialValue - _dialModel.prevDialValue;
    _dialModel.degreeDistance = Math.abs(_dialModel.degrees - _dialModel.prevDegrees);
    _dialModel.direction = (_dialModel.distance >= 0) ? DIRECTION_FORWARD : DIRECTION_BACKWARD;

    // reset animation model and start the animation
    _dialAnimationModel.curDegreeIncrement = 0.0;
    _dialAnimationModel.iteration = 0;
    _dialAnimationModel.isCompleted = false;
    _dialAnimationModel.timelineStatus  = TIMELINE_STATUS_PLAY;
    requestAnimationFrame(_animate);
  };
  
  /**
   * Animates the mask dial.
   */
  _animate = function(){  
    var degrees  = 0;
    
    if(_dialAnimationModel.timelineStatus === TIMELINE_STATUS_END){
      _endAnimation();
      // prevent any further execution of the _animate method
      return;
    }
    
    // update iteration
    _dialAnimationModel.iteration+= 1;
    // update degree increment
    degrees = Math.abs(
        Easing.easeInOutExpo(
            _dialAnimationModel.iteration, 
            _dialModel.prevDegrees, 
            _dialModel.degreeDistance * _dialModel.direction, 
            _dialAnimationModel.totalIteration
        )
    );
    
    if(_dialAnimationModel.iteration === _dialAnimationModel.totalIteration){
      _dialAnimationModel.isCompleted = true;
      // making sure degrees is at its destination, since animation has been completed
      degrees = _dialModel.degrees;
    }
    
    /* ADDED BY BRANDON SHERETTE 2015.3.7 v0.0.4 */
    // make sure degress doesnt exceed the cap
    degrees = (degrees > _settings.fullDialDegrees) ? _settings.fullDialDegrees : degrees;
    
    _dialAnimationModel.curDegrees = degrees;
    _rotateDial(degrees);
    _onUpdate();
    
    // check to see if we finished the animation
    if(_dialAnimationModel.isCompleted){
      // completed animation
      _onComplete();
    }else{
      // dial has been updated and need to be animated again
      requestAnimationFrame(_animate);
    }
  };
  
  /**
   * Ends the animation by forcing the dial to the target degrees.
   */
  _endAnimation = function(){
    _dialAnimationModel.iteration  = _dialAnimationModel.totalIteration;
    _dialAnimationModel.curDegrees = _dialModel.degrees;
    _rotateDial(_dialAnimationModel.curDegrees);
    _onUpdate();
  };
  
  /**
   * Rotates the dial to the specified degrees.
   * @param {Number} degrees the degrees to rotate to.
   */
  _rotateDial = function(degrees){
    var angleIncrement       = 45, // circular dial is separated in 7 sections of 45 degree increments (8th being the 0 point)
        numOfAngleIncrements = 0, // how many angle increments there is for rotation clipping
        dialWidth            = _jqueryMap.dial.width(),
        dialHeight           = _jqueryMap.dial.height(),
        coordinates = {
          xPoint: 0,
          yPoint: 0
        }, // the last set of coordinates to add the the clipping polygon (outside of the angle increment)
        leftOverDegrees, // how many degrees are left after angleIncrements are removed to figure out the length of the angles remaining for the clipping
        clipPoints, // the points to add to the clipping area of the dial
        x; // loop variable
        
    // start the clip points at the middle of the dial and the bottom center of the dial
    clipPoints = dialWidth / 2 + "px " + dialHeight / 2 + "px, " + dialWidth / 2 + "px " + dialHeight + "px, ";
    
    // find out how many degree increments the specified degree value is
    numOfAngleIncrements = Math.floor(degrees / angleIncrement);
    leftOverDegrees = degrees - (numOfAngleIncrements * angleIncrement);

    // add set angle points based on how many set angle increments have been passed
    for (x = 0; x < numOfAngleIncrements; x += 1) {
      // prevent index out of bounds, should only go through 4 quaderants specified
      if (x >= _dialMaskAngleCoordinates.length) {
        break;
      }

      clipPoints += _dialMaskAngleCoordinates[x] + ",";
    }
    
    // only calculate angle coordinates for a non increment and is not over a full dial value.
    if (leftOverDegrees > 0 && degrees <= _settings.fullDialDegrees) {
      coordinates = _calculateAngleCoordinates(numOfAngleIncrements, leftOverDegrees);

      // add the last calculated point
      clipPoints += coordinates.xPoint + "px " + coordinates.yPoint + "px";
    } else {
      // remove last comma, since we are dealing with a degree within the exact measurements of a increment (example degreess === 45 and increments are 45)
      clipPoints = clipPoints.slice(0, -1);
    }//end if calculate degree length (not a set angle point)

    // adjust the dial with the new clipping mask
    _jqueryMap.dial.css({
      "-webkit-clip-path": "polygon(" + clipPoints + ")"
    });
    
    // rotate any rotatable elements
    _jqueryMap.rotatableElements.css({
      "transform"         : "rotate(" + degrees + "deg)",
      "-webkit-transform" : "rotate(" + degrees + "deg)",
      "-ms-transform"     : "rotate(" + degrees + "deg)"
    });
  };

  /**
   * Calculates the coordinates for the remaining dial angle.
   * @param {int} numOfAngleIncrements the number of 45 degree angle increments the dial has passed.
   * @param {int} leftOverDegrees the number of degrees left from the 45 degree increments.
   * @returns {PlainObject} coordinates for the not 45 degree angle point (the last point of the clip point).
   */
  _calculateAngleCoordinates = function(numOfAngleIncrements, leftOverDegrees) {
    var coordinates = {
          xPoint: 0,
          yPoint: 0
        },
        dialWidth  = _jqueryMap.dial.width(),
        dialHeight = _jqueryMap.dial.height();

    switch (numOfAngleIncrements) {
      case 0: // within 45 degrees
        // y is stationary at at the bottom of the dial
        coordinates.xPoint = (dialWidth / 2) - Math.round(Math.tan(leftOverDegrees * Math.PI / 180) * (dialHeight / 2));
        coordinates.yPoint = dialHeight;
        break;

      case 1: // within 90 degrees
        //xPoint is stationary y is movable
        leftOverDegrees = 45 - leftOverDegrees; // must find value of inverse right triangle
        coordinates.xPoint = 0;
        coordinates.yPoint = (dialHeight / 2) + Math.round(Math.tan(leftOverDegrees * Math.PI / 180) * (dialWidth / 2));
        break;

      case 2: // within 135 degrees
        // xPoint is stationary
        coordinates.xPoint = 0;
        coordinates.yPoint = (dialHeight / 2) - Math.round(Math.tan(leftOverDegrees * Math.PI / 180) * (dialWidth / 2));
        break;

      case 3: // within 180 degrees
        // yPoint is stationary
        leftOverDegrees = 45 - leftOverDegrees; // must inverse the triangle to get the point to utilize right traingle
        coordinates.xPoint = (dialWidth / 2) - Math.round(Math.tan(leftOverDegrees * Math.PI / 180) * (dialHeight / 2));
        coordinates.yPoint = 0;
        break;

      case 4: // within 225 degrees
        // yPoint is stationary
        coordinates.xPoint = (dialWidth / 2) + Math.round(Math.tan(leftOverDegrees * Math.PI / 180) * (dialHeight / 2));
        coordinates.yPoint = 0;
        break;

      case 5: // within 270 degrees
        // xPoint is stationary
        leftOverDegrees = 45 - leftOverDegrees; // must inverse the triangle to get the point to utilize right traingle
        coordinates.xPoint = dialWidth;
        coordinates.yPoint = (dialHeight / 2) - Math.round(Math.tan(leftOverDegrees * Math.PI / 180) * (dialWidth / 2));
        break;

      case 6: // within 315 degrees
        // xPoint is stationary
        coordinates.xPoint = dialWidth;
        coordinates.yPoint = (dialHeight / 2) + Math.round(Math.tan(leftOverDegrees * Math.PI / 180) * (dialWidth / 2));
        break;

      case 7: // within 360 degrees
        // yPoint is stationary
        leftOverDegrees = 45 - leftOverDegrees; // must inverse the triangle to get the point to utilize right traingle
        coordinates.xPoint = (dialWidth / 2) + Math.round(Math.tan(leftOverDegrees * Math.PI / 180) * (dialHeight / 2));
        coordinates.yPoint = dialHeight;
        break;
    }//end switch-case

    return coordinates;
  };//--End /calculateAngleCoordinates/
  
  /**
   * Stops any animations and does any other garbage collection.
   */
  MaskDialPlugin.prototype.stop = function(){
    // TODO: Add a stop/kill action for the dial animation
    //_timelineMax.kill();
    _dialAnimationModel.timelineStatus = TIMELINE_STATUS_END;
  };
  
  /**
   * The event that the dial animation has just completed one frame/cycle.
   * Updates dialModel information and calls the settings onUpdate method with the tween and dialModel properties).
   */
  _onUpdate = function(){
    var dialModel = {},
        totalProgress = _dialAnimationModel.iteration / _dialAnimationModel.totalIteration;

    // calculate totalProgress
    if(_dialAnimationModel.isCompleted){
      // make sure totalProgress is 1 if the animation cycle has been completed
      totalProgress = 1;
    }
    
    // update any dialModel information before sending on update to the user
    _dialModel.inProgressDialValue = totalProgress * _dialModel.distance + _dialModel.prevDialValue;
    _dialModel.inProgressDegrees = _dialModel.inProgressDialValue * _dialModel.fullDialDegrees / _dialModel.fullDialValue;

    // clone dialModel to send to onUpdate to prevent overriding values (avoids pass by reference)
    dialModel = $.extend({}, _dialModel);
    // pass up update to the custom settings onUpdate method
    _settings.onUpdate.call(this, dialModel);
  };
  
  /**
   * The event the the dial has completed its animation sequence.
   * Updates the previous dial value and call the settings onComplete method.
   */
  _onComplete = function(){
    var dialModel;
    
    // update prevDialValue after dial has been completed
    _dialModel.prevDialValue = _dialModel.dialValue;
    
    // clone dialModel to send to onUpdate to prevent overriding values (avoids pass by reference)
    dialModel = $.extend({}, _dialModel);
    _settings.onComplete.call(this, dialModel);
  };
  
  // return the created plugin
  return MaskDialPlugin;
}));