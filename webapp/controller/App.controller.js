sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/capstone/o2c/model/models"
], function (Controller, models) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.App", {

        onInit: function () {
            // Set the O2C data model on the component so all views share it
            var oModel = models.createO2CModel();
            this.getOwnerComponent().setModel(oModel, "o2c");
        }
    });
});
