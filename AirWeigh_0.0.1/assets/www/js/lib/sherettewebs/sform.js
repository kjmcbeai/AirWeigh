/**
 * SForm Actions for dealing with forms, such as validation. 
 * NOTE: JQuery is required to be loaded to work.
 * 
 * @author Brandon Sherette
 * @copyright 2013 Brandon Sherette
 * @version 12.7.2013
 * 
 * Modifications
 * ---------------------
 * 12.7.2013
 * 
 *  - Created SForm Class.
 *  - Added onSubmitForm method (public).
 *  - Added cancelDefaultEvent method (private).
 */
var SForm = (function($){  
  /**
   * The event the form is to be evaluated and submitted if it passes validation, otherwise it indicates to the user what is the problem.
   * Place this event on the form element such as: 
   * [form onsubmit="SForm.onSubmitForm();"][/form]
   * Add the required css class to all input elements in the form that are required before form submission.
   * 
   * @returns {Boolean} returns true if the form is to be submitted, false otherwise.
   * @since 12.7.2013
   */
  var onSubmitForm = function(){
    // need to find out what element cause this event to trigger.
    var eventElement = window.event.target || window.event.srcElement;
    cancelDefaultEvent(window.event); // debug
    
    // eventElement should be a form (validateForm checks for this).
    if(!validateForm(eventElement)){
      // form is invalid, so need to prevent the form being submitted, and display what errors occurred.
      cancelDefaultEvent(window.event);
      //console.log("Invalid Form");
      
      return false;
    }//end if isForm
    
    // form is valid, so let it be submitted.
    //console.log("Form OK. Submitting Now!");
    return true;
  };//end onSubmitForm
  
  
  var simulateOnSubmitForm = function(formId){
    cancelFormSubmit(formId);
    return validateForm(document.getElementById(formId));
  };
  
  
  var cancelFormSubmit = function(formId){
    document.getElementById(formId).onsubmit = function(){
      return false;
    };
  };
  
  
  /**
   * Validates the form specified. (Adds indicators the the input elements if it's invalid of why it was invalid).
   * @param {FormElement} form the form element that contains all the input elements to validate.
   * @returns {Boolean} true if the form is valid, false otherwise.
   * @since 12.7.2013
   */
  function validateForm(form){
    if(!$(form).is("form")){
      // form is not a form, so no need to validate.
      return true;
    }
    
    var id = $(form).attr('id');
    var formValid = true;
    
    // need to go through all the inputs in the form and validate each element.
    $('#'+id+' :input').each(function(key, value){
      if(!validFormInput(value)){
        formValid = false;
      }
    });//end filter input
    
    //return false; // debug
    return formValid;
  }//end isForm
  
  
  /**
   * Checks to see if the form input is valid.
   * @param {HTMLInputElement} inputElement the HTMLInputElement to check if valid.
   * @returns {Boolean} true if input element is valid, false otherwise.
   * @since 12.7.2013
   */
  function validFormInput(inputElement){
    // only check if valid element
    var elementType = cleanInputElementType(inputElement);
    var elementValue = $(inputElement).val();
    
    // elementType will be null if inputElementType is not a valid type or not found.
    if(elementType === null){
      //console.log("not HTMLInputElement");
      return true;
    }
    
    // check if required and has empty value
    // select-multiple and other array type value input elements will have null if it's empty.
    if($(inputElement).hasClass('required') && (elementValue === '' || elementValue === null)){
      // check if empty
      //console.log("Input is required.");
      addErrorMessageToElement(inputElement, "Required");
      return false;
    }
    
    // text specific validation
    
    if(elementType === "text"){
      var validationType = $(inputElement).attr('data-sform-validation-type');
      
      // check if validation is for int
      switch(validationType){
        case 'int':
          //var min = $(inputElement).attr('data-sform-min') || null;
          //var max = $(inputElement).attr('data-sform-max') || null;
          
          // need to make sure int
          //var intPattern = /^[0-9]*$/;
          //if(!intPattern.test(elementValue) || (min !== null && elementValue < min) || (max !== null && elementValue > max)){
          if(!SVariableCleaner.isInt(elementValue)){
            //console.log("not valid int");
            addErrorMessageToElement(inputElement, "Integer Required");
            return false;
          }
          //console.log("valid int");
          
          break;
        default:
          
          break;
      }//end switch
    }//end if elementType is text
    
    
    //console.log("Input Valid");
    
    // before returning true need to remove any old error messages, since if inputElement made it here, then it's valid.
    removeErrorMessageFromElement(inputElement);
    return true;
  }//end validateFormInput
  
  
  /**
   * Adds an error message along side of the htmlElement (uses a span tag and an id to it that matches the htmlElement prefixed with error, 
   * and adds the class "error" to it such as:
   * [span id="htmlElementID_error" class="error"]message[/span]
   * @param {htmlElement} htmlElement the htmlElement that the message will be applied to.
   * @param {String} message the message to add to the error span.
   * @since 12.7.2013
   */
  function addErrorMessageToElement(htmlElement, message){
    var id = $(htmlElement).attr('id') || null;
    
    // only add error message if valid element to work with.
    if(id !== null){
      var errorID = id+"_error";
      if(!document.getElementById(errorID)){
        //console.log("error span doesnt exist. Creating it now.");
        $("#"+id).after("<span class='error' id='"+errorID+"'></span>");
      }
      
      // update message
      $("#"+errorID).html(message);
    }//end if id is available
  }//end addErrorMessage
  
  
  /**
   * Removes the error message associated with the specified htmlElement if it exists.
   * @param {htmlElement} htmlElement the htmlElement that had the error message associated with it.
   * @since 12.7.2013
   */
  function removeErrorMessageFromElement(htmlElement){
    var id = $(htmlElement).attr('id') || null;
    
    if(id !== null && document.getElementById(id+"_error")){
      $("#"+id+"_error").html("");
    }
  }//end removeErrorMessageFromElement
  
  
  /**
   * Cleans the input element type for valid types and returns the type that was found for the inputElement.
   * @param {HTMLInputElement} inputElement the HTMLInputElement to check.
   * @returns {String} returns the cleaned input element type, returns null if the type found is not found or is not a valid input type.
   * @since 12.7.2013
   */
  function cleanInputElementType(inputElement){
    var validInputTypes = new Array("text", "textarea", "select-one", "select-multiple");
    //var type = $(inputElement).SUtil().SUtil("getType");
    var type = getType(inputElement);
    //var type = ($(inputElement).attr('type') !== undefined) ? $(inputElement).attr('type') : inputElement.tagName;
    //console.log("TYPE: "+type);// debug
    
    // type must be a valid input type to allow further use of the inputElement. 
    if(validInputTypes.indexOf(type) >= 0){
      return type;
    }
    
    return null;
  }//end cleanInputElementType
  
  
  
  /*
  function isValidIntTextbox(elementID, min, max){
    min = (min === undefined || typeof min !== 'number') ? 0 : min;
    max = (max === undefined || typeof max !== 'number') ? '' : max;
    var jqElement = $('#'+elementID);
    
    jqElement.change(function(){
      var value = jqElement.val();
      if(typeof value !== 'number' &&)
    });
  }//end onValidateIntText
  */
 
 
 function getType(element){
    try {
      var type = ($(element).prop('type')) ? $(element).prop('type') : element.tagName;
      // make sure type is lower case
      type = type.toLowerCase();
    } catch (error) {
      type = null;
    }//end try-catch

    //console.log("AType: "+type);// debug
    return type;
 }
 
 
  
  /**
   * Cancels the default event action.
   * @param {event} e the event to cancel the default action.
   * @returns {Boolean} false to help prevent default action for certain browsers.
   * @since 12.7.2013
   */
  function cancelDefaultEvent(e){
    // checks to see if the event is defined, if not gets the event from the window.
    e = (e) ? e : window.event;
    // use prevent default if it's an option in the event.
    if(e.preventDefault){
      e.preventDefault();
    }
    
    // depending on the browser set returnValue to false, and return false to finish up preventing the form default action.
    //e.returnValue = false;
    return false;
  }//end cancelDefaultEvent
  
  
  
  /* RETURN PUBLIC METHODS */
  return {
    onSubmitForm: onSubmitForm,
    simulateOnSubmitForm: simulateOnSubmitForm,
    cancelFormSubmit: cancelFormSubmit
  };
}(jQuery));