define([
  'AppController',
  'require'
], function(AppController, require){
  var AppUtil = {
    KG_PER_LBS: 0.453592,
    
    requireAppController: function(){
      require('AppController');
    },
   
    /**
     * Converts the specified weight to the correct value based on the profiles unitMeasurement of the selected profile.
     * @param {Number} weight the weight in lbs (will be converted to kg if nessessary).
     * @param {Boolean} toString true if you wish the value to be a number string, false if you want to leave as a number (default value).
     * @returns {Number} the converted weight value.
     */
    convertWeight: function(weight, toString){
      // clone a copy of the value to not change it by reference
      var convertedWeight = JSON.parse(JSON.stringify(weight));
      
      this.requireAppController();
      
      toString = toString || false;
      
      if(AppController.getSelectedProfile().get("unitMeasurement") === "kg"){
        convertedWeight *= this.KG_PER_LBS;
      }
    
      convertedWeight = Math.round(weight);
      if(!toString){
        return convertedWeight;
      }
    
      convertedWeight = convertedWeight.toFixed(0);
      
      return Number(convertedWeight).toLocaleString();
    }//--end /convertWeight/
  };
  
  return AppUtil;
});