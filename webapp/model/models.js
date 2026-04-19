sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime info for the device the UI5 app is running on as JSONModel.
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        /**
         * Creates the mock O2C data model (replaces OData in standalone/demo mode)
         */
        createO2CModel: function () {
            var oData = {
                // ─── Customers ───────────────────────────────────────────
                Customers: [
                    { CustomerId: "C001", Name: "Tata Steel Ltd", City: "Mumbai", Country: "India", CreditLimit: 5000000, OutstandingBalance: 1200000 },
                    { CustomerId: "C002", Name: "Infosys Technologies", City: "Bangalore", Country: "India", CreditLimit: 3000000, OutstandingBalance: 800000 },
                    { CustomerId: "C003", Name: "Reliance Industries", City: "Mumbai", Country: "India", CreditLimit: 10000000, OutstandingBalance: 2500000 },
                    { CustomerId: "C004", Name: "Wipro Limited", City: "Hyderabad", Country: "India", CreditLimit: 2000000, OutstandingBalance: 450000 },
                    { CustomerId: "C005", Name: "Mahindra & Mahindra", City: "Pune", Country: "India", CreditLimit: 4000000, OutstandingBalance: 960000 }
                ],

                // ─── Products / Materials ─────────────────────────────────
                Materials: [
                    { MaterialId: "MAT001", Description: "Industrial Pump Model A", UoM: "EA", BasePrice: 45000, Stock: 250 },
                    { MaterialId: "MAT002", Description: "Steel Pipe 50mm x 6m", UoM: "PC", BasePrice: 3200, Stock: 1500 },
                    { MaterialId: "MAT003", Description: "Control Valve DN80", UoM: "EA", BasePrice: 12500, Stock: 80 },
                    { MaterialId: "MAT004", Description: "Pressure Gauge 0-10 Bar", UoM: "EA", BasePrice: 1800, Stock: 400 },
                    { MaterialId: "MAT005", Description: "Gasket Set (Assorted)", UoM: "SET", BasePrice: 750, Stock: 600 }
                ],

                // ─── Inquiries (VA11) ─────────────────────────────────────
                Inquiries: [
                    { InquiryId: "INQ-2024-001", CustomerId: "C001", CustomerName: "Tata Steel Ltd", Date: "2024-01-10", Status: "Open",   NetValue: 225000, Currency: "INR", SalesOrg: "1000", DistChannel: "10", Division: "00" },
                    { InquiryId: "INQ-2024-002", CustomerId: "C002", CustomerName: "Infosys Technologies", Date: "2024-01-15", Status: "Converted", NetValue: 96000, Currency: "INR", SalesOrg: "1000", DistChannel: "10", Division: "00" },
                    { InquiryId: "INQ-2024-003", CustomerId: "C003", CustomerName: "Reliance Industries", Date: "2024-02-01", Status: "Open",   NetValue: 560000, Currency: "INR", SalesOrg: "1000", DistChannel: "20", Division: "00" }
                ],

                // ─── Quotations (VA21) ────────────────────────────────────
                Quotations: [
                    { QuotationId: "QT-2024-001", InquiryId: "INQ-2024-002", CustomerId: "C002", CustomerName: "Infosys Technologies", Date: "2024-01-18", ValidTo: "2024-02-18", Status: "Accepted", NetValue: 96000, Currency: "INR" },
                    { QuotationId: "QT-2024-002", InquiryId: "INQ-2024-001", CustomerId: "C001", CustomerName: "Tata Steel Ltd",        Date: "2024-01-12", ValidTo: "2024-02-12", Status: "Sent",     NetValue: 225000, Currency: "INR" },
                    { QuotationId: "QT-2024-003", InquiryId: "",              CustomerId: "C004", CustomerName: "Wipro Limited",         Date: "2024-02-05", ValidTo: "2024-03-05", Status: "Accepted", NetValue: 142500, Currency: "INR" }
                ],

                // ─── Sales Orders (VA01) ──────────────────────────────────
                SalesOrders: [
                    { SalesOrderId: "SO-2024-0001", QuotationId: "QT-2024-001", CustomerId: "C002", CustomerName: "Infosys Technologies", OrderDate: "2024-01-20", RequestedDelivery: "2024-02-10", Status: "Delivery Pending", NetValue: 96000,  Currency: "INR", PaymentTerms: "30 Days Net" },
                    { SalesOrderId: "SO-2024-0002", QuotationId: "QT-2024-003", CustomerId: "C004", CustomerName: "Wipro Limited",         OrderDate: "2024-02-07", RequestedDelivery: "2024-02-28", Status: "Delivered",        NetValue: 142500, Currency: "INR", PaymentTerms: "15 Days Net" },
                    { SalesOrderId: "SO-2024-0003", QuotationId: "",             CustomerId: "C003", CustomerName: "Reliance Industries",   OrderDate: "2024-02-10", RequestedDelivery: "2024-03-15", Status: "Billed",           NetValue: 450000, Currency: "INR", PaymentTerms: "45 Days Net" },
                    { SalesOrderId: "SO-2024-0004", QuotationId: "",             CustomerId: "C005", CustomerName: "Mahindra & Mahindra",   OrderDate: "2024-03-01", RequestedDelivery: "2024-03-20", Status: "Paid",             NetValue: 337500, Currency: "INR", PaymentTerms: "30 Days Net" }
                ],

                // ─── Deliveries (VL01N) ───────────────────────────────────
                Deliveries: [
                    { DeliveryId: "DEL-2024-0001", SalesOrderId: "SO-2024-0001", PlannedDate: "2024-02-10", ActualDate: "",             Status: "Pending",   WarehouseStatus: "Pick Pending" },
                    { DeliveryId: "DEL-2024-0002", SalesOrderId: "SO-2024-0002", PlannedDate: "2024-02-28", ActualDate: "2024-02-26",   Status: "Delivered", WarehouseStatus: "Goods Issued" },
                    { DeliveryId: "DEL-2024-0003", SalesOrderId: "SO-2024-0003", PlannedDate: "2024-03-15", ActualDate: "2024-03-14",   Status: "Delivered", WarehouseStatus: "Goods Issued" },
                    { DeliveryId: "DEL-2024-0004", SalesOrderId: "SO-2024-0004", PlannedDate: "2024-03-20", ActualDate: "2024-03-19",   Status: "Delivered", WarehouseStatus: "Goods Issued" }
                ],

                // ─── Billing Documents (VF01) ─────────────────────────────
                BillingDocs: [
                    { BillingId: "BILL-2024-0001", DeliveryId: "DEL-2024-0003", SalesOrderId: "SO-2024-0003", CustomerId: "C003", CustomerName: "Reliance Industries", BillingDate: "2024-03-15", DueDate: "2024-04-29", NetValue: 450000, TaxValue: 81000, TotalValue: 531000, Currency: "INR", Status: "Open" },
                    { BillingId: "BILL-2024-0002", DeliveryId: "DEL-2024-0004", SalesOrderId: "SO-2024-0004", CustomerId: "C005", CustomerName: "Mahindra & Mahindra", BillingDate: "2024-03-20", DueDate: "2024-04-19", NetValue: 337500, TaxValue: 60750, TotalValue: 398250, Currency: "INR", Status: "Paid" },
                    { BillingId: "BILL-2024-0003", DeliveryId: "DEL-2024-0002", SalesOrderId: "SO-2024-0002", CustomerId: "C004", CustomerName: "Wipro Limited",         BillingDate: "2024-02-28", DueDate: "2024-03-14", NetValue: 142500, TaxValue: 25650, TotalValue: 168150, Currency: "INR", Status: "Paid" }
                ],

                // ─── Payments (F-28 / FBL5N) ──────────────────────────────
                Payments: [
                    { PaymentId: "PAY-2024-0001", BillingId: "BILL-2024-0002", CustomerId: "C005", CustomerName: "Mahindra & Mahindra", PaymentDate: "2024-04-15", Amount: 398250, Currency: "INR", Method: "NEFT", Reference: "UTR20240415001", Status: "Cleared" },
                    { PaymentId: "PAY-2024-0002", BillingId: "BILL-2024-0003", CustomerId: "C004", CustomerName: "Wipro Limited",         PaymentDate: "2024-03-12", Amount: 168150, Currency: "INR", Method: "RTGS", Reference: "UTR20240312007", Status: "Cleared" }
                ],

                // ─── Dashboard KPIs ───────────────────────────────────────
                KPIs: {
                    TotalInquiries:    3,
                    TotalQuotations:   3,
                    TotalSalesOrders:  4,
                    PendingDeliveries: 1,
                    OpenBillingAmount: 531000,
                    PaidThisMonth:     566400,
                    ConversionRate:    "66.7%",
                    AvgOrderValue:     256500
                }
            };

            return new JSONModel(oData);
        }
    };
});
