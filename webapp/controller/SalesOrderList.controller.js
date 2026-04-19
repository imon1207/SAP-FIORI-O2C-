sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
], function (Controller, Filter, FilterOperator, MessageToast, formatter) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.SalesOrderList", {

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
            oRouter.getRoute("salesOrderList").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._applyFilters();
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("dashboard");
        },

        onCreatePress: function () {
            this.getOwnerComponent().getRouter().navTo("salesOrderCreate");
        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            this._applyFilters(sQuery);
        },

        onStatusFilterChange: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            this._sStatusFilter = sKey === "ALL" ? null : sKey;
            this._applyFilters();
        },

        _applyFilters: function (sQuery) {
            var oTable   = this.byId("soTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];

            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("SalesOrderId",  FilterOperator.Contains, sQuery),
                        new Filter("CustomerName",  FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            if (this._sStatusFilter) {
                aFilters.push(new Filter("Status", FilterOperator.EQ, this._sStatusFilter));
            }

            oBinding.filter(aFilters.length ? new Filter({ filters: aFilters, and: true }) : []);
        },

        onItemPress: function (oEvent) {
            var oItem    = oEvent.getSource().getParent ? oEvent.getSource().getParent() : oEvent.getSource();
            var oContext = oItem.getBindingContext("o2c");
            if (!oContext) {
                oContext = oEvent.getSource().getBindingContext("o2c");
            }
            var sId = oContext.getProperty("SalesOrderId");
            this.getOwnerComponent().getRouter().navTo("salesOrderDetail", { id: encodeURIComponent(sId) });
        }
    });
});
