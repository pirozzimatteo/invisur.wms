CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Warehouse Locations
CREATE TABLE warehouse_location (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    parent_id UUID REFERENCES warehouse_location(id),
    type VARCHAR(20) NOT NULL, -- SITE, AREA, AISLE, RACK, LEVEL, BIN
    status VARCHAR(20) NOT NULL DEFAULT 'FREE', -- FREE, OCCUPIED, BLOCKED
    capacity_volume DECIMAL(10,2),
    current_volume DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_location_parent ON warehouse_location(parent_id);
CREATE INDEX idx_location_status ON warehouse_location(status);

-- Items (Articoli)
CREATE TABLE item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE, -- SKU
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    unit_of_measure VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Item References (Barcode multipli)
CREATE TABLE item_reference (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES item(id),
    code VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- EAN13, SUPPLIER, etc.
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, type) -- Un codice può esser ripetuto se tipo diverso? Meglio unique su code globale per semplicità scan
);
CREATE INDEX idx_item_ref_code ON item_reference(code);

-- Stock (Giacenza)
CREATE TABLE stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES item(id),
    location_id UUID NOT NULL REFERENCES warehouse_location(id),
    quantity DECIMAL(12,3) NOT NULL CHECK (quantity >= 0),
    batch_number VARCHAR(50),
    serial_number VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, ALLOCATED, QUARANTINE, BLOCKED
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_stock_item_loc ON stock(item_id, location_id);

-- Inbound Header
CREATE TABLE inbound_receipt (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) NOT NULL,
    supplier_id VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'NEW', -- NEW, IN_PROGRESS, COMPLETED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inbound Lines
CREATE TABLE inbound_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID NOT NULL REFERENCES inbound_receipt(id),
    item_id UUID NOT NULL REFERENCES item(id),
    expected_qty DECIMAL(12,3) NOT NULL DEFAULT 0,
    received_qty DECIMAL(12,3) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outbound Header
CREATE TABLE outbound_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'NEW', -- NEW, PLANNED, PICKING, SHIPPED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outbound Lines
CREATE TABLE outbound_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES outbound_order(id),
    item_id UUID NOT NULL REFERENCES item(id),
    ordered_qty DECIMAL(12,3) NOT NULL DEFAULT 0,
    picked_qty DECIMAL(12,3) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Non Conformity
CREATE TABLE non_conformity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref_type VARCHAR(20) NOT NULL, -- INBOUND_LINE, STOCK
    ref_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL, -- DAMAGED, WRONG_QTY, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN, CLOSED
    action_taken VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
