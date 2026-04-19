sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], function (Controller, MessageToast, MessageBox, formatter) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.BillingList", {

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


        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("billingList").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._refreshOpenTotal();
        },

        _refreshOpenTotal: function () {
            var o2c  = this.getOwnerComponent().getModel("o2c");
            var aBills = o2c.getProperty("/BillingDocs");
            var nOpen  = aBills.filter(function (b) { return b.Status === "Open"; })
                              .reduce(function (s, b) { return s + (b.TotalValue || 0); }, 0);
            var oText = this.byId("totalOpen");
            if (oText) { oText.setText("Open Receivables: ₹" + nOpen.toLocaleString("en-IN")); }
        },

        onNavBack: function () { this.getOwnerComponent().getRouter().navTo("dashboard"); },

        onCreate: function () {
            // Auto-create billing from delivered, un-billed Sales Orders
            var o2c   = this.getOwnerComponent().getModel("o2c");
            var aSOs  = o2c.getProperty("/SalesOrders");
            var aBills = o2c.getProperty("/BillingDocs");
            var aDeliveries = o2c.getProperty("/Deliveries");

            var aBilledSOs = aBills.map(function (b) { return b.SalesOrderId; });
            var aEligible  = aSOs.filter(function (s) { return s.Status === "Delivered" && aBilledSOs.indexOf(s.SalesOrderId) === -1; });

            if (!aEligible.length) {
                MessageToast.show("No delivered orders available for billing."); return;
            }

            aEligible.forEach(function (oSO) {
                var sDel = aDeliveries.find(function (d) { return d.SalesOrderId === oSO.SalesOrderId; });
                var sBillId = "BILL-2024-" + String(aBills.length + 1).padStart(4, "0");
                var nNet    = oSO.NetValue || 0;
                var nTax    = Math.round(nNet * 0.18);
                var dDue    = new Date(); dDue.setDate(dDue.getDate() + 30);

                aBills.push({
                    BillingId:    sBillId,
                    DeliveryId:   sDel ? sDel.DeliveryId : "",
                    SalesOrderId: oSO.SalesOrderId,
                    CustomerId:   oSO.CustomerId,
                    CustomerName: oSO.CustomerName,
                    BillingDate:  new Date().toISOString().split("T")[0],
                    DueDate:      dDue.toISOString().split("T")[0],
                    NetValue:     nNet,
                    TaxValue:     nTax,
                    TotalValue:   nNet + nTax,
                    Currency:     "INR",
                    Status:       "Open"
                });

                // Update SO status
                oSO.Status = "Billed";
            });

            o2c.setProperty("/BillingDocs", aBills);
            o2c.setProperty("/SalesOrders", aSOs);
            this._refreshOpenTotal();

            MessageToast.show(aEligible.length + " billing document(s) created.");
        }
    });
});
