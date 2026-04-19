sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], function (Controller, MessageToast, MessageBox, formatter) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.DeliveryList", {

        // ─── Inline formatters ─────────────────────────────────────────────
        getStatusState: function (sStatus) {
            switch (sStatus) {
                case "Paid":
                case "Cleared":      return "Success";
                case "Delivered":
                case "Billed":
                case "Sent":
                case "Goods Issued": return "Warning";
                case "Open":
                case "Pending":
                case "Pick Pending":
                case "Delivery Pending": return "Error";
                case "Accepted":     return "Success";
                case "Converted":    return "Information";
                default:             return "None";
            }
        },
        getStatusIcon: function (sStatus) {
            switch (sStatus) {
                case "Paid": case "Cleared": return "sap-icon://accept";
                case "Billed":              return "sap-icon://activity-2";
                case "Delivered":           return "sap-icon://shipping-status";
                default:                    return "sap-icon://status-in-process";
            }
        },
        getDocTypeIcon: function (sType) {
            switch (sType) {
                case "Delivery":         return "sap-icon://delivery-truck";
                case "Billing Document": return "sap-icon://activity-2";
                case "Payment":          return "sap-icon://payment-approval";
                default:                 return "sap-icon://document";
            }
        },
        getPaymentStatusText: function (sStatus) { return sStatus === "Paid" ? "Fully Paid" : "Pending"; },
        isOpen:     function (sStatus) { return sStatus === "Open"; },
        isPending:  function (sStatus) { return sStatus === "Pending"; },
        isAccepted: function (sStatus) { return sStatus === "Accepted"; },


        onNavBack: function () { this.getOwnerComponent().getRouter().navTo("dashboard"); },

        _postGoodsIssue: function (sDeliveryId) {
            var o2c  = this.getOwnerComponent().getModel("o2c");
            var aDs  = o2c.getProperty("/Deliveries");
            var aSOs = o2c.getProperty("/SalesOrders");

            var oD = aDs.find(function (d) { return d.DeliveryId === sDeliveryId; });
            if (!oD || oD.Status === "Delivered") {
                MessageToast.show("Delivery already posted."); return;
            }

            oD.Status          = "Delivered";
            oD.WarehouseStatus = "Goods Issued";
            oD.ActualDate      = new Date().toISOString().split("T")[0];
            o2c.setProperty("/Deliveries", aDs);

            // Update linked Sales Order
            var oSO = aSOs.find(function (s) { return s.SalesOrderId === oD.SalesOrderId; });
            if (oSO && oSO.Status === "Delivery Pending") {
                oSO.Status = "Delivered";
                o2c.setProperty("/SalesOrders", aSOs);
            }

            // Update KPIs
            var oKPIs = o2c.getProperty("/KPIs");
            if (oKPIs.PendingDeliveries > 0) { oKPIs.PendingDeliveries--; }
            o2c.setProperty("/KPIs", oKPIs);

            MessageToast.show("Goods Issue posted for " + sDeliveryId);
        },

        onPostGISingle: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("o2c");
            this._postGoodsIssue(oCtx.getProperty("DeliveryId"));
        },

        onPostGI: function () {
            var o2c  = this.getOwnerComponent().getModel("o2c");
            var aPending = o2c.getProperty("/Deliveries").filter(function (d) { return d.Status === "Pending"; });
            if (!aPending.length) { MessageToast.show("No pending deliveries."); return; }
            MessageBox.confirm("Post Goods Issue for all " + aPending.length + " pending deliveries?", {
                onClose: function (sAction) {
                    if (sAction === "OK") {
                        aPending.forEach(function (d) { this._postGoodsIssue(d.DeliveryId); }.bind(this));
                    }
                }.bind(this)
            });
        }
    });
});
