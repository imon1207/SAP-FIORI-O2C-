# SAP-FIORI-O2C-
# 🔄 Order-to-Cash (O2C) — SAP Fiori Application

> **Capstone Project** | 2027 SAP FIORI (OE) | SAP SD Module

[![SAP UI5](https://img.shields.io/badge/SAP%20UI5-1.120.0-blue?logo=sap)](https://ui5.sap.com)
[![Fiori](https://img.shields.io/badge/SAP%20Fiori-3%20Horizon-0070F2?logo=sap)](https://experience.sap.com/fiori-design-web/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)]()

---

## 📋 Table of Contents

- [Overview](#-overview)
- [O2C Process Flow](#-o2c-process-flow)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [SAP T-Code Mapping](#-sap-t-code-mapping)
- [Data Model](#-data-model)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

---

## 🌐 Overview

A complete **SAP Fiori** application simulating the end-to-end **Order-to-Cash (O2C)** business process in the **SAP SD (Sales & Distribution)** module.

The app covers all 6 canonical O2C steps in a single unified interface — from capturing a customer inquiry through payment clearance — with live KPI dashboards, status tracking, and one-click document conversion between process steps.

> **Problem it solves:** In SAP ERP, O2C spans 6+ separate transactions across Sales, Warehouse, and Finance teams with no unified view. This app brings all steps into one responsive Fiori interface with end-to-end traceability.

---

## 🔁 O2C Process Flow

```
Customer Inquiry ──► Quotation ──► Sales Order ──► Delivery ──► Billing ──► Payment
    (VA11)             (VA21)         (VA01)        (VL01N)      (VF01)      (F-28)
```

| Step | Process | SAP T-Code | Status After |
|------|---------|------------|-------------|
| 1 | Customer Inquiry | VA11/VA12/VA13 | Open → Converted |
| 2 | Quotation | VA21/VA22/VA23 | Sent → Accepted |
| 3 | Sales Order | VA01/VA02/VA03 | Delivery Pending |
| 4 | Outbound Delivery | VL01N/VL02N | Delivered 🟠 |
| 5 | Billing / Invoice | VF01/VF02/VF03 | Billed 🟠 |
| 6 | Payment Clearance | F-28 / FBL5N | Paid 🟢 |

---

## ✨ Features

### 📊 Dashboard
- **8 live KPI tiles** — Inquiries, Quotations, Sales Orders, Pending Deliveries, Open Billing, Paid This Month, Conversion Rate, Avg Order Value
- **O2C Process Step navigator** — 6 clickable tiles linking to each module
- **Recent Sales Orders** table with colour-coded status badges

### 📝 Inquiry Management (`VA11`)
- Create, list, and search customer inquiries
- One-click conversion → Quotation

### 💼 Quotation Management (`VA21`)
- Create quotations with validity dates
- One-click conversion → Sales Order

### 🛒 Sales Order (`VA01`)
- Multi-line item entry with material auto-fill
- Real-time **18% GST** calculation
- 5-status filter: All / Delivery Pending / Delivered / Billed / Paid
- Detail view with **process progress bar** and related document trail

### 🚚 Delivery Processing (`VL01N`)
- Post Goods Issue (PGI) per delivery or in batch
- Auto-updates linked Sales Order to `Delivered`

### 🧾 Billing / Invoice (`VF01`)
- Auto-generate invoices from delivered orders
- Tracks Open vs Paid receivables

### 💳 Payment Clearance (`F-28`)
- Payment dialog — NEFT / RTGS / IMPS / Cheque / Cash + UTR reference
- Clears AR and marks Sales Order as `Paid`

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | SAP UI5 | 1.120.0 LTS |
| Design System | SAP Fiori 3 Horizon | `sap_horizon` |
| Controls | sap.m, sap.uxap, sap.ui.layout | 1.120.0 |
| Data (Demo) | JSONModel | — |
| Data (Prod) | OData v2 Model → SAP Gateway | SAP_GWFND 2.0 |
| Backend | SAP S/4HANA | 2023 |
| DB | SAP HANA | 2.0 SPS06 |
| IDE | SAP Business Application Studio | — |
| Build | UI5 Tooling (`@ui5/cli`) | 3.x |
| Runtime | Node.js | 18 LTS |

---

## 📁 Project Structure

```
O2C_SAP_Fiori_Project/
├── webapp/
│   ├── index.html                         # Entry point — UI5 bootstrap
│   ├── Component.js                       # UIComponent — app init, model setup
│   ├── manifest.json                      # App descriptor — routing, libs
│   │
│   ├── controller/
│   │   ├── App.controller.js              # Root — initialises O2C JSONModel
│   │   ├── Dashboard.controller.js        # KPI tiles, process navigation
│   │   ├── InquiryList.controller.js      # VA13 — list, search, convert
│   │   ├── InquiryCreate.controller.js    # VA11 — create form
│   │   ├── QuotationList.controller.js    # VA23 — list, convert → SO
│   │   ├── QuotationCreate.controller.js  # VA21 — create form
│   │   ├── SalesOrderList.controller.js   # VA05 — list, filter, search
│   │   ├── SalesOrderCreate.controller.js # VA01 — create with line items + GST
│   │   ├── SalesOrderDetail.controller.js # VA03 — detail, progress, doc trail
│   │   ├── DeliveryList.controller.js     # VL06O — list, Post GI
│   │   ├── BillingList.controller.js      # VF05 — list, create invoice
│   │   └── PaymentList.controller.js      # FBL5N — list, F-28 post payment
│   │
│   ├── view/
│   │   ├── App.view.xml                   # Shell + navigation container
│   │   ├── Dashboard.view.xml             # KPI grid, process tiles, SO table
│   │   ├── InquiryList.view.xml
│   │   ├── InquiryCreate.view.xml
│   │   ├── QuotationList.view.xml
│   │   ├── QuotationCreate.view.xml
│   │   ├── SalesOrderList.view.xml
│   │   ├── SalesOrderCreate.view.xml
│   │   ├── SalesOrderDetail.view.xml      # ObjectPageLayout
│   │   ├── DeliveryList.view.xml
│   │   ├── BillingList.view.xml
│   │   └── PaymentList.view.xml
│   │
│   ├── model/
│   │   ├── models.js                      # Device model + O2C mock data
│   │   └── formatter.js                   # Status/state/icon formatters
│   │
│   ├── i18n/
│   │   └── i18n.properties                # 120 label keys — English (EN)
│   │
│   └── css/
│       └── style.css                      # Custom Fiori overrides
│
├── documentation/
│   └── O2C_Project_Documentation.pdf      # Full project documentation
│
├── .gitignore                             # Git ignore rules
├── .eslintrc.json                         # ESLint config
├── package.json                           # npm scripts
├── ui5.yaml                               # UI5 tooling config
└── README.md                              # This file
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org) — verify with `node --version`
- [Git](https://git-scm.com)

### Clone & Run

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/O2C-SAP-Fiori.git
cd O2C-SAP-Fiori

# 2. Install UI5 CLI globally (one-time setup)
npm install -g @ui5/cli

# 3. Install project dependencies
npm install

# 4. Start the dev server
npm start
# → Opens http://localhost:8080/index.html
```

### Available Scripts

```bash
npm start        # Start development server (live reload)
npm run build    # Build optimised production bundle → /dist
npm run lint     # ESLint check on all JS files
```

### VS Code Quickstart

1. Open VS Code → `File → Open Folder` → select project folder
2. Open terminal: `` Ctrl + ` ``
3. Run `npm install` then `npm start`
4. App opens at `http://localhost:8080/index.html`

---

## 📊 SAP T-Code Mapping

| Fiori Screen | T-Code | SAP Tables | Function |
|---|---|---|---|
| Inquiry List | VA13 | VBAK, VBAP | Display/Search Inquiries |
| Inquiry Create | VA11 | VBAK, VBAP, VBKD | Create Customer Inquiry |
| Quotation List | VA23 | VBAK, VBAP | Display/Search Quotations |
| Quotation Create | VA21 | VBAK, VBAP, VBKD | Create Quotation |
| Sales Order List | VA05 | VBAK, VBAP | List Sales Orders |
| Sales Order Create | VA01 | VBAK, VBAP, VBKD, VBUK | Create Standard Order |
| Sales Order Detail | VA03 | VBAK, VBAP, VBFA | Display + Document Flow |
| Delivery List | VL06O | LIKP, LIPS | Outbound Delivery Monitor |
| Post Goods Issue | VL02N | LIKP, MKPF, MSEG | Post Goods Issue |
| Billing List | VF05 | VBRK, VBRP | List Billing Documents |
| Create Invoice | VF01 | VBRK, VBRP, BSID | Create Billing Document |
| Payment List | FBL5N | BSID, BSAD | Customer Line Item Display |
| Post Payment | F-28 | BKPF, BSEG, BSAD | Post Incoming Payment |

---

## 🗃 Data Model

The app runs fully offline using a **JSONModel** with pre-seeded realistic data:

| Entity | Records | Description |
|--------|---------|-------------|
| Customers | 5 | Tata Steel, Infosys, Reliance, Wipro, Mahindra |
| Materials | 5 | Industrial Pump, Steel Pipe, Control Valve, etc. |
| Inquiries | 3 | Mix of Open and Converted |
| Quotations | 3 | Sent, Accepted, Converted |
| Sales Orders | 4 | One each in all 4 statuses |
| Deliveries | 4 | Pending and Delivered |
| Billing Docs | 3 | Open and Paid |
| Payments | 2 | Cleared via NEFT and RTGS |

### Status Colour Coding

```
🔴 Error   — Delivery Pending, Open, Pending
🟠 Warning — Delivered, Billed, Sent, Goods Issued
🟢 Success — Paid, Cleared, Accepted
🔵 Info    — Converted
```

---

## 🔮 Future Improvements

- [ ] **OData Integration** — connect `SD_O2C_SRV` to real SAP S/4HANA (VBAK, LIKP, VBRK)
- [ ] **Credit Limit Check (FD32)** — block Sales Order if customer credit exceeded
- [ ] **PDF Invoice** — GSTIN-compliant invoice via SAP ADS / SmartForms
- [ ] **Multi-Currency** — USD/EUR/GBP with TCURR exchange rates
- [ ] **SAP Analytics Cloud** — embedded SAC dashboards for AR aging and sales trends
- [ ] **Approval Workflow** — BTP Process Automation for quotation manager sign-off
- [ ] **Batch Billing (VF04)** — mass-create invoices from delivered orders
- [ ] **Fiori Launchpad Deploy** — BSP app with PFCG role-based access control

---

## 👤 Author

| | |
|---|---|
| **Name** | Imon Banerjee |
| **Roll Number** | 2328234 |
| **Batch / Program** | 2027 SAP FIORI (OE) |
| **Submission** | April 19, 2026 |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built with ❤️ using SAP UI5 · Fiori 3 · SAP SD</sub>
</div>
