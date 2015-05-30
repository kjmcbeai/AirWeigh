var sw = sw || {};

sw.event = (function(){
  var eventListeners = {};
  
  // RETURN PUBLIC METHODS/PROPERTIES
  return {
    /**
     * Adds the event listener handler to the even't handler's queue.
     * @param {string} name the name of the event.
     * @param {function} listener the function that will be called once the event is dispatched.
     * @throws {Error} if the params (name, handler) are an invalid types.
     */
    addEventListener: function(name, listener){
      // validate params
      if(typeof(name) !== 'string'){
        throw new Error("Event name is not a valid string.");
      }
      
      if(typeof(listener) !== 'function'){
        throw new Error("Handler is not a function.");
      }
      
      // create event if it doesn't exist
      if(eventListeners[name] === undefined){
        eventListeners[name] = [];
      }
      
      // add the listener
      eventListeners[name].push(listener);
    },//-- End /addEventListener/
    
    /**
     * Dispatches the specified name with the data given.
     * @param {type} name the name of the event to dispatch.
     * @param {type} data the data to dispatch the event with.
     * @throws {Error} if the specified name doesn't exist.
     */
    dispatchEvent: function(name, data){
      var listeners = eventListeners[name],
          x;
      
      if(listeners === undefined){
        //throw new Error("Event doesn't exist.");
        // dispatch should ignore if a listener isn't present, since it's not required.
        return;
      }
      
      // loop through all listeners and invoke them with the specified data
      for(x = 0; x < listeners.length; x+= 1){
        listeners[x].call(this, data);
      }
    },//-- End /dispatchEvent/
    
    removeEventListener: function(name, listener){
      var listeners = eventListeners[name],
          x;
  
      if(listeners === undefined){
        throw new Error("Event doesn't exist.");
      }
      
      for(x = 0; x < listeners.length; x+= 1){
        if(listener === listeners[x]){
          listeners = listeners.slice(x, 1);
          // found the listener, no need to continue loop
          break;
        }
      }
    }//-- End /removeEventListener/
  };
}());