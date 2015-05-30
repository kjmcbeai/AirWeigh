define([
  
], function(){
  /**
   * Bluetooth Utility class for any Bluetooth type of actions, such as converting values retrieved from a bluetooth reading action.
   * @type BluetoothPluginUtil
   */
  var BluetoothPluginUtil = {
    /**
     * The BYTE ENDIAN TYPE that is used for a base64String value. Used for converting a base64String to an integer (endian is how the data is ordered).
     */
    ENDIAN_TYPES: {
      LITTLE_ENDIAN : 1,
      BIG_ENDIAN    : 2
    },
    
    /**
     * The types of values that case be converted to.
     */
    CHARACTERISTIC_VALUE_TYPES: {
      STRING : 0,
      INT    : 1,
      HEX    : 2
    },
    
    /**
     * Converts the specified base64String the to the type providied.
     * @param {String} base64String the base64String value to convert (this is usually the value directly recieved from a bluetooth read action).
     * @param {BluetoothPluginUtil.CHARACTERISTIC_VALUE_TYPES} type the type of value the base64String should be converted to.
     * @param {BluetoothPluginUtil.ENDIAN_TYPES} endianType the type of endian value to convert to. Only applies to BluetoothPluginUtil.VALUE_TYPE.INT type conversions.
     * @returns {Mixed} the converted value to the type specified.
     */
    convertValue: function(base64String, type, endianType){
      var value = null;
      
      switch(type){
        case this.CHARACTERISTIC_VALUE_TYPES.STRING:
          value = this.base64ToString(base64String);
          break;
          
        case this.CHARACTERISTIC_VALUE_TYPES.INT:
          value = this.base64ToInt(base64String, endianType);
          break;
          
        case this.CHARACTERISTIC_VALUE_TYPES.HEX:
          value = this.base64ToHex(base64String);
          break;
          
        default:
          throw new ErrorModel('INVALID CONVERSION TYPE: ' + type);
      }//-- END switch
      
      return value;
    },// -- END /convertValue/
    
    /**
     * Converts base64 String into an Int8Array Object.
     * @param {String} base64String the base64 string to convert.
     * @return {Int8Array} the converted base64 string to an Int8Array Object.
     */
    base64ToByteArray: function (base64String){
      var data = atob(base64String);
      var bytes = new Int8Array(data.length);
      for(var i = 0; i < bytes.length; i++){
        bytes[i] = data.charCodeAt(i);
      }

      return bytes;
    }, //-- End /base64ToByteArray/
    
    /**
     * Converts the base64 string to a regular user understandable string.
     * @param {String} base64String the base64 string to convert.
     * @return {String} the converted base64 string.
     */
    base64ToString: function(base64String){
      return atob(base64String);
    }, //-- End /base64ToString/
    
    /**
     * Converts the specified base64 string into an integer. Can deal with byte, 2 bytes, 3 bytes, and 4 bytes of data.
     * @param {String} base64String the base64 string to convert.
     * @return {int} the integer conversion of the specified base64 string.
     */
    base64ToInt: function(base64String, endianType){
      var bytes = this.base64ToByteArray(base64String);
      var value;    

      switch(endianType){
        case this.ENDIAN_TYPES.BIG_ENDIAN:
          value = this.bytesToIntBigEndian(bytes);
          break;

        case this.ENDIAN_TYPES.LITTLE_ENDIAN:
        default:
          value = this.bytesToIntLittleEndian(bytes);
          break;
      }

      return value;
    }, //-- END /base64ToInt/
    
    bytesToIntLittleEndian: function(bytes){
      var byteMask = "0xFF";
      var value;


      switch(bytes.length){
        case 1:
          value = (bytes[0] & byteMask);
          break;

        case 2:
          value = (bytes[0] & byteMask) | (bytes[1] & byteMask) << 8;
          break;

        case 3:
          value = (bytes[0] & byteMask) | (bytes[1] & byteMask) << 8 | (bytes[2] & byteMask) << 16;
          break;

        case 4:
          value = (bytes[0] & byteMask) | (bytes[1] & byteMask) << 8 | (bytes[2] & byteMask) << 16 | (bytes[3] & byteMask) << 24;
          break;

        default:
          alert("BluetoothUtil.base64ToInt currently doesnt support " + bytes.length + " bytes.");
          // TODO: Throw exception or some sort of error.
          value = 0;
          break;
      }

      return value;
    }, //--END /bytesToIntLittleEndian/
    
    bytesToIntBigEndian: function(bytes){
      var byteMask = "0xFF";
      var value;


      switch(bytes.length){
        case 1:
          value = (bytes[0] & byteMask);
          break;

        case 2:
          value = (bytes[1] & byteMask) | (bytes[0] & byteMask << 8);
          break;

        case 3:
          value = (bytes[2] & byteMask) | (bytes[1] & byteMask) << 8 | (bytes[0] & byteMask) << 16;
          break;

        case 4:
          value = (bytes[3] & byteMask) | (bytes[2] & byteMask) << 8 | (bytes[1] & byteMask) << 16 | (bytes[0] & byteMask) << 24;
          break;

        default:
          alert("BluetoothUtil.base64ToInt currently doesnt support " + bytes.length + " bytes.");
          // TODO: Throw exception or some sort of error.
          value = 0;
          break;
      }

      return value;
    }, //--END /bytesToIntBigEndian/
    
    /**
     * Converts the specified base64 string into a hex string value.
     * @param {String} base64String the base64 string to convert from.
     * @returns {String} the hex string value that was converted from the base64 string.
     */
    base64ToHex: function(base64String){
      var asciiString = this.base64ToString(base64String);
      var hex = new Array("0x"); // 0x denotes hex

      for(var i = 0; i < asciiString.length; i++){
        // get the char code and turn it into its hex equivalent (toString(16) denotes the toString to be hex).
        var tmp = asciiString.charCodeAt(i).toString(16);
        // should be in pair values if its a small number like 2 it will ignore the 0 infront of it. 
        // The number 2 for example should be displayed like "02" with a 0 infront of it.
        if(tmp.length === 1){
          tmp = "0" + tmp;
        }

        hex.push(tmp);
      }

      return hex.join("");
    } //-- END /base64ToHex/
  };//-- END BluetoothPluginUtil
  
  return BluetoothPluginUtil;
});