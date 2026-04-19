sap.ui.define([], function () {
    "use strict";

    return {

        // ── Generic status → ValueState ─────────────────────────────────

        statusState: function (sStatus) {
            switch (sStatus) {
                case "Paid":
                case "Cleared":
                case "Delivered":
                case "Accepted":
                case "Done":
                    return "Success";
                case "Billed":
                case "Sent":
                case "Goods Issued":
                    return "Warning";
                case "Delivery Pending":
                case "Pick Pending":
                case "Open":
                    return "Error";
                case "Converted":
                    return "Information";
                default:
                    return "None";
            }
        },

        statusIcon: function (sStatus) {
            switch (sStatus) {
                case "Paid":
                case "Cleared":    return "sap-icon://accept";
                case "Billed":     return "sap-icon://activity-2";
                case "Delivered":  return "sap-icon://shipping-status";
                case "Delivery Pending": return "sap-icon://pending";
                default:           return "sap-icon://status-in-process";
            }
        },

        inquiryStatusState: function (sStatus) {
            return sStatus === "Open" ? "Warning" : "Success";
        },

        quotationStatusState: function (sStatus) {
            switch (sStatus) {
                case "Accepted":   return "Success";
                case "Sent":       return "Warning";
                case "Converted":  return "Information";
                default:           return "None";
            }
        },

        deliveryStatusState: function (sStatus) {
            return sStatus === "Delivered" ? "Success" : "Error";
        },

        billingStatusState: function (sStatus) {
            return sStatus === "Paid" ? "Success" : "Error";
        },

        whStatusState: function (sStatus) {
            return sStatus === "Goods Issued" ? "Success" : "Warning";
        },

        paymentStatusText: function (sStatus) {
            return sStatus === "Paid" ? "Fully Paid" : "Pending";
        },

        paymentStatusState: function (sStatus) {
            return sStatus === "Paid" ? "Success" : "Error";
        },

        progressState: function (nPercent) {
            if (nPercent >= 100) return "Success";
            if (nPercent >= 50)  return "Warning";
            return "Error";
        },

        docTypeIcon: function (sType) {
            switch (sType) {
                case "Delivery":          return "sap-icon://delivery-truck";
                case "Billing Document":  return "sap-icon://activity-2";
                case "Payment":           return "sap-icon://payment-approval";
                default:                  return "sap-icon://document";
            }
        },

        // ── Boolean helpers ──────────────────────────────────────────────

        isOpen: function (sStatus) {
            return sStatus === "Open";
        },

        isPending: function (sStatus) {
            return sStatus === "Pending";
        },

        isAccepted: function (sStatus) {
            return sStatus === "Accepted";
        },

        customerText: function (sCustomerId) {
            // Inline lookup from o2c model — used where binding context is unavailable
            return sCustomerId;
        }
    };
});
