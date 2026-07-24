-- =============================================================================
-- INK FMCG ENTERPRISE ERP — PROCUREMENT SCHEMAS (v1.0)
-- File Name      : procurement_schema.sql
-- Target Database: PostgreSQL 16+
-- Schema Owner   : procurement
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS procurement;

-- =============================================================================
-- SECTION 1 — LOOKUP TABLES
-- =============================================================================

-- 1.1 Requisition Statuses
CREATE TABLE procurement.requisition_statuses (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order  INT          NOT NULL DEFAULT 1,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_requisition_statuses_code UNIQUE (code),
    CONSTRAINT chk_requisition_statuses_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.requisition_statuses IS 
    '[LOOKUP] Lifecycle status of a Purchase Requisition: DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED, CLOSED.';

-- 1.2 RFQ Statuses
CREATE TABLE procurement.rfq_statuses (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order  INT          NOT NULL DEFAULT 1,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_rfq_statuses_code UNIQUE (code),
    CONSTRAINT chk_rfq_statuses_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.rfq_statuses IS 
    '[LOOKUP] Lifecycle status of a Request For Quotation: DRAFT, PUBLISHED, SUBMISSION_PHASE, UNDER_EVALUATION, AWARDED, CANCELLED, CLOSED.';

-- 1.3 Invitation Statuses
CREATE TABLE procurement.invitation_statuses (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order  INT          NOT NULL DEFAULT 1,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_invitation_statuses_code UNIQUE (code),
    CONSTRAINT chk_invitation_statuses_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.invitation_statuses IS 
    '[LOOKUP] Status of a supplier invitation for an RFQ: INVITED, VIEWED, ACCEPTED, DECLINED, BYPASSED.';

-- 1.4 Quotation Statuses
CREATE TABLE procurement.quotation_statuses (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order  INT          NOT NULL DEFAULT 1,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_quotation_statuses_code UNIQUE (code),
    CONSTRAINT chk_quotation_statuses_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.quotation_statuses IS 
    '[LOOKUP] Status of a Supplier Quotation: SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, EXPIRED, REVISED, CANCELLED.';

-- 1.5 Approval Statuses
CREATE TABLE procurement.approval_statuses (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order  INT          NOT NULL DEFAULT 1,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_approval_statuses_code UNIQUE (code),
    CONSTRAINT chk_approval_statuses_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.approval_statuses IS 
    '[LOOKUP] Status of an approval workflow request: PENDING, IN_PROGRESS, APPROVED, REJECTED, BYPASSED, ESCALATED, TIMEOUT.';

-- 1.6 Purchase Order Statuses
CREATE TABLE procurement.purchase_order_statuses (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order  INT          NOT NULL DEFAULT 1,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_po_statuses_code UNIQUE (code),
    CONSTRAINT chk_po_statuses_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.purchase_order_statuses IS 
    '[LOOKUP] Lifecycle status of a Purchase Order: DRAFT, PENDING_APPROVAL, APPROVED, DISPATCHED, PARTIALLY_RECEIVED, FULLY_RECEIVED, AMENDED, CANCELLED, CLOSED.';

-- 1.7 Goods Receipt Statuses
CREATE TABLE procurement.receipt_statuses (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order  INT          NOT NULL DEFAULT 1,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_receipt_statuses_code UNIQUE (code),
    CONSTRAINT chk_receipt_statuses_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.receipt_statuses IS 
    '[LOOKUP] Status of a Goods Receipt Note (GRN): IN_TRANSIT, RECEIVED, QUALITY_HOLD, FULLY_PUTAWAY, DISCREPANCY, CANCELLED.';

-- 1.8 Return Statuses
CREATE TABLE procurement.return_statuses (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order  INT          NOT NULL DEFAULT 1,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_return_statuses_code UNIQUE (code),
    CONSTRAINT chk_return_statuses_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.return_statuses IS 
    '[LOOKUP] Status of a Purchase Return (RTV): DRAFT, PENDING_APPROVAL, APPROVED, SHIPPED, CREDIT_NOTE_ISSUED, REJECTED, CANCELLED.';

-- 1.9 Evaluation Criteria (Sourcing Scorecard)
CREATE TABLE procurement.evaluation_criteria (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    default_weight NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_eval_criteria_code UNIQUE (code),
    CONSTRAINT chk_eval_criteria_code_upper CHECK (code = upper(code)),
    CONSTRAINT chk_eval_criteria_weight CHECK (default_weight >= 0.00 AND default_weight <= 100.00)
);

COMMENT ON TABLE procurement.evaluation_criteria IS 
    '[LOOKUP] Sourcing scoring categories: PRICE, DELIVERY_LEAD_TIME, QUALITY_ASSURANCE, SUPPLIER_RELIABILITY, TECHNICAL_CAPABILITY, COMPLIANCE.';

-- 1.10 Return Reasons
CREATE TABLE procurement.return_reasons (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_return_reasons_code UNIQUE (code),
    CONSTRAINT chk_return_reasons_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.return_reasons IS 
    '[LOOKUP] Business reasons for returning items to the vendor: QUALITY_DEFECT, DAMAGE_IN_TRANSIT, OVER_SHIPPED, INCORRECT_VARIANT, SHORT_EXPIRY, DELAYED_EXCESS.';

-- 1.11 Damage Types
CREATE TABLE procurement.damage_types (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_damage_types_code UNIQUE (code),
    CONSTRAINT chk_damage_types_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.damage_types IS 
    '[LOOKUP] Classification of physical item damage observed at receiving: WATER_DAMAGE, CRUSHED_BOX, LEAKAGE, SEAL_BROKEN, SPOILAGE, TEMP_EXCURSION.';

-- 1.12 Inspection Results
CREATE TABLE procurement.inspection_results (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_inspection_results_code UNIQUE (code),
    CONSTRAINT chk_inspection_results_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.inspection_results IS 
    '[LOOKUP] Standard QA inspection outcomes: PASSED, FAILED, CONDITIONAL_ACCEPTANCE, SUSPENDED_TEST.';

-- 1.13 Landed Cost Types
CREATE TABLE procurement.landed_cost_types (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_landed_cost_types_code UNIQUE (code),
    CONSTRAINT chk_landed_cost_types_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.landed_cost_types IS 
    '[LOOKUP] Types of capitalized charges added to stock cost value: FREIGHT, OCEAN_FREIGHT, AIR_CARGO, CUSTOMS_DUTY, MARINE_INSURANCE, LOCAL_PORT_HANDLING, CLEARING_AGENT_FEES, TRANSPORT_OCTROI.';

-- 1.14 Cost Allocation Methods
CREATE TABLE procurement.allocation_methods (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_allocation_methods_code UNIQUE (code),
    CONSTRAINT chk_allocation_methods_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.allocation_methods IS 
    '[LOOKUP] Method to allocate landed costs to lines: BY_NET_VALUE, BY_UNIT_QUANTITY, BY_WEIGHT, BY_VOLUME.';

-- 1.15 Document Types
CREATE TABLE procurement.procurement_document_types (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_proc_doc_types_code UNIQUE (code),
    CONSTRAINT chk_proc_doc_types_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.procurement_document_types IS 
    '[LOOKUP] Procurement document attachments classification: PURCHASE_REQUISITION, REQUEST_FOR_QUOTE, SUPPLIER_QUOTATION, PURCHASE_ORDER, GOODS_RECEIPT, QUALITY_CERTIFICATE, AMENDMENT_JUSTIFICATION, BLANKET_CONTRACT.';

-- 1.16 Contract Types
CREATE TABLE procurement.contract_types (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_contract_types_code UNIQUE (code),
    CONSTRAINT chk_contract_types_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.contract_types IS 
    '[LOOKUP] Procurement agreement classifications: BLANKET_PURCHASE_AGREEMENT, FIXED_QUANTITY_CONTRACT, CONTRACT_SOURCING_SLA.';

-- 1.17 Freight Terms
CREATE TABLE procurement.freight_terms (
    id             UUID         PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    code           VARCHAR(50)  NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ  NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_freight_terms_code UNIQUE (code),
    CONSTRAINT chk_freight_terms_code_upper CHECK (code = upper(code))
);

COMMENT ON TABLE procurement.freight_terms IS 
    '[LOOKUP] Freight terms: PREPAID, COLLECT, PREPAID_AND_ADD, THIRD_PARTY_BILLING.';

-- =============================================================================
-- SECTION 2 — CORE PROCUREMENT POLICIES
-- =============================================================================

CREATE TABLE procurement.procurement_policies (
    id                               UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    policy_code                      VARCHAR(30)   NOT NULL,
    policy_name                      VARCHAR(100)  NOT NULL,
    description                      TEXT,
    
    -- Control Thresholds
    min_quotations_required          INT           NOT NULL DEFAULT 3,
    mandatory_approval_threshold_inr NUMERIC(18,4) NOT NULL DEFAULT 500000.00,
    tolerance_over_receipt_pct       NUMERIC(5,2)  NOT NULL DEFAULT 5.00,
    tolerance_price_variance_pct     NUMERIC(5,2)  NOT NULL DEFAULT 2.00,
    
    -- Operational Enforcements
    is_contract_purchasing_mandatory BOOLEAN       NOT NULL DEFAULT FALSE,
    requires_inspection_default      BOOLEAN       NOT NULL DEFAULT FALSE,
    emergency_procurement_allowed    BOOLEAN       NOT NULL DEFAULT TRUE,
    
    -- Audit controls
    is_active                        BOOLEAN       NOT NULL DEFAULT TRUE,
    row_version                      INT           NOT NULL DEFAULT 1,
    created_at_utc                   TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id               UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    is_deleted                       BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at_utc                   TIMESTAMPTZ,
    deleted_by_user_id               UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_procurement_policies_code UNIQUE (policy_code),
    CONSTRAINT chk_policy_min_quotes CHECK (min_quotations_required >= 1),
    CONSTRAINT chk_policy_approv_threshold CHECK (mandatory_approval_threshold_inr >= 0.00),
    CONSTRAINT chk_policy_receipt_tol CHECK (tolerance_over_receipt_pct >= 0.00 AND tolerance_over_receipt_pct <= 100.00),
    CONSTRAINT chk_policy_price_tol CHECK (tolerance_price_variance_pct >= 0.00 AND tolerance_price_variance_pct <= 100.00)
);

COMMENT ON TABLE procurement.procurement_policies IS 
    '[FOUNDATION] System-wide or branch-specific governance parameters to enforce quotes, approval matrices, and GRN discrepancies.';

-- =============================================================================
-- SECTION 3 — PURCHASE REQUISITION SUB-SYSTEM
-- =============================================================================

-- 3.1 Requisition Header
CREATE TABLE procurement.purchase_requisitions (
    id                           UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    requisition_code             VARCHAR(50)   NOT NULL,
    requisition_date             DATE          NOT NULL DEFAULT CURRENT_DATE,
    required_date                DATE          NOT NULL,
    
    -- Context Linkage
    company_id                   UUID          NOT NULL REFERENCES organization.companies(id),
    branch_id                    UUID          NOT NULL REFERENCES organization.branches(id),
    department_id                UUID          NOT NULL REFERENCES organization.departments(id),
    cost_center_id               UUID          NOT NULL REFERENCES organization.cost_centers(id),
    
    -- Actor
    requested_by_employee_id     UUID          NOT NULL REFERENCES employee.employees(id),
    
    -- Details
    requisition_status_id        UUID          NOT NULL REFERENCES procurement.requisition_statuses(id),
    priority                     VARCHAR(20)   NOT NULL DEFAULT 'MEDIUM',
    total_estimated_amount       NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    currency_code                VARCHAR(3)    NOT NULL DEFAULT 'INR',
    purpose                      TEXT          NOT NULL,
    
    -- Emergency procurement bypass hooks
    is_emergency                 BOOLEAN       NOT NULL DEFAULT FALSE,
    emergency_justification      TEXT,
    
    -- Concurrency and Auditing
    row_version                  INT           NOT NULL DEFAULT 1,
    created_at_utc               TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id           UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc         TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id     UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    is_deleted                   BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at_utc               TIMESTAMPTZ,
    deleted_by_user_id           UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_purchase_reqs_code UNIQUE (requisition_code),
    CONSTRAINT chk_purchase_reqs_dates CHECK (required_date >= requisition_date),
    CONSTRAINT chk_purchase_reqs_amount CHECK (total_estimated_amount >= 0.00),
    CONSTRAINT chk_purchase_reqs_emergency CHECK (is_emergency = FALSE OR (is_emergency = TRUE AND emergency_justification IS NOT NULL AND length(trim(emergency_justification)) > 0)),
    CONSTRAINT chk_purchase_reqs_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

COMMENT ON TABLE procurement.purchase_requisitions IS 
    '[OPERATIONAL] Internal document generated by departments requesting purchase of products.';

-- 3.2 Requisition Lines
CREATE TABLE procurement.purchase_requisition_lines (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    purchase_requisition_id    UUID          NOT NULL REFERENCES procurement.purchase_requisitions(id) ON DELETE CASCADE,
    line_number                INT           NOT NULL,
    
    -- Product Details
    product_id                 UUID          NOT NULL REFERENCES product.products(id),
    product_variant_id         UUID          REFERENCES product.product_variants(id),
    
    -- Quantities
    quantity                   NUMERIC(18,4) NOT NULL,
    uom_id                     UUID          NOT NULL REFERENCES product.product_units_of_measure(id),
    
    -- Financials
    estimated_unit_price       NUMERIC(18,4) NOT NULL,
    estimated_line_amount      NUMERIC(18,4) GENERATED ALWAYS AS (quantity * estimated_unit_price) STORED,
    
    -- Logistics Reference
    destination_warehouse_id   UUID          NOT NULL REFERENCES warehouse.warehouses(id),
    required_date              DATE          NOT NULL,
    
    line_status_id             UUID          NOT NULL REFERENCES procurement.requisition_statuses(id),
    remarks                    TEXT,

    -- Concurrency and Auditing
    row_version                INT           NOT NULL DEFAULT 1,
    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc       TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id   UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    is_deleted                 BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at_utc             TIMESTAMPTZ,
    deleted_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_purchase_req_lines UNIQUE (purchase_requisition_id, line_number),
    CONSTRAINT chk_purchase_req_lines_qty CHECK (quantity > 0.0000),
    CONSTRAINT chk_purchase_req_lines_price CHECK (estimated_unit_price >= 0.0000)
);

COMMENT ON TABLE procurement.purchase_requisition_lines IS 
    '[OPERATIONAL] Individual item detail lines of a requisition document.';

-- 3.3 Requisition Line Cost Allocation (Split Charging)
CREATE TABLE procurement.requisition_line_allocations (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    purchase_requisition_line_id UUID        NOT NULL REFERENCES procurement.purchase_requisition_lines(id) ON DELETE CASCADE,
    
    cost_center_id             UUID          NOT NULL REFERENCES organization.cost_centers(id),
    allocated_percentage       NUMERIC(5,2)  NOT NULL,
    allocated_quantity         NUMERIC(18,4) NOT NULL,
    allocated_amount           NUMERIC(18,4) NOT NULL,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT chk_req_line_alloc_pct CHECK (allocated_percentage > 0.00 AND allocated_percentage <= 100.00),
    CONSTRAINT chk_req_line_alloc_qty CHECK (allocated_quantity > 0.0000),
    CONSTRAINT chk_req_line_alloc_amt CHECK (allocated_amount >= 0.0000)
);

COMMENT ON TABLE procurement.requisition_line_allocations IS 
    '[OPERATIONAL] Split allocations to distribute expenses of a requisition line across multiple corporate cost centers.';

-- 3.4 Requisition Comments
CREATE TABLE procurement.requisition_comments (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    purchase_requisition_id    UUID          NOT NULL REFERENCES procurement.purchase_requisitions(id) ON DELETE CASCADE,
    commented_by_employee_id   UUID          NOT NULL REFERENCES employee.employees(id),
    comment_text               TEXT          NOT NULL,
    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    
    CONSTRAINT chk_req_comments_nonempty CHECK (length(trim(comment_text)) > 0)
);

COMMENT ON TABLE procurement.requisition_comments IS 
    '[OPERATIONAL] Collaboration comments posted during requisition review and authorization phases.';

-- 3.5 Requisition Status History
CREATE TABLE procurement.requisition_status_history (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    purchase_requisition_id    UUID          NOT NULL REFERENCES procurement.purchase_requisitions(id) ON DELETE CASCADE,
    status_id                  UUID          NOT NULL REFERENCES procurement.requisition_statuses(id),
    effective_from             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    effective_to               TIMESTAMPTZ,
    changed_by_employee_id     UUID          NOT NULL REFERENCES employee.employees(id),
    remarks                    TEXT,

    CONSTRAINT chk_requisition_history_temporal CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

COMMENT ON TABLE procurement.requisition_status_history IS 
    '[HISTORY] Temporal audit trail of a requisition lifecycle states.';

-- =============================================================================
-- SECTION 4 — APPROVAL WORKFLOW FOUNDATION
-- =============================================================================

-- 4.1 Approval Requests
CREATE TABLE procurement.approval_requests (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    document_type              VARCHAR(50)   NOT NULL,
    document_id                UUID          NOT NULL,
    current_step_number        INT           NOT NULL DEFAULT 1,
    total_steps                INT           NOT NULL DEFAULT 1,
    approval_status_id         UUID          NOT NULL REFERENCES procurement.approval_statuses(id),
    
    -- Context
    cost_center_id             UUID          REFERENCES organization.cost_centers(id),
    threshold_amount_inr       NUMERIC(18,4) NOT NULL DEFAULT 0.00,
    
    -- Concurrency and Auditing
    row_version                INT           NOT NULL DEFAULT 1,
    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc       TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id   UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT chk_approval_reqs_steps CHECK (current_step_number <= total_steps AND current_step_number >= 1),
    CONSTRAINT chk_approval_reqs_amount CHECK (threshold_amount_inr >= 0.00),
    CONSTRAINT chk_approval_reqs_doctype CHECK (document_type IN ('PURCHASE_REQUISITION', 'PURCHASE_ORDER', 'PURCHASE_RETURN', 'BLANKET_AGREEMENT'))
);

COMMENT ON TABLE procurement.approval_requests IS 
    '[FOUNDATION] Track workflow instances created for authorization of monetary documents.';

-- 4.2 Approval Decisions
CREATE TABLE procurement.approval_decisions (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    approval_request_id        UUID          NOT NULL REFERENCES procurement.approval_requests(id) ON DELETE CASCADE,
    step_number                INT           NOT NULL,
    approver_employee_id       UUID          NOT NULL REFERENCES employee.employees(id),
    decision_status_id         UUID          NOT NULL REFERENCES procurement.approval_statuses(id),
    decision_date              TIMESTAMPTZ,
    comments                   TEXT,
    signature_hash             TEXT,          -- Cryptographic audit integrity verification

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_approval_decisions_step UNIQUE (approval_request_id, step_number, approver_employee_id),
    CONSTRAINT chk_approval_decisions_step CHECK (step_number >= 1)
);

COMMENT ON TABLE procurement.approval_decisions IS 
    '[FOUNDATION] Capture decisions (Approve, Reject, Hold) registered by step-specific employees.';

-- 4.3 Approval Delegation
CREATE TABLE procurement.approval_delegations (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    delegator_employee_id      UUID          NOT NULL REFERENCES employee.employees(id),
    delegatee_employee_id      UUID          NOT NULL REFERENCES employee.employees(id),
    start_date                 DATE          NOT NULL,
    end_date                   DATE          NOT NULL,
    is_active                  BOOLEAN       NOT NULL DEFAULT TRUE,
    reason                     TEXT          NOT NULL,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT chk_delegation_date_range CHECK (end_date >= start_date),
    CONSTRAINT chk_delegation_self_reference CHECK (delegator_employee_id <> delegatee_employee_id)
);

COMMENT ON TABLE procurement.approval_delegations IS 
    '[FOUNDATION] Active delegation mappings routing approval authority to a proxy during leaves.';

-- 4.4 Approval Escalations
CREATE TABLE procurement.approval_escalations (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    approval_request_id        UUID          NOT NULL REFERENCES procurement.approval_requests(id) ON DELETE CASCADE,
    step_number                INT           NOT NULL,
    original_approver_id       UUID          NOT NULL REFERENCES employee.employees(id),
    escalated_to_approver_id   UUID          NOT NULL REFERENCES employee.employees(id),
    escalation_date            TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    reason                     TEXT          NOT NULL,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT chk_escalation_self_reference CHECK (original_approver_id <> escalated_to_approver_id)
);

COMMENT ON TABLE procurement.approval_escalations IS 
    '[FOUNDATION] Automated escalation event logging triggered when SLA timeouts occur.';

-- =============================================================================
-- SECTION 5 — RFQ (REQUEST FOR QUOTATION) SUB-SYSTEM
-- =============================================================================

-- 5.1 RFQ Header
CREATE TABLE procurement.rfqs (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    rfq_code                   VARCHAR(50)   NOT NULL,
    title                      VARCHAR(200)  NOT NULL,
    description                TEXT,
    publish_date               DATE,
    submission_deadline        TIMESTAMPTZ   NOT NULL,
    rfq_status_id              UUID          NOT NULL REFERENCES procurement.rfq_statuses(id),
    buyer_employee_id          UUID          NOT NULL REFERENCES employee.employees(id),
    
    -- Context
    company_id                 UUID          NOT NULL REFERENCES organization.companies(id),
    branch_id                  UUID          NOT NULL REFERENCES organization.branches(id),
    
    -- Concurrency and Auditing
    row_version                INT           NOT NULL DEFAULT 1,
    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc       TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id   UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    is_deleted                 BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at_utc             TIMESTAMPTZ,
    deleted_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_rfqs_code UNIQUE (rfq_code),
    CONSTRAINT chk_rfq_deadline CHECK (submission_deadline > created_at_utc)
);

COMMENT ON TABLE procurement.rfqs IS 
    '[OPERATIONAL] Document distributed to suppliers requesting item sourcing pricing proposals.';

-- 5.2 RFQ Lines
CREATE TABLE procurement.rfq_lines (
    id                           UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    rfq_id                       UUID          NOT NULL REFERENCES procurement.rfqs(id) ON DELETE CASCADE,
    line_number                  INT           NOT NULL,
    
    -- Origin link
    purchase_requisition_line_id UUID          REFERENCES procurement.purchase_requisition_lines(id) ON DELETE SET NULL,
    
    product_id                   UUID          NOT NULL REFERENCES product.products(id),
    product_variant_id           UUID          REFERENCES product.product_variants(id),
    quantity                     NUMERIC(18,4) NOT NULL,
    uom_id                       UUID          NOT NULL REFERENCES product.product_units_of_measure(id),
    required_delivery_date       DATE,

    CONSTRAINT uq_rfq_lines UNIQUE (rfq_id, line_number),
    CONSTRAINT chk_rfq_lines_qty CHECK (quantity > 0.0000)
);

COMMENT ON TABLE procurement.rfq_lines IS 
    '[OPERATIONAL] Item requirements linked within an RFQ dossier.';

-- 5.3 Supplier Invitations
CREATE TABLE procurement.supplier_invitations (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    rfq_id                     UUID          NOT NULL REFERENCES procurement.rfqs(id) ON DELETE CASCADE,
    supplier_id                UUID          NOT NULL REFERENCES supplier.suppliers(id),
    supplier_site_id           UUID          NOT NULL REFERENCES supplier.supplier_sites(id),
    
    invitation_date            DATE          NOT NULL DEFAULT CURRENT_DATE,
    invitation_status_id       UUID          NOT NULL REFERENCES procurement.invitation_statuses(id),
    declined_reason            TEXT,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_supplier_invitations UNIQUE (rfq_id, supplier_id, supplier_site_id)
);

COMMENT ON TABLE procurement.supplier_invitations IS 
    '[OPERATIONAL] Tracking registry of supplier site invitations issued for an RFQ.';

-- =============================================================================
-- SECTION 6 — SUPPLIER QUOTATION SUB-SYSTEM
-- =============================================================================

-- 6.1 Quotation Header
CREATE TABLE procurement.supplier_quotations (
    id                           UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    rfq_id                       UUID          REFERENCES procurement.rfqs(id) ON DELETE SET NULL,
    
    supplier_id                  UUID          NOT NULL REFERENCES supplier.suppliers(id),
    supplier_site_id             UUID          NOT NULL REFERENCES supplier.supplier_sites(id),
    
    quotation_reference_number   VARCHAR(100)  NOT NULL, -- Vendor's quote code
    quotation_code               VARCHAR(50)   NOT NULL, -- Internal tracking
    revision_number              INT           NOT NULL DEFAULT 1,
    
    submission_date              DATE          NOT NULL DEFAULT CURRENT_DATE,
    valid_from                   DATE          NOT NULL,
    valid_to                     DATE          NOT NULL,
    
    quotation_status_id          UUID          NOT NULL REFERENCES procurement.quotation_statuses(id),
    
    -- Currency Snapshot
    currency_code                VARCHAR(3)    NOT NULL,
    exchange_rate                NUMERIC(18,9) NOT NULL DEFAULT 1.000000000,
    
    -- Snapshots of terms
    payment_terms_snapshot       TEXT,
    freight_terms_snapshot       TEXT,
    payment_terms_id             UUID          REFERENCES supplier.payment_terms(id),
    freight_term_id              UUID          REFERENCES procurement.freight_terms(id),
    
    -- Summaries
    total_quotation_amount       NUMERIC(18,4) NOT NULL DEFAULT 0.00,
    total_tax_amount             NUMERIC(18,4) NOT NULL DEFAULT 0.00,
    total_net_amount             NUMERIC(18,4) NOT NULL DEFAULT 0.00,
    remarks                      TEXT,

    -- Concurrency and Auditing
    row_version                  INT           NOT NULL DEFAULT 1,
    created_at_utc               TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id           UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc         TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id     UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    is_deleted                   BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at_utc               TIMESTAMPTZ,
    deleted_by_user_id           UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_supplier_quotes_code UNIQUE (quotation_code, revision_number),
    CONSTRAINT chk_supplier_quotes_validity CHECK (valid_to >= valid_from),
    CONSTRAINT chk_supplier_quotes_rates CHECK (exchange_rate > 0.00),
    CONSTRAINT chk_supplier_quotes_financials CHECK (
        total_quotation_amount >= 0.00 AND 
        total_tax_amount >= 0.00 AND 
        total_net_amount >= 0.00
    )
);

COMMENT ON TABLE procurement.supplier_quotations IS 
    '[OPERATIONAL] Bid offers registered by suppliers detailing pricing, lead time, and validity.';

-- 6.2 Quotation Lines
CREATE TABLE procurement.quotation_lines (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    supplier_quotation_id      UUID          NOT NULL REFERENCES procurement.supplier_quotations(id) ON DELETE CASCADE,
    rfq_line_id                UUID          REFERENCES procurement.rfq_lines(id) ON DELETE SET NULL,
    line_number                INT           NOT NULL,
    
    -- Product
    product_id                 UUID          NOT NULL REFERENCES product.products(id),
    product_variant_id         UUID          REFERENCES product.product_variants(id),
    
    offered_quantity           NUMERIC(18,4) NOT NULL,
    uom_id                     UUID          NOT NULL REFERENCES product.product_units_of_measure(id),
    
    -- Unit Pricing details
    unit_price                 NUMERIC(18,4) NOT NULL,
    tax_percentage             NUMERIC(5,2)  NOT NULL DEFAULT 0.00,
    discount_percentage        NUMERIC(5,2)  NOT NULL DEFAULT 0.00,
    discount_amount            NUMERIC(18,4) NOT NULL DEFAULT 0.00,
    line_amount                NUMERIC(18,4) NOT NULL,
    
    -- Sourcing specifics
    lead_time_days             INT           NOT NULL,
    minimum_order_qty          NUMERIC(18,4) NOT NULL DEFAULT 1.0000,
    remarks                    TEXT,

    CONSTRAINT uq_quotation_lines UNIQUE (supplier_quotation_id, line_number),
    CONSTRAINT chk_quotation_lines_qty CHECK (offered_quantity > 0.0000),
    CONSTRAINT chk_quotation_lines_price CHECK (unit_price >= 0.0000),
    CONSTRAINT chk_quotation_lines_tax CHECK (tax_percentage >= 0.00 AND tax_percentage <= 100.00),
    CONSTRAINT chk_quotation_lines_disc CHECK (discount_percentage >= 0.00 AND discount_percentage <= 100.00),
    CONSTRAINT chk_quotation_lines_lead CHECK (lead_time_days >= 0)
);

COMMENT ON TABLE procurement.quotation_lines IS 
    '[OPERATIONAL] Product pricing offers per line within a vendor quotation.';

-- 6.3 Price Breaks (Quantity-based discount tiers)
CREATE TABLE procurement.quotation_price_breaks (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    quotation_line_id          UUID          NOT NULL REFERENCES procurement.quotation_lines(id) ON DELETE CASCADE,
    min_quantity               NUMERIC(18,4) NOT NULL,
    max_quantity               NUMERIC(18,4),
    unit_price                 NUMERIC(18,4) NOT NULL,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT chk_price_breaks_range CHECK (max_quantity IS NULL OR max_quantity >= min_quantity),
    CONSTRAINT chk_price_breaks_min CHECK (min_quantity >= 0.0000),
    CONSTRAINT chk_price_breaks_price CHECK (unit_price >= 0.0000)
);

COMMENT ON TABLE procurement.quotation_price_breaks IS 
    '[FOUNDATION] Tiered pricing configurations defined by vendors mapping unit rate to volume ranges.';

-- =============================================================================
-- SECTION 7 — EVALUATION & COMPARISON SUB-SYSTEM
-- =============================================================================

-- 7.1 Comparison Dossier
CREATE TABLE procurement.quotation_comparisons (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    rfq_id                     UUID          REFERENCES procurement.rfqs(id) ON DELETE SET NULL,
    comparison_code            VARCHAR(50)   NOT NULL,
    title                      VARCHAR(200)  NOT NULL,
    evaluation_date            DATE          NOT NULL DEFAULT CURRENT_DATE,
    status_id                  UUID          NOT NULL REFERENCES procurement.approval_statuses(id),
    remarks                    TEXT,

    -- Concurrency and Auditing
    row_version                INT           NOT NULL DEFAULT 1,
    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc       TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id     UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_quotation_comparisons UNIQUE (comparison_code)
);

COMMENT ON TABLE procurement.quotation_comparisons IS 
    '[OPERATIONAL] Record of sourcing evaluations comparing bid quotations for selection.';

-- 7.2 Criteria Scorecard Mapping
CREATE TABLE procurement.comparison_scorings (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    quotation_comparison_id    UUID          NOT NULL REFERENCES procurement.quotation_comparisons(id) ON DELETE CASCADE,
    supplier_quotation_id      UUID          NOT NULL REFERENCES procurement.supplier_quotations(id) ON DELETE CASCADE,
    criteria_id                UUID          NOT NULL REFERENCES procurement.evaluation_criteria(id),
    score                      NUMERIC(5,2)  NOT NULL,
    weight                     NUMERIC(5,2)  NOT NULL,
    weighted_score             NUMERIC(5,2)  GENERATED ALWAYS AS (score * weight / 100.00) STORED,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_comparison_scorings UNIQUE (quotation_comparison_id, supplier_quotation_id, criteria_id),
    CONSTRAINT chk_eval_scorings_val CHECK (score >= 0.00 AND score <= 100.00),
    CONSTRAINT chk_eval_scorings_wt CHECK (weight >= 0.00 AND weight <= 100.00)
);

COMMENT ON TABLE procurement.comparison_scorings IS 
    '[OPERATIONAL] Weighted evaluation scores per criteria registered for quotes.';

-- 7.3 Award Matrix Ranking
CREATE TABLE procurement.comparison_ranks (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    quotation_comparison_id    UUID          NOT NULL REFERENCES procurement.quotation_comparisons(id) ON DELETE CASCADE,
    supplier_quotation_id      UUID          NOT NULL REFERENCES procurement.supplier_quotations(id) ON DELETE CASCADE,
    
    overall_score              NUMERIC(5,2)  NOT NULL,
    supplier_rank              INT           NOT NULL,
    award_recommended          BOOLEAN       NOT NULL DEFAULT FALSE,
    evaluation_notes           TEXT,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_comparison_ranks UNIQUE (quotation_comparison_id, supplier_quotation_id),
    CONSTRAINT chk_eval_ranks_score CHECK (overall_score >= 0.00 AND overall_score <= 100.00),
    CONSTRAINT chk_eval_ranks_pos CHECK (supplier_rank >= 1)
);

COMMENT ON TABLE procurement.comparison_ranks IS 
    '[OPERATIONAL] Final compiled rank standing and sourcing award recommendation flags.';

-- =============================================================================
-- SECTION 8 — PURCHASE ORDER SUB-SYSTEM
-- =============================================================================

-- 8.1 PO Header
CREATE TABLE procurement.purchase_orders (
    id                           UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    po_code                      VARCHAR(50)   NOT NULL,
    revision_number              INT           NOT NULL DEFAULT 1,
    po_date                      DATE          NOT NULL DEFAULT CURRENT_DATE,
    
    -- Context
    company_id                   UUID          NOT NULL REFERENCES organization.companies(id),
    branch_id                    UUID          NOT NULL REFERENCES organization.branches(id),
    
    -- Sourcing Partner
    supplier_id                  UUID          NOT NULL REFERENCES supplier.suppliers(id),
    supplier_site_id             UUID          NOT NULL REFERENCES supplier.supplier_sites(id),
    
    -- Terms Snapshots
    payment_terms_snapshot       TEXT,
    freight_terms_snapshot       TEXT,
    payment_terms_id             UUID          REFERENCES supplier.payment_terms(id),
    freight_term_id              UUID          REFERENCES procurement.freight_terms(id),
    incoterm_id                  UUID          REFERENCES supplier.incoterms_codes(id),
    
    -- Currency
    currency_code                VARCHAR(3)    NOT NULL,
    exchange_rate                NUMERIC(18,9) NOT NULL DEFAULT 1.000000000,
    
    -- Actor
    buyer_employee_id            UUID          NOT NULL REFERENCES employee.employees(id),
    po_status_id                 UUID          NOT NULL REFERENCES procurement.purchase_order_statuses(id),
    
    -- Optional references
    contract_id                  UUID,          -- circular/forward reference to procurement.contracts (foreign key added later)
    
    is_emergency                 BOOLEAN       NOT NULL DEFAULT FALSE,
    emergency_justification      TEXT,
    
    -- Totals
    total_gross_amount           NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    total_discount_amount        NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    total_tax_amount             NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    total_net_amount             NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    remarks                      TEXT,

    -- Concurrency and Auditing
    row_version                  INT           NOT NULL DEFAULT 1,
    created_at_utc               TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id           UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc         TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id     UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    is_deleted                       BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at_utc                   TIMESTAMPTZ,
    deleted_by_user_id               UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_purchase_orders_code UNIQUE (po_code, revision_number),
    CONSTRAINT chk_po_exchange_rate CHECK (exchange_rate > 0.00),
    CONSTRAINT chk_po_financials CHECK (
        total_gross_amount >= 0.00 AND
        total_discount_amount >= 0.00 AND
        total_tax_amount >= 0.00 AND
        total_net_amount >= 0.00
    )
);

COMMENT ON TABLE procurement.purchase_orders IS 
    '[OPERATIONAL] Binding commercial purchasing order raised to suppliers.';

-- 8.2 PO Lines
CREATE TABLE procurement.purchase_order_lines (
    id                               UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    purchase_order_id                UUID          NOT NULL REFERENCES procurement.purchase_orders(id) ON DELETE CASCADE,
    line_number                      INT           NOT NULL,
    
    -- Product
    product_id                       UUID          NOT NULL REFERENCES product.products(id),
    product_variant_id               UUID          REFERENCES product.product_variants(id),
    
    -- Quantity
    quantity                         NUMERIC(18,4) NOT NULL,
    uom_id                           UUID          NOT NULL REFERENCES product.product_units_of_measure(id),
    
    -- Price elements
    unit_price                       NUMERIC(18,4) NOT NULL,
    gross_amount                     NUMERIC(18,4) NOT NULL,
    discount_percentage              NUMERIC(5,2)  NOT NULL DEFAULT 0.00,
    discount_amount                  NUMERIC(18,4) NOT NULL DEFAULT 0.00,
    
    -- Tax mapping (Integration with Product Master tax structure)
    tax_category_id                  UUID          NOT NULL REFERENCES product.product_tax_categories(id),
    tax_percentage                   NUMERIC(5,2)  NOT NULL DEFAULT 0.00,
    tax_amount                       NUMERIC(18,4) NOT NULL DEFAULT 0.00,
    net_amount                       NUMERIC(18,4) NOT NULL,
    
    -- Warehouse Target
    destination_warehouse_id         UUID          NOT NULL REFERENCES warehouse.warehouses(id),
    destination_storage_location_id  UUID          REFERENCES warehouse.storage_locations(id),
    
    -- Sourcing linkage
    requisition_line_id              UUID          REFERENCES procurement.purchase_requisition_lines(id) ON DELETE SET NULL,
    
    line_status_id                   UUID          NOT NULL REFERENCES procurement.purchase_order_statuses(id),
    remarks                          TEXT,

    -- Auditing
    created_at_utc                   TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id               UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_po_lines UNIQUE (purchase_order_id, line_number),
    CONSTRAINT chk_po_lines_qty CHECK (quantity > 0.0000),
    CONSTRAINT chk_po_lines_unit_price CHECK (unit_price >= 0.0000),
    CONSTRAINT chk_po_lines_disc CHECK (discount_percentage >= 0.00 AND discount_percentage <= 100.00),
    CONSTRAINT chk_po_lines_tax CHECK (tax_percentage >= 0.00 AND tax_percentage <= 100.00),
    CONSTRAINT chk_po_lines_financials CHECK (
        gross_amount >= 0.00 AND
        discount_amount >= 0.00 AND
        tax_amount >= 0.00 AND
        net_amount >= 0.00
    )
);

COMMENT ON TABLE procurement.purchase_order_lines IS 
    '[OPERATIONAL] Line items detail associated to a PO with pricing and destination rules.';

-- 8.3 PO Line Taxes (Granular tax breakdown, e.g. CGST, SGST, IGST)
CREATE TABLE procurement.po_line_taxes (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    po_line_id                 UUID          NOT NULL REFERENCES procurement.purchase_order_lines(id) ON DELETE CASCADE,
    tax_name                   VARCHAR(100)  NOT NULL,
    tax_rate_pct               NUMERIC(5,2)  NOT NULL,
    tax_amount                 NUMERIC(18,4) NOT NULL,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT chk_po_line_tax_rate CHECK (tax_rate_pct >= 0.00 AND tax_rate_pct <= 100.00),
    CONSTRAINT chk_po_line_tax_amt CHECK (tax_amount >= 0.00)
);

COMMENT ON TABLE procurement.po_line_taxes IS 
    '[OPERATIONAL] Itemised tax breakdowns per PO line (CGST, SGST, IGST, Cess).';

-- 8.4 PO Line Discounts (Granular discounts list)
CREATE TABLE procurement.po_line_discounts (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    po_line_id                 UUID          NOT NULL REFERENCES procurement.purchase_order_lines(id) ON DELETE CASCADE,
    discount_name              VARCHAR(100)  NOT NULL,
    discount_rate_pct          NUMERIC(5,2)  NOT NULL,
    discount_amount            NUMERIC(18,4) NOT NULL,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT chk_po_line_disc_rate CHECK (discount_rate_pct >= 0.00 AND discount_rate_pct <= 100.00),
    CONSTRAINT chk_po_line_disc_amt CHECK (discount_amount >= 0.00)
);

COMMENT ON TABLE procurement.po_line_discounts IS 
    '[OPERATIONAL] Itemised trade discount schemes applied to PO lines.';

-- 8.5 PO Delivery Schedule (Split Deliveries)
CREATE TABLE procurement.po_delivery_schedules (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    po_line_id                 UUID          NOT NULL REFERENCES procurement.purchase_order_lines(id) ON DELETE CASCADE,
    schedule_number            INT           NOT NULL,
    
    quantity                   NUMERIC(18,4) NOT NULL,
    promised_date              DATE          NOT NULL,
    estimated_arrival_date     DATE          NOT NULL,
    delivered_quantity         NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    
    -- Target Warehouse Split
    warehouse_id               UUID          NOT NULL REFERENCES warehouse.warehouses(id),
    storage_location_id        UUID          REFERENCES warehouse.storage_locations(id),

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_po_delivery_schedules UNIQUE (po_line_id, schedule_number),
    CONSTRAINT chk_po_delivery_schedule_qty CHECK (quantity > 0.0000),
    CONSTRAINT chk_po_delivery_schedule_del_qty CHECK (delivered_quantity >= 0.0000),
    CONSTRAINT chk_po_delivery_schedule_dates CHECK (estimated_arrival_date >= promised_date)
);

COMMENT ON TABLE procurement.po_delivery_schedules IS 
    '[OPERATIONAL] Delivery timeline schedules per PO line for staggered drop shipments.';

-- 8.6 Logistics Shipping Schedules (Forward Tracking)
CREATE TABLE procurement.po_shipment_schedules (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    po_delivery_schedule_id    UUID          NOT NULL REFERENCES procurement.po_delivery_schedules(id) ON DELETE CASCADE,
    
    -- Shipment identifiers
    vessel_or_flight_number    VARCHAR(100),
    carrier_name               VARCHAR(100)  NOT NULL,
    bill_of_lading             VARCHAR(100),
    container_number           VARCHAR(100),
    
    origin_port                VARCHAR(100),
    destination_port           VARCHAR(100),
    
    departure_date_actual      DATE,
    arrival_date_estimated     DATE          NOT NULL,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT chk_shipping_schedule_dates CHECK (arrival_date_estimated >= departure_date_actual)
);

COMMENT ON TABLE procurement.po_shipment_schedules IS 
    '[OPERATIONAL] Inbound freight manifest logistics tracking details.';

-- 8.7 PO Amendments Audit History
CREATE TABLE procurement.purchase_order_amendments (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    purchase_order_id          UUID          NOT NULL REFERENCES procurement.purchase_orders(id) ON DELETE CASCADE,
    revision_number            INT           NOT NULL,
    amended_by_employee_id     UUID          NOT NULL REFERENCES employee.employees(id),
    amendment_reason           TEXT          NOT NULL,
    
    approved_by_employee_id    UUID          REFERENCES employee.employees(id),
    approved_at_utc            TIMESTAMPTZ,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_po_amendments UNIQUE (purchase_order_id, revision_number)
);

COMMENT ON TABLE procurement.purchase_order_amendments IS 
    '[HISTORY] Registry of PO revision changes, amendment causes, and signing approvals.';

-- 8.8 Immutable PO Revisions Snapshot
CREATE TABLE procurement.po_revisions (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    purchase_order_id          UUID          NOT NULL,
    revision_number            INT           NOT NULL,
    po_payload_json            JSONB         NOT NULL, -- Complete header + lines snapshot
    archived_at_utc            TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    archived_by_user_id        UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_po_revisions UNIQUE (purchase_order_id, revision_number)
);

COMMENT ON TABLE procurement.po_revisions IS 
    '[HISTORY] Immutable snapshot backups of previous PO revisions for compliance auditing.';

-- 8.9 PO Status History
CREATE TABLE procurement.po_status_history (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    purchase_order_id          UUID          NOT NULL REFERENCES procurement.purchase_orders(id) ON DELETE CASCADE,
    status_id                  UUID          NOT NULL REFERENCES procurement.purchase_order_statuses(id),
    effective_from             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    effective_to               TIMESTAMPTZ,
    changed_by_employee_id     UUID          NOT NULL REFERENCES employee.employees(id),
    remarks                    TEXT,

    CONSTRAINT chk_po_status_history_temporal CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

COMMENT ON TABLE procurement.po_status_history IS 
    '[HISTORY] State transition logging record for PO document lifecycle.';

-- =============================================================================
-- SECTION 9 — GOODS RECEIPT NOTE (GRN) SUB-SYSTEM
-- =============================================================================

-- 9.1 GRN Header
CREATE TABLE procurement.grns (
    id                           UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    grn_code                     VARCHAR(50)   NOT NULL,
    receipt_date                 DATE          NOT NULL DEFAULT CURRENT_DATE,
    
    -- PO Source
    purchase_order_id            UUID          NOT NULL REFERENCES procurement.purchase_orders(id),
    
    -- Supplier Info
    supplier_id                  UUID          NOT NULL REFERENCES supplier.suppliers(id),
    supplier_site_id             UUID          NOT NULL REFERENCES supplier.supplier_sites(id),
    
    -- Target destination warehouse
    warehouse_id                 UUID          NOT NULL REFERENCES warehouse.warehouses(id),
    receiving_employee_id        UUID          NOT NULL REFERENCES employee.employees(id),
    
    -- Logistic credentials
    delivery_challan_number      VARCHAR(100),
    delivery_challan_date        DATE,
    gate_entry_number            VARCHAR(100),
    gate_entry_time              TIMESTAMPTZ,
    vehicle_number               VARCHAR(50),
    
    receipt_status_id            UUID          NOT NULL REFERENCES procurement.receipt_statuses(id),
    remarks                      TEXT,

    -- Concurrency and Auditing
    row_version                  INT           NOT NULL DEFAULT 1,
    created_at_utc               TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id           UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc         TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id     UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    is_deleted                       BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at_utc                   TIMESTAMPTZ,
    deleted_by_user_id               UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_grns_code UNIQUE (grn_code)
);

COMMENT ON TABLE procurement.grns IS 
    '[OPERATIONAL] Goods Receipt Note documentation raised on physical inventory delivery.';

-- 9.2 GRN Lines
CREATE TABLE procurement.grn_lines (
    id                               UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    grn_id                           UUID          NOT NULL REFERENCES procurement.grns(id) ON DELETE CASCADE,
    po_line_id                       UUID          NOT NULL REFERENCES procurement.purchase_order_lines(id),
    line_number                      INT           NOT NULL,
    
    -- Product
    product_id                       UUID          NOT NULL REFERENCES product.products(id),
    product_variant_id               UUID          REFERENCES product.product_variants(id),
    
    -- Quantities
    received_quantity                NUMERIC(18,4) NOT NULL,
    uom_id                           UUID          NOT NULL REFERENCES product.product_units_of_measure(id),
    
    -- Dispositions
    accepted_quantity                NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    rejected_quantity                NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    damage_quantity                  NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    over_receipt_quantity            NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    short_receipt_quantity           NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    
    -- Storage coordinates (temporary staging bin/bay)
    storage_location_id              UUID          REFERENCES warehouse.storage_locations(id),
    
    -- Inventory batch reference mapping (integrates with Inventory batches)
    batch_id                         UUID          REFERENCES inventory.batches(id),
    
    inspection_status_id             UUID          NOT NULL REFERENCES procurement.inspection_results(id),

    -- Auditing
    created_at_utc                   TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id               UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_grn_lines UNIQUE (grn_id, line_number),
    CONSTRAINT chk_grn_lines_received CHECK (received_quantity > 0.0000),
    CONSTRAINT chk_grn_lines_breakdown CHECK (
        received_quantity = (accepted_quantity + rejected_quantity + damage_quantity)
    )
);

COMMENT ON TABLE procurement.grn_lines IS 
    '[OPERATIONAL] Received items quantity, batch, and QA disposition outcomes.';

-- 9.3 Quality Hold Tracking
CREATE TABLE procurement.quality_holds (
    id                           UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    grn_line_id                  UUID          NOT NULL REFERENCES procurement.grn_lines(id) ON DELETE CASCADE,
    batch_number                 VARCHAR(100)  NOT NULL,
    
    hold_date                    DATE          NOT NULL DEFAULT CURRENT_DATE,
    released_date                DATE,
    
    hold_reason                  TEXT          NOT NULL,
    release_reason               TEXT,
    release_decision_employee_id UUID          REFERENCES employee.employees(id),

    created_at_utc               TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id           UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc         TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT chk_qa_hold_dates CHECK (released_date IS NULL OR released_date >= hold_date)
);

COMMENT ON TABLE procurement.quality_holds IS 
    '[OPERATIONAL] Quarantine hold records on batches failing receiving rules or requiring lab tests.';

-- 9.4 Receiving Exceptions Log (Damage/Short/Over detailing)
CREATE TABLE procurement.receiving_exceptions (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    grn_line_id                UUID          NOT NULL REFERENCES procurement.grn_lines(id) ON DELETE CASCADE,
    damage_type_id             UUID          REFERENCES procurement.damage_types(id),
    
    exception_quantity         NUMERIC(18,4) NOT NULL,
    action_taken               TEXT          NOT NULL, -- RTV, scrap, discount claim
    photo_reference            VARCHAR(500), -- File link to evidence photos

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT chk_receiv_ex_qty CHECK (exception_quantity > 0.0000)
);

COMMENT ON TABLE procurement.receiving_exceptions IS 
    '[OPERATIONAL] Case logs documenting damaged boxes, leaking seals, or missing carton issues.';

-- 9.5 Goods QA Lab Inspections
CREATE TABLE procurement.grn_inspections (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    grn_line_id                UUID          NOT NULL REFERENCES procurement.grn_lines(id) ON DELETE CASCADE,
    inspected_by_employee_id   UUID          NOT NULL REFERENCES employee.employees(id),
    inspection_date            DATE          NOT NULL DEFAULT CURRENT_DATE,
    result_id                  UUID          NOT NULL REFERENCES procurement.inspection_results(id),
    
    sample_size                NUMERIC(18,4) NOT NULL,
    defect_count               INT           NOT NULL DEFAULT 0,
    inspection_notes           TEXT,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT chk_qa_inspect_sample CHECK (sample_size > 0.0000),
    CONSTRAINT chk_qa_inspect_defects CHECK (defect_count >= 0)
);

COMMENT ON TABLE procurement.grn_inspections IS 
    '[OPERATIONAL] Formal Quality Assurance test logging sheet for received food items.';

-- =============================================================================
-- SECTION 10 — PURCHASE RETURNS (RTV) SUB-SYSTEM
-- =============================================================================

-- 10.1 Return Header
CREATE TABLE procurement.purchase_returns (
    id                           UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    return_code                  VARCHAR(50)   NOT NULL,
    return_date                  DATE          NOT NULL DEFAULT CURRENT_DATE,
    
    -- Source Reference
    grn_id                       UUID          REFERENCES procurement.grns(id),
    purchase_order_id            UUID          REFERENCES procurement.purchase_orders(id),
    
    supplier_id                  UUID          NOT NULL REFERENCES supplier.suppliers(id),
    supplier_site_id             UUID          NOT NULL REFERENCES supplier.supplier_sites(id),
    
    warehouse_id                 UUID          NOT NULL REFERENCES warehouse.warehouses(id),
    returned_by_employee_id      UUID          NOT NULL REFERENCES employee.employees(id),
    
    return_status_id             UUID          NOT NULL REFERENCES procurement.return_statuses(id),
    total_return_value           NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    remarks                      TEXT,

    -- Concurrency and Auditing
    row_version                  INT           NOT NULL DEFAULT 1,
    created_at_utc               TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id           UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc         TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id     UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    is_deleted                       BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at_utc                   TIMESTAMPTZ,
    deleted_by_user_id               UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_purchase_returns_code UNIQUE (return_code),
    CONSTRAINT chk_purchase_rtv_value CHECK (total_return_value >= 0.00)
);

COMMENT ON TABLE procurement.purchase_returns IS 
    '[OPERATIONAL] Return To Vendor (RTV) document claiming refunds or replacement stocks.';

-- 10.2 Return Lines
CREATE TABLE procurement.purchase_return_lines (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    purchase_return_id         UUID          NOT NULL REFERENCES procurement.purchase_returns(id) ON DELETE CASCADE,
    grn_line_id                UUID          REFERENCES procurement.grn_lines(id) ON DELETE SET NULL,
    line_number                INT           NOT NULL,
    
    -- Product
    product_id                 UUID          NOT NULL REFERENCES product.products(id),
    product_variant_id         UUID          REFERENCES product.product_variants(id),
    
    -- Quantities
    return_quantity            NUMERIC(18,4) NOT NULL,
    uom_id                     UUID          NOT NULL REFERENCES product.product_units_of_measure(id),
    
    -- Value
    unit_price_snapshot        NUMERIC(18,4) NOT NULL,
    tax_refund_amount          NUMERIC(18,4) NOT NULL DEFAULT 0.00,
    line_total_amount          NUMERIC(18,4) GENERATED ALWAYS AS ((return_quantity * unit_price_snapshot) + tax_refund_amount) STORED,
    
    return_reason_id           UUID          NOT NULL REFERENCES procurement.return_reasons(id),
    remarks                    TEXT,

    CONSTRAINT uq_rtv_lines UNIQUE (purchase_return_id, line_number),
    CONSTRAINT chk_rtv_lines_qty CHECK (return_quantity > 0.0000),
    CONSTRAINT chk_rtv_lines_price CHECK (unit_price_snapshot >= 0.00),
    CONSTRAINT chk_rtv_lines_tax CHECK (tax_refund_amount >= 0.00)
);

COMMENT ON TABLE procurement.purchase_return_lines IS 
    '[OPERATIONAL] Returned item detail listings with value and validation reason links.';

-- 10.3 Dispatch Shipment Details
CREATE TABLE procurement.purchase_return_shipments (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    purchase_return_id         UUID          NOT NULL REFERENCES procurement.purchase_returns(id) ON DELETE CASCADE,
    
    carrier_name               VARCHAR(100)  NOT NULL,
    consignment_note           VARCHAR(100),
    shipment_date              DATE          NOT NULL,
    estimated_delivery_date    DATE,
    delivery_confirmed_date    DATE,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT chk_rtv_shipping_dates CHECK (delivery_confirmed_date IS NULL OR delivery_confirmed_date >= shipment_date)
);

COMMENT ON TABLE procurement.purchase_return_shipments IS 
    '[OPERATIONAL] Logistics carrier tracking for returned shipments dispatched back to vendors.';

-- =============================================================================
-- SECTION 11 — PROCUREMENT CONTRACTS (BLANKET AGREEMENTS)
-- =============================================================================

-- 11.1 Blanket Purchase Agreements
CREATE TABLE procurement.contracts (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    contract_code              VARCHAR(50)   NOT NULL,
    title                      VARCHAR(200)  NOT NULL,
    
    supplier_id                UUID          NOT NULL REFERENCES supplier.suppliers(id),
    supplier_site_id           UUID          NOT NULL REFERENCES supplier.supplier_sites(id),
    
    contract_type_id           UUID          NOT NULL REFERENCES procurement.contract_types(id),
    start_date                 DATE          NOT NULL,
    end_date                   DATE          NOT NULL,
    
    currency_code              VARCHAR(3)    NOT NULL DEFAULT 'INR',
    agreement_value_committed  NUMERIC(18,4) NOT NULL,
    agreement_value_actual     NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    
    payment_terms_id           UUID          NOT NULL REFERENCES supplier.payment_terms(id),
    
    is_active                  BOOLEAN       NOT NULL DEFAULT TRUE,
    remarks                    TEXT,

    -- Concurrency and Auditing
    row_version                INT           NOT NULL DEFAULT 1,
    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc         TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id     UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    is_deleted                       BOOLEAN       NOT NULL DEFAULT FALSE,
    deleted_at_utc                   TIMESTAMPTZ,
    deleted_by_user_id               UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT uq_proc_contracts_code UNIQUE (contract_code),
    CONSTRAINT chk_proc_contracts_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_proc_contracts_comm CHECK (agreement_value_committed >= 0.00),
    CONSTRAINT chk_proc_contracts_act CHECK (agreement_value_actual >= 0.00)
);

COMMENT ON TABLE procurement.contracts IS 
    '[FOUNDATION] Long-term trade agreement registries mapping fixed prices and obligations.';

-- 11.2 Blanket Contract Lines
CREATE TABLE procurement.contract_lines (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    contract_id                UUID          NOT NULL REFERENCES procurement.contracts(id) ON DELETE CASCADE,
    
    product_id                 UUID          NOT NULL REFERENCES product.products(id),
    product_variant_id         UUID          REFERENCES product.product_variants(id),
    
    committed_quantity         NUMERIC(18,4) NOT NULL,
    released_quantity          NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    agreed_price               NUMERIC(18,4) NOT NULL,
    uom_id                     UUID          NOT NULL REFERENCES product.product_units_of_measure(id),

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT uq_contract_lines UNIQUE (contract_id, product_id, product_variant_id),
    CONSTRAINT chk_contract_lines_qty CHECK (committed_quantity > 0.0000),
    CONSTRAINT chk_contract_lines_rel CHECK (released_quantity >= 0.0000),
    CONSTRAINT chk_contract_lines_price CHECK (agreed_price >= 0.0000)
);

COMMENT ON TABLE procurement.contract_lines IS 
    '[FOUNDATION] Specific products and pricing agreed under the parent blanket contract.';

-- Add the missing circular foreign key from purchase_orders back to contracts
ALTER TABLE procurement.purchase_orders
    ADD CONSTRAINT fk_purchase_orders_contract FOREIGN KEY (contract_id)
    REFERENCES procurement.contracts(id) ON DELETE SET NULL;

-- 11.3 Renewal Logs
CREATE TABLE procurement.contract_renewals (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    contract_id                UUID          NOT NULL REFERENCES procurement.contracts(id) ON DELETE CASCADE,
    renewal_date               DATE          NOT NULL DEFAULT CURRENT_DATE,
    previous_end_date          DATE          NOT NULL,
    new_end_date               DATE          NOT NULL,
    renewed_by_employee_id     UUID          NOT NULL REFERENCES employee.employees(id),
    remarks                    TEXT,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT chk_contract_renew_dates CHECK (new_end_date > previous_end_date)
);

COMMENT ON TABLE procurement.contract_renewals IS 
    '[HISTORY] Audit logs of contract validity date extensions and reviews.';

-- =============================================================================
-- SECTION 12 — LANDED COST FOUNDATION
-- =============================================================================

CREATE TABLE procurement.po_landed_costs (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    purchase_order_id          UUID          REFERENCES procurement.purchase_orders(id) ON DELETE CASCADE,
    grn_id                     UUID          REFERENCES procurement.grns(id) ON DELETE CASCADE,
    
    landed_cost_type_id        UUID          NOT NULL REFERENCES procurement.landed_cost_types(id),
    allocation_method_id       UUID          NOT NULL REFERENCES procurement.allocation_methods(id),
    
    estimated_amount           NUMERIC(18,4) NOT NULL DEFAULT 0.0000,
    actual_amount              NUMERIC(18,4),
    
    currency_code              VARCHAR(3)    NOT NULL DEFAULT 'INR',
    exchange_rate              NUMERIC(18,9) NOT NULL DEFAULT 1.000000000,

    -- Concurrency and Auditing
    row_version                INT           NOT NULL DEFAULT 1,
    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,
    last_modified_at_utc         TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    last_modified_by_user_id     UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT chk_landed_cost_est CHECK (estimated_amount >= 0.00),
    CONSTRAINT chk_landed_cost_act CHECK (actual_amount IS NULL OR actual_amount >= 0.00),
    CONSTRAINT chk_landed_cost_ex CHECK (exchange_rate > 0.00),
    CONSTRAINT chk_landed_cost_poly CHECK (
        (purchase_order_id IS NOT NULL AND grn_id IS NULL) OR
        (grn_id IS NOT NULL AND purchase_order_id IS NULL)
    )
);

COMMENT ON TABLE procurement.po_landed_costs IS 
    '[OPERATIONAL] Capitalized landed charges mapped to a PO or GRN for split cost profiling.';

-- =============================================================================
-- SECTION 13 — DOCUMENT ATTACHMENTS
-- =============================================================================

CREATE TABLE procurement.procurement_attachments (
    id                         UUID          PRIMARY KEY DEFAULT iam.uuid_generate_v7(),
    document_type              VARCHAR(50)   NOT NULL, -- 'REQUISITION', 'RFQ', 'QUOTATION', 'PO', 'GRN', 'RETURN', 'CONTRACT'
    document_id                UUID          NOT NULL,
    
    attachment_type_id         UUID          NOT NULL REFERENCES procurement.procurement_document_types(id),
    file_name                  VARCHAR(255)  NOT NULL,
    file_path                  TEXT          NOT NULL,
    file_size_bytes            BIGINT        NOT NULL,
    file_mime_type             VARCHAR(100)  NOT NULL,

    created_at_utc             TIMESTAMPTZ   NOT NULL DEFAULT clock_timestamp(),
    created_by_user_id         UUID          REFERENCES iam.users(id) ON DELETE SET NULL,

    CONSTRAINT chk_proc_attach_size CHECK (file_size_bytes > 0),
    CONSTRAINT chk_proc_attach_doctype CHECK (document_type IN ('REQUISITION', 'RFQ', 'QUOTATION', 'PO', 'GRN', 'RETURN', 'CONTRACT'))
);

COMMENT ON TABLE procurement.procurement_attachments IS 
    '[FOUNDATION] Centralised mapping reference linking files (S3, blob) to specific workflow documents.';

-- =============================================================================
-- SECTION 14 — INDEX STRATEGY (PERFORMANCE & REPORTING)
-- =============================================================================

-- Requisitions
CREATE INDEX idx_reqs_status_branch              ON procurement.purchase_requisitions (requisition_status_id, branch_id);
CREATE INDEX idx_reqs_requester                  ON procurement.purchase_requisitions (requested_by_employee_id);
CREATE INDEX idx_req_lines_product               ON procurement.purchase_requisition_lines (product_id, product_variant_id);
CREATE INDEX idx_req_lines_warehouse             ON procurement.purchase_requisition_lines (destination_warehouse_id);

-- RFQ & Quotation Sourcing Indexes
CREATE INDEX idx_rfqs_status_deadline            ON procurement.rfqs (rfq_status_id, submission_deadline DESC);
CREATE INDEX idx_rfq_lines_product               ON procurement.rfq_lines (product_id);
CREATE INDEX idx_invitations_supplier            ON procurement.supplier_invitations (supplier_id);
CREATE INDEX idx_quotes_supplier_rfq             ON procurement.supplier_quotations (supplier_id, rfq_id);
CREATE INDEX idx_quotes_status                   ON procurement.supplier_quotations (quotation_status_id);

-- Purchase Orders
CREATE INDEX idx_po_supplier_branch              ON procurement.purchase_orders (supplier_id, branch_id);
CREATE INDEX idx_po_status_date                  ON procurement.purchase_orders (po_status_id, po_date DESC);
CREATE INDEX idx_po_lines_product                ON procurement.purchase_order_lines (product_id, product_variant_id);
CREATE INDEX idx_po_lines_warehouse              ON procurement.purchase_order_lines (destination_warehouse_id);
CREATE INDEX idx_po_deliv_sched_warehouse        ON procurement.po_delivery_schedules (warehouse_id, promised_date);

-- GRN Receiving
CREATE INDEX idx_grn_po_receipt                  ON procurement.grns (purchase_order_id, receipt_date DESC);
CREATE INDEX idx_grn_status_warehouse            ON procurement.grns (receipt_status_id, warehouse_id);
CREATE INDEX idx_grn_lines_product               ON procurement.grn_lines (product_id, product_variant_id);
CREATE INDEX idx_grn_lines_batch                 ON procurement.grn_lines (batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_qa_holds_batch                  ON procurement.quality_holds (batch_number) WHERE released_date IS NULL;

-- Returns
CREATE INDEX idx_rtv_supplier_status             ON procurement.purchase_returns (supplier_id, return_status_id);
CREATE INDEX idx_rtv_lines_product               ON procurement.purchase_return_lines (product_id);

-- Contracts
CREATE INDEX idx_contracts_supplier_dates        ON procurement.contracts (supplier_id, start_date, end_date) WHERE is_active = TRUE;
CREATE INDEX idx_contract_lines_product          ON procurement.contract_lines (product_id, product_variant_id);

-- Landed costs & attachments
CREATE INDEX idx_landed_costs_po                 ON procurement.po_landed_costs (purchase_order_id) WHERE purchase_order_id IS NOT NULL;
CREATE INDEX idx_landed_costs_grn                ON procurement.po_landed_costs (grn_id) WHERE grn_id IS NOT NULL;
CREATE INDEX idx_attachments_doc                 ON procurement.procurement_attachments (document_type, document_id);
