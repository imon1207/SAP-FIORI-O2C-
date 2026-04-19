sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.InquiryCreate", {

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

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("inquiryList");
        },

        onSave: function () {
            var sCust = this.byId("customer").getSelectedKey();
            if (!sCust) { MessageBox.error("Please select a Customer."); return; }

            var o2c        = this.getOwnerComponent().getModel("o2c");
            var aInquiries = o2c.getProperty("/Inquiries");
            var oCustomers = o2c.getProperty("/Customers");
            var oCust      = oCustomers.find(function (c) { return c.CustomerId === sCust; });
            var nVal       = parseFloat(this.byId("estimatedValue").getValue()) || 0;

            var sId = "INQ-2024-" + String(aInquiries.length + 1).padStart(3, "0");
            aInquiries.push({
                InquiryId:    sId,
                CustomerId:   sCust,
                CustomerName: oCust ? oCust.Name : sCust,
                Date:         this.byId("inquiryDate").getValue() || new Date().toISOString().split("T")[0],
                Status:       "Open",
                NetValue:     nVal,
                Currency:     "INR",
                SalesOrg:     this.byId("salesOrg").getSelectedKey(),
                DistChannel:  this.byId("distChannel").getSelectedKey(),
                Division:     "00"
            });
            o2c.setProperty("/Inquiries", aInquiries);

            // Update KPI
            var oKPIs = o2c.getProperty("/KPIs");
            oKPIs.TotalInquiries++;
            o2c.setProperty("/KPIs", oKPIs);

            MessageToast.show("Inquiry " + sId + " created successfully!");
            this.onNavBack();
        }
    });
});
