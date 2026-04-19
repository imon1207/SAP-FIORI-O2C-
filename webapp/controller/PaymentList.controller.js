sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Select",
    "sap/ui/core/Item",
], function (Controller, MessageToast, MessageBox, Dialog, Button, VBox, Label, Input, Select, Item, formatter) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.PaymentList", {

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
            oRouter.getRoute("paymentList").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._refreshTotals();
        },

        _refreshTotals: function () {
            var o2c      = this.getOwnerComponent().getModel("o2c");
            var aPayments = o2c.getProperty("/Payments");
            var nCleared  = aPayments.reduce(function (s, p) { return s + (p.Amount || 0); }, 0);
            var oText = this.byId("totalCleared");
            if (oText) { oText.setText("Total Cleared: ₹" + nCleared.toLocaleString("en-IN")); }
        },

        onNavBack: function () { this.getOwnerComponent().getRouter().navTo("dashboard"); },

        onReceivePayment: function (oEvent) {
            var oCtx    = oEvent.getSource().getBindingContext("o2c");
            var sBillId = oCtx.getProperty("BillingId");
            var nAmount = oCtx.getProperty("TotalValue");
            var sCust   = oCtx.getProperty("CustomerName");

            var oInput = new Input({ placeholder: "UTR / Reference #", width: "100%" });
            var oMethod = new Select({ width: "100%" });
            ["NEFT", "RTGS", "IMPS", "Cheque", "Cash"].forEach(function (s) {
                oMethod.addItem(new Item({ key: s, text: s }));
            });

            var oDialog = new Dialog({
                title: "Receive Payment",
                content: new VBox({ items: [
                    new Label({ text: "Customer: " + sCust }),
                    new Label({ text: "Amount (INR): " + nAmount.toLocaleString("en-IN"), design: "Bold" }),
                    new Label({ text: "Payment Method" }),
                    oMethod,
                    new Label({ text: "UTR / Reference #" }),
                    oInput
                ], class: "sapUiSmallMargin" }),
                beginButton: new Button({
                    text: "Confirm",
                    type: "Emphasized",
                    press: function () {
                        this._postPayment(sBillId, nAmount, oCtx.getProperty("CustomerId"), sCust, oMethod.getSelectedKey(), oInput.getValue());
                        oDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({ text: "Cancel", press: function () { oDialog.close(); } })
            });
            this.getView().addDependent(oDialog);
            oDialog.open();
        },

        _postPayment: function (sBillId, nAmount, sCustId, sCustName, sMethod, sRef) {
            var o2c      = this.getOwnerComponent().getModel("o2c");
            var aPayments = o2c.getProperty("/Payments");
            var aBills    = o2c.getProperty("/BillingDocs");
            var aSOs      = o2c.getProperty("/SalesOrders");

            var sPayId = "PAY-2024-" + String(aPayments.length + 1).padStart(4, "0");
            aPayments.push({
                PaymentId:    sPayId,
                BillingId:    sBillId,
                CustomerId:   sCustId,
                CustomerName: sCustName,
                PaymentDate:  new Date().toISOString().split("T")[0],
                Amount:       nAmount,
                Currency:     "INR",
                Method:       sMethod || "NEFT",
                Reference:    sRef || ("UTR" + Date.now()),
                Status:       "Cleared"
            });
            o2c.setProperty("/Payments", aPayments);

            // Mark bill as paid
            var oBill = aBills.find(function (b) { return b.BillingId === sBillId; });
            if (oBill) { oBill.Status = "Paid"; o2c.setProperty("/BillingDocs", aBills); }

            // Mark Sales Order as Paid
            if (oBill) {
                var oSO = aSOs.find(function (s) { return s.SalesOrderId === oBill.SalesOrderId; });
                if (oSO) { oSO.Status = "Paid"; o2c.setProperty("/SalesOrders", aSOs); }
            }

            // Update KPIs
            var oKPIs = o2c.getProperty("/KPIs");
            oKPIs.PaidThisMonth = (oKPIs.PaidThisMonth || 0) + nAmount;
            o2c.setProperty("/KPIs", oKPIs);

            this._refreshTotals();
            MessageToast.show("Payment " + sPayId + " posted. ₹" + nAmount.toLocaleString("en-IN") + " cleared.");
        },

        onPostPayment: function () {
            MessageToast.show("Select an open invoice below and click 'Receive Payment'.");
        }
    });
});
