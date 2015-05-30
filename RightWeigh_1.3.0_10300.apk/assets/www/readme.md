# Settings Model Structure #
---

### 2014.11.24 v0.0.3 ###
---

**SettingsModel**

  * unitMeasurement
  * profiles (ProfileCollection)
    * **ProfileModel**
      * id
      * name
      * configImgUrl
      * truckDevices (TruckDeviceCollection)
        * **TruckDevice**
          * id
          * **bluetoothDeviceModel**
            * id
            * name
            * address
         * **truckWeightModel**
             * id
             * truckAxles (TruckAxleCollection)
               * **TruckAxleModel**
                 * name
                 * weight
                 * alertWeight
                 * enum
                 * weightUuid
                 * nameUuid