sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/GenericTile",
    "sap/m/TileContent",
    "sap/m/NumericContent",
    "sap/m/MessageToast"
], function (Controller, GenericTile, TileContent, NumericContent, MessageToast) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.Dashboard", {

        onInit: function () {
            this._renderKPITiles();
        },

        // Inline formatter — avoids the external formatter module lookup issue
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

        _renderKPITiles: function () {
            var oModel    = this.getOwnerComponent().getModel("o2c");
            var oKPIs     = oModel.getProperty("/KPIs");
            var oContainer = this.byId("kpiTileContainer");
            oContainer.removeAllItems();

            var aTiles = [
                { label: "Total Inquiries",   subtitle: "Current Month",    value: String(oKPIs.TotalInquiries),    icon: "sap-icon://customer",          valueColor: "Good",     indicator: "Up",   scale: "" },
                { label: "Quotations Sent",   subtitle: "Current Month",    value: String(oKPIs.TotalQuotations),   icon: "sap-icon://offer",             valueColor: "Good",     indicator: "Up",   scale: "" },
                { label: "Sales Orders",      subtitle: "Active",           value: String(oKPIs.TotalSalesOrders),  icon: "sap-icon://sales-order",       valueColor: "Good",     indicator: "Up",   scale: "" },
                { label: "Pending Delivery",  subtitle: "Action Required",  value: String(oKPIs.PendingDeliveries), icon: "sap-icon://delivery-truck",    valueColor: "Critical", indicator: "Down", scale: "" },
                { label: "Open Billing",      subtitle: "INR Receivable",   value: "5.31",                          icon: "sap-icon://activity-2",        valueColor: "Critical", indicator: "Down", scale: "L" },
                { label: "Paid This Month",   subtitle: "INR",              value: "5.66",                          icon: "sap-icon://payment-approval",  valueColor: "Good",     indicator: "Up",   scale: "L" },
                { label: "Conversion Rate",   subtitle: "Inquiry to Order", value: oKPIs.ConversionRate,            icon: "sap-icon://trend-up",          valueColor: "Good",     indicator: "Up",   scale: "" },
                { label: "Avg Order Value",   subtitle: "INR",              value: "2.57",                          icon: "sap-icon://bar-chart",         valueColor: "Neutral",  indicator: "Up",   scale: "L" }
            ];

            aTiles.forEach(function (oT) {
                oContainer.addItem(new GenericTile({
                    header:    oT.label,
                    subheader: oT.subtitle,
                    press:     this.onKPITilePress.bind(this),
                    tileContent: [new TileContent({
                        content: new NumericContent({
                            value:      oT.value,
                            indicator:  oT.indicator,
                            valueColor: oT.valueColor,
                            icon:       oT.icon,
                            scale:      oT.scale,
                            withMargin: false
                        })
                    })]
                }).addStyleClass("sapUiSmallMarginEnd sapUiSmallMarginBottom"));
            }.bind(this));
        },

        // ─── Navigation ────────────────────────────────────────────────────
        onNavigateInquiry:    function () { this.getOwnerComponent().getRouter().navTo("inquiryList"); },
        onNavigateQuotation:  function () { this.getOwnerComponent().getRouter().navTo("quotationList"); },
        onNavigateSalesOrder: function () { this.getOwnerComponent().getRouter().navTo("salesOrderList"); },
        onNavigateDelivery:   function () { this.getOwnerComponent().getRouter().navTo("deliveryList"); },
        onNavigateBilling:    function () { this.getOwnerComponent().getRouter().navTo("billingList"); },
        onNavigatePayment:    function () { this.getOwnerComponent().getRouter().navTo("paymentList"); },
        onCreateSalesOrder:   function () { this.getOwnerComponent().getRouter().navTo("salesOrderCreate"); },

        onSalesOrderPress: function (oEvent) {
            var oItem    = oEvent.getSource().getParent();
            var oContext = oItem.getBindingContext("o2c");
            if (!oContext) { return; }
            var sId = oContext.getProperty("SalesOrderId");
            this.getOwnerComponent().getRouter().navTo("salesOrderDetail", { id: encodeURIComponent(sId) });
        },

        onKPITilePress:    function () { MessageToast.show("Drill-down available in full SAP deployment."); },
        onShowProcessFlow: function () { MessageToast.show("See project documentation for process flow."); }
    });
});
