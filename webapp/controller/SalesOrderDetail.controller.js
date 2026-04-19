sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.SalesOrderDetail", {

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
        getDocTypeIcon: function (sType) {
            switch (sType) {
                case "Delivery":         return "sap-icon://delivery-truck";
                case "Billing Document": return "sap-icon://activity-2";
                case "Payment":          return "sap-icon://payment-approval";
                default:                 return "sap-icon://document";
            }
        },
        getPaymentStatusText:  function (sStatus) { return sStatus === "Paid" ? "Fully Paid" : "Pending"; },
        getPaymentStatusState: function (sStatus) { return sStatus === "Paid" ? "Success" : "Error"; },
        getProgressState: function (nPct) {
            if (nPct >= 100) return "Success";
            if (nPct >= 50)  return "Warning";
            return "Error";
        },

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("salesOrderDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sId = decodeURIComponent(oEvent.getParameter("arguments").id);
            this._loadDetail(sId);
        },

        _loadDetail: function (sId) {
            var o2c     = this.getOwnerComponent().getModel("o2c");
            var aOrders = o2c.getProperty("/SalesOrders");
            var oOrder  = aOrders.find(function (o) { return o.SalesOrderId === sId; });

            if (!oOrder) {
                MessageToast.show("Order not found: " + sId);
                return;
            }

            // Related documents
            var aDeliveries = o2c.getProperty("/Deliveries")
                .filter(function (d) { return d.SalesOrderId === sId; });
            var aBilling = o2c.getProperty("/BillingDocs")
                .filter(function (b) { return b.SalesOrderId === sId; });
            var aPayments = [];
            aBilling.forEach(function (b) {
                o2c.getProperty("/Payments")
                    .filter(function (p) { return p.BillingId === b.BillingId; })
                    .forEach(function (p) { aPayments.push(p); });
            });

            var aRelatedDocs = [];
            aDeliveries.forEach(function (d) {
                aRelatedDocs.push({ DocId: d.DeliveryId,  DocType: "Delivery",         Status: d.Status });
            });
            aBilling.forEach(function (b) {
                aRelatedDocs.push({ DocId: b.BillingId,   DocType: "Billing Document", Status: b.Status });
            });
            aPayments.forEach(function (p) {
                aRelatedDocs.push({ DocId: p.PaymentId,   DocType: "Payment",          Status: p.Status });
            });

            var mProgress = { "Delivery Pending": 25, "Delivered": 50, "Billed": 75, "Paid": 100 };

            var oDetail = {
                SalesOrderId:      oOrder.SalesOrderId,
                CustomerName:      oOrder.CustomerName,
                CustomerId:        oOrder.CustomerId,
                OrderDate:         oOrder.OrderDate,
                RequestedDelivery: oOrder.RequestedDelivery,
                PaymentTerms:      oOrder.PaymentTerms,
                NetValue:          oOrder.NetValue,
                Currency:          oOrder.Currency || "INR",
                Status:            oOrder.Status,
                QuotationId:       oOrder.QuotationId || "—",
                RelatedDocs:       aRelatedDocs,
                ProcessPercent:    mProgress[oOrder.Status] || 10
            };

            // Set a fresh model so the view re-renders fully
            var oModel = new JSONModel(oDetail);
            this.getView().setModel(oModel, "detail");
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("salesOrderList");
        },

        onEdit: function () {
            MessageToast.show("Edit — available in full SAP S/4HANA deployment.");
        },

        onRelatedDocPress: function (oEvent) {
            var oCtx     = oEvent.getSource().getBindingContext("detail");
            var sDocType = oCtx.getProperty("DocType");
            var sDocId   = oCtx.getProperty("DocId");
            MessageToast.show(sDocType + ": " + sDocId);
        }
    });
});
