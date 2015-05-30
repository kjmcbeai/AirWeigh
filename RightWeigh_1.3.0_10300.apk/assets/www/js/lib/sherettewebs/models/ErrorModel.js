// Allow for regular and AMD Pattern
(function(ErrorModel){
  if(typeof define === 'function' && define.amd){
    define([], ErrorModel);
  }else{
    this.ErrorModel = ErrorModel();
  }
}(function(){
  var ErrorModel = function(message, code){
    var tmp = Error.call(this, message, code);
    tmp.name = 'ErrorModel';
    tmp.message = message;
    tmp.code = code;
    
    return tmp;
  };
  
  ErrorModel.prototype   = Object.create(Error.prototype);
  ErrorModel.constructor = ErrorModel;
  
  ErrorModel.CODE_MAP = {
    LOCAL_STORAGE_NOT_SUPPORTED: 5,
    INVALID_ARGUMENT: 22,
    OK: 200,
    REQUEST_TIMEOUT: 408,
    INTERNAL_SERVER_ERROR: 500
  };
  
  return ErrorModel;
}));