/**
 * Gets the first element in the array that has the specified property and value pair.
 * @param {String} propertyName the property name to search for.
 * @param {String} propertyValue the property value to search for.
 * @returns {mixed} the element in the array with the specified propertyname and value pair. Returns null if no match was found.
 */
Array.prototype.getItemByProperty = function(propertyName, propertyValue){
  var array = this;
  for(var key in array){
    var element = array[key];
    if(element.hasOwnProperty(propertyName) && element.propertyName === propertyValue){
      return element;
    }
    
    return null;
  }
};

// Enable the passage of the 'this' object through the JavaScript timers
var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;
 
window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
  var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
  return __nativeST__(vCallback instanceof Function ? function () {
    vCallback.apply(oThis, aArgs);
  } : vCallback, nDelay);
};
 
window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
  var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
  return __nativeSI__(vCallback instanceof Function ? function () {
    vCallback.apply(oThis, aArgs);
  } : vCallback, nDelay);
};