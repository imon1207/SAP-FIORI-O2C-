sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
], function (Controller, JSONModel, MessageToast, MessageBox, formatter) {
    "use strict";

    return Controller.extend("com.capstone.o2c.controller.SalesOrderCreate", {

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
            oRouter.getRoute("salesOrderCreate").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._initNewOrder();
        },

        _initNewOrder: function () {
            var oNewOrderModel = new JSONModel({
                Items:      [],
                SubTotal:   0,
                TaxAmount:  0,
                GrandTotal: 0,
                _itemCounter: 10
            });
            this.getView().setModel(oNewOrderModel, "newOrder");
        },

        onAddItem: function () {
            var oModel   = this.getView().getModel("newOrder");
            var aItems   = oModel.getProperty("/Items");
            var nCounter = oModel.getProperty("/_itemCounter");

            aItems.push({
                ItemNo:       String(nCounter).padStart(6, "0"),
                MaterialId:   "",
                Description:  "",
                Quantity:     1,
                UoM:          "EA",
                UnitPrice:    0,
                NetValue:     0
            });

            oModel.setProperty("/Items", aItems);
            oModel.setProperty("/_itemCounter", nCounter + 10);
        },

        onDeleteItem: function () {
            var oTable     = this.byId("itemTable");
            var aSelected  = oTable.getSelectedItems();
            if (!aSelected.length) {
                MessageToast.show("Please select at least one item to delete.");
                return;
            }
            var oModel  = this.getView().getModel("newOrder");
            var aItems  = oModel.getProperty("/Items");
            var aRemove = aSelected.map(function (oItem) {
                return oItem.getBindingContext("newOrder").getProperty("ItemNo");
            });
            aItems = aItems.filter(function (o) { return aRemove.indexOf(o.ItemNo) === -1; });
            oModel.setProperty("/Items", aItems);
            this._recalcTotals();
        },

        onMaterialChange: function (oEvent) {
            var oSelect   = oEvent.getSource();
            var sMatId    = oEvent.getParameter("selectedItem").getKey();
            var oContext  = oSelect.getBindingContext("newOrder");
            var sPath     = oContext.getPath();

            var o2cModel  = this.getOwnerComponent().getModel("o2c");
            var aMaterials = o2cModel.getProperty("/Materials");
            var oMat      = aMaterials.find(function (m) { return m.MaterialId === sMatId; });

            if (oMat) {
                var oNewOrder = this.getView().getModel("newOrder");
                var nQty      = oNewOrder.getProperty(sPath + "/Quantity") || 1;
                oNewOrder.setProperty(sPath + "/Description", oMat.Description);
                oNewOrder.setProperty(sPath + "/UoM",         oMat.UoM);
                oNewOrder.setProperty(sPath + "/UnitPrice",   oMat.BasePrice);
                oNewOrder.setProperty(sPath + "/NetValue",    oMat.BasePrice * nQty);
                this._recalcTotals();
            }
        },

        onQuantityChange: function (oEvent) {
            var oInput   = oEvent.getSource();
            var oContext = oInput.getBindingContext("newOrder");
            var sPath    = oContext.getPath();
            var oModel   = this.getView().getModel("newOrder");
            var nQty     = parseFloat(oEvent.getParameter("value")) || 0;
            var nPrice   = oModel.getProperty(sPath + "/UnitPrice") || 0;
            oModel.setProperty(sPath + "/Quantity", nQty);
            oModel.setProperty(sPath + "/NetValue",  nPrice * nQty);
            this._recalcTotals();
        },

        _recalcTotals: function () {
            var oModel    = this.getView().getModel("newOrder");
            var aItems    = oModel.getProperty("/Items");
            var nSubTotal = aItems.reduce(function (sum, o) { return sum + (o.NetValue || 0); }, 0);
            var nTax      = Math.round(nSubTotal * 0.18);
            oModel.setProperty("/SubTotal",   nSubTotal);
            oModel.setProperty("/TaxAmount",  nTax);
            oModel.setProperty("/GrandTotal", nSubTotal + nTax);
        },

        onSave: function () {
            // Validation
            var sCustomer = this.byId("customer").getSelectedKey();
            var sDate     = this.byId("deliveryDate").getValue();

            if (!sCustomer) {
                MessageBox.error("Please select a Customer."); return;
            }
            if (!sDate) {
                MessageBox.error("Please provide a Requested Delivery Date."); return;
            }

            var oNewOrder = this.getView().getModel("newOrder");
            if (!oNewOrder.getProperty("/Items").length) {
                MessageBox.error("Please add at least one line item."); return;
            }

            // Persist to o2c model
            var o2cModel   = this.getOwnerComponent().getModel("o2c");
            var aOrders    = o2cModel.getProperty("/SalesOrders");
            var oCustomers = o2cModel.getProperty("/Customers");
            var oCust      = oCustomers.find(function (c) { return c.CustomerId === sCustomer; });

            var sSoId = "SO-2024-" + String(aOrders.length + 1).padStart(4, "0");

            aOrders.push({
                SalesOrderId:      sSoId,
                QuotationId:       "",
                CustomerId:        sCustomer,
                CustomerName:      oCust ? oCust.Name : sCustomer,
                OrderDate:         new Date().toISOString().split("T")[0],
                RequestedDelivery: sDate,
                Status:            "Delivery Pending",
                NetValue:          oNewOrder.getProperty("/SubTotal"),
                Currency:          "INR",
                PaymentTerms:      this.byId("paymentTerms").getSelectedItem().getText()
            });
            o2cModel.setProperty("/SalesOrders", aOrders);

            // Update KPIs
            var oKPIs = o2cModel.getProperty("/KPIs");
            oKPIs.TotalSalesOrders++;
            o2cModel.setProperty("/KPIs", oKPIs);

            MessageToast.show("Sales Order " + sSoId + " created successfully!");
            this.getOwnerComponent().getRouter().navTo("salesOrderList");
        },

        onCancel: function () {
            this.onNavBack();
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("salesOrderList");
        }
    });
});
