# Enterprise FMCG ERP System

Production-Grade FMCG Enterprise Resource Planning (ERP) platform built with React 19, TypeScript, Vite, Tailwind CSS, and React Router.

## GitHub Repository
[https://github.com/sharfu027/Op-shadow](https://github.com/sharfu027/Op-shadow)

---

## 1. Enterprise Architecture Overview

The system follows a modular, FSD-inspired (Feature-Sliced Design) enterprise architecture ready for seamless ASP.NET Core 9 Clean Architecture & MediatR backend integration:

```text
src/
├── api/                  # Base REST HTTP Client & Interceptors
├── components/           # Core Layout, Guards & Shared UI Primitives
│   ├── guards/           # RoleGuard & PermissionGuard
│   └── ui/               # Badge, StatCard, SearchInput, EmptyState, PageHeader, ConfirmDialog
├── constants/            # Global Constants (App, Roles, Navigation, Security)
├── features/             # Self-contained Domain Modules
│   ├── auth/             # Authentication & Security
│   ├── master-data/      # Master Data Engine (12 Entities)
│   ├── pricing/          # Pricing & Discount Engine
│   ├── procurement/      # Procurement & Sourcing
│   ├── warehouse/        # WMS & Hierarchy
│   ├── inventory/        # Stock & FEFO Expiry Management
│   ├── sfa/              # Sales Force Automation
│   ├── o2c/              # Order-to-Cash & GST Invoicing
│   ├── returns/          # Returns & Reverse Logistics
│   ├── finance/          # Accounts Receivable / Payable (AR/AP)
│   └── workflow/         # Universal Approval Workflow Engine
├── routes/               # Central Route Mapping
├── services/             # Service Layer Contracts & REST Client Wrappers
├── types/                # Domain Types & DTO Contracts
└── utils/                # Utility & Formatting Functions
```

---

## 2. Core Modules (1 - 11)

1. **Module 1: Authentication & Security**: JWT Authentication, Refresh Token Handling, OTP MFA, Face Biometrics, GPS Geofenced Check-in, Role-Based Access Control (RBAC), and Security Policies.
2. **Module 2: Master Data Engine**: 12 complete entities (Company, Branch, Department, Designation, Employee, Customer, Supplier, Product Category, Brand, Product, Unit, Warehouse).
3. **Module 3: Pricing & Promotions**: Price Lists, Customer-Specific Pricing, Region Matrix, Discount Engine, BOGO/Promotions Engine, Multi-Tax GST/VAT, and Currency Exchange Rates.
4. **Module 4: Procurement & Sourcing**: Vendor Master, Purchase Requisitions, RFQs, Purchase Orders (Print-Ready PO preview), Goods Receipts (GRN & Inspection), 3-Way Invoice Reconciliation, Vendor Returns.
5. **Module 5: Warehouse Management System (WMS)**: Storage Hierarchy (Zones, Aisles, Racks, Bins), Bin Capacities, Put-away Optimization, Wave/Batch Picking, Packing Weight Verification, Dispatch Staging.
6. **Module 6: Inventory Management**: Stock Master (Available, Reserved, Allocated, Damaged), FEFO Expiry Management, Serial Lifecycle, Stock Movements, Cycle Counting, Adjustments, FIFO Valuation.
7. **Module 7: Sales Force Automation (SFA)**: Hierarchy, Beat & Territory Planning, Geofenced GPS Check-in (12m accuracy), Face Attendance, Live Field Order Booking, Cash/UPI Collections, DCR, Expense claims, Targets & Incentives.
8. **Module 8: Order-to-Cash (O2C)**: Sales Quotations (1-Click SO conversion), Sales Orders, Approval Matrix, Fulfillment, Proof of Delivery (POD), GST Invoices (Print Preview), Customer Sub-Ledgers, Credit/Debit Notes.
9. **Module 9: Returns Management**: RMA Authorization, Supplier Returns, Quality Inspection & Damage Classification, Disposition Routing (Restock, Scrap, Quarantine), Replacement Orders, Refunds.
10. **Module 10: Accounts Receivable & Accounts Payable (AR / AP)**: AR/AP Dashboards, Multi-Invoice Payment Allocation Engine, Customer/Vendor Ledgers, 5-Tier Aging Analysis (0-30, 31-60, 61-90, 91-180, 180+ Days), Bank Reconciliation.
11. **Module 11: Approval Workflow Engine**: Cross-cutting reusable workflow designer, Multi-level matrix routing, Action handlers (Approve, Reject, Return, Delegate), Auto-escalation, Vacation Delegation Proxies, SLA Analytics.

---

## 3. Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript type verification
npx tsc --noEmit

# Production build
npm run build
```
