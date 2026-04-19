sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
], function (Controller, Filter, FilterOperator, MessageToast, formatter) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.QuotationList", {

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
        onCreate:  function () { this.getOwnerComponent().getRouter().navTo("quotationCreate"); },

        onSearch: function (oEvent) {
            var sQ = oEvent.getParameter("query");
            var oB = this.byId("quotTable").getBinding("items");
            oB.filter(sQ ? [new Filter({ filters: [
                new Filter("CustomerName", FilterOperator.Contains, sQ),
                new Filter("QuotationId",  FilterOperator.Contains, sQ)
            ], and: false })] : []);
        },

        onItemPress: function (oEvent) {
            var sId = oEvent.getSource().getBindingContext("o2c").getProperty("QuotationId");
            MessageToast.show("Quotation " + sId + " detail view – available in full deployment.");
        },

        onConvertToSO: function (oEvent) {
            var oCtx  = oEvent.getSource().getBindingContext("o2c");
            var sQtId = oCtx.getProperty("QuotationId");
            var o2c   = this.getOwnerComponent().getModel("o2c");

            // Mark quotation as converted
            var aQts = o2c.getProperty("/Quotations");
            var oQt  = aQts.find(function (q) { return q.QuotationId === sQtId; });
            if (oQt) { oQt.Status = "Converted"; }
            o2c.setProperty("/Quotations", aQts);

            // Create Sales Order
            var aOrders = o2c.getProperty("/SalesOrders");
            var sSoId   = "SO-2024-" + String(aOrders.length + 1).padStart(4, "0");
            var dDel    = new Date(); dDel.setDate(dDel.getDate() + 21);
            aOrders.push({
                SalesOrderId:      sSoId,
                QuotationId:       sQtId,
                CustomerId:        oCtx.getProperty("CustomerId"),
                CustomerName:      oCtx.getProperty("CustomerName"),
                OrderDate:         new Date().toISOString().split("T")[0],
                RequestedDelivery: dDel.toISOString().split("T")[0],
                Status:            "Delivery Pending",
                NetValue:          oCtx.getProperty("NetValue"),
                Currency:          "INR",
                PaymentTerms:      "30 Days Net"
            });
            o2c.setProperty("/SalesOrders", aOrders);

            var oKPIs = o2c.getProperty("/KPIs");
            oKPIs.TotalSalesOrders++;
            o2c.setProperty("/KPIs", oKPIs);

            MessageToast.show("Sales Order " + sSoId + " created from Quotation " + sQtId);
            this.getOwnerComponent().getRouter().navTo("salesOrderList");
        }
    });
});
