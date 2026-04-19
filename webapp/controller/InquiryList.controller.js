sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
], function (Controller, Filter, FilterOperator, MessageToast, formatter) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.InquiryList", {

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
            this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        onCreate: function () {
            this.getOwnerComponent().getRouter().navTo("inquiryCreate");
        },

        onSearch: function (oEvent) {
            var sQuery   = oEvent.getParameter("query");
            var oBinding = this.byId("inquiryTable").getBinding("items");
            if (sQuery) {
                oBinding.filter([new Filter({
                    filters: [
                        new Filter("CustomerName", FilterOperator.Contains, sQuery),
                        new Filter("InquiryId",    FilterOperator.Contains, sQuery)
                    ],
                    and: false
                })]);
            } else {
                oBinding.filter([]);
            }
        },

        onItemPress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("o2c");
            MessageToast.show("Inquiry: " + oCtx.getProperty("InquiryId"));
        },

        onConvertToQuotation: function (oEvent) {
            var oCtx   = oEvent.getSource().getBindingContext("o2c");
            var sInqId = oCtx.getProperty("InquiryId");
            var o2c    = this.getOwnerComponent().getModel("o2c");

            // Mark inquiry as converted
            var aInquiries = o2c.getProperty("/Inquiries");
            var oInq = aInquiries.find(function (i) { return i.InquiryId === sInqId; });
            if (oInq) { oInq.Status = "Converted"; }
            o2c.setProperty("/Inquiries", aInquiries);

            // Create a new quotation from inquiry
            var aQuotations = o2c.getProperty("/Quotations");
            var sQtId = "QT-2024-" + String(aQuotations.length + 1).padStart(3, "0");
            var dValid = new Date(); dValid.setDate(dValid.getDate() + 30);
            aQuotations.push({
                QuotationId:  sQtId,
                InquiryId:    sInqId,
                CustomerId:   oCtx.getProperty("CustomerId"),
                CustomerName: oCtx.getProperty("CustomerName"),
                Date:         new Date().toISOString().split("T")[0],
                ValidTo:      dValid.toISOString().split("T")[0],
                Status:       "Sent",
                NetValue:     oCtx.getProperty("NetValue"),
                Currency:     "INR"
            });
            o2c.setProperty("/Quotations", aQuotations);

            MessageToast.show("Quotation " + sQtId + " created from Inquiry " + sInqId);
            this.getOwnerComponent().getRouter().navTo("quotationList");
        }
    });
});
