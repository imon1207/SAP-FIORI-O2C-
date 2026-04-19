sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.QuotationCreate", {

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

        onNavBack: function () { this.getOwnerComponent().getRouter().navTo("quotationList"); },

        onSave: function () {
            var sCust = this.byId("customer").getSelectedKey();
            if (!sCust) { MessageBox.error("Please select a Customer."); return; }
            var sValid = this.byId("validTo").getValue();
            if (!sValid) { MessageBox.error("Please set a Valid To date."); return; }

            var o2c   = this.getOwnerComponent().getModel("o2c");
            var aQts  = o2c.getProperty("/Quotations");
            var oCusts= o2c.getProperty("/Customers");
            var oCust = oCusts.find(function (c) { return c.CustomerId === sCust; });
            var nVal  = parseFloat(this.byId("netValue").getValue()) || 0;
            var sQtId = "QT-2024-" + String(aQts.length + 1).padStart(3, "0");

            aQts.push({
                QuotationId:  sQtId,
                InquiryId:    this.byId("inquiryRef").getSelectedKey(),
                CustomerId:   sCust,
                CustomerName: oCust ? oCust.Name : sCust,
                Date:         this.byId("quotDate").getValue() || new Date().toISOString().split("T")[0],
                ValidTo:      sValid,
                Status:       "Sent",
                NetValue:     nVal,
                Currency:     "INR"
            });
            o2c.setProperty("/Quotations", aQts);

            var oKPIs = o2c.getProperty("/KPIs");
            oKPIs.TotalQuotations++;
            o2c.setProperty("/KPIs", oKPIs);

            MessageToast.show("Quotation " + sQtId + " created successfully!");
            this.onNavBack();
        }
    });
});
