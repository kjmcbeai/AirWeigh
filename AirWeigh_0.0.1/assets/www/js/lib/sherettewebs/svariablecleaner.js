/**
 * SVariableCleaner is used for cleaning variable types and some validation to make sure the variables you are dealing with are an expected result.
 * NOTE: JQuery is required to be loaded to work.
 * 
 * @author Brandon Sherette
 * @copyright 2013 Brandon Sherette
 * @version 12.8.2013
 * 
 * Modifications
 * ---------------------
 * 12.8.2013
 * 
 *  - Created SCleaner class.
 *  - Added isInt method (public).
 */
var SVariableCleaner = (function($){
  /**
   * Checks to see if the specified variable is an int.
   * @param {Int} varToCheck the variable that will checked if it's an int or not.
   * @returns {Boolean} returns true if the specified variable is an int, false otherwise.
   * @since 12.8.2013
   */
  var isInt = function(varToCheck){
    // configure the pattern to check for int
    var intPattern = /^-{0,1}[0-9]+$/;
    
    return intPattern.test(varToCheck);
  };//end isInt
  
  
  /* RETURN PUBLIC METHODS */
  return {
    isInt : isInt
  };
}(jQuery));//end class