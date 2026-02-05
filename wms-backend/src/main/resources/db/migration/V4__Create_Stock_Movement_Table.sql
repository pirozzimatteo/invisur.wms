CREATE TABLE stock_movement (
    id UUID PRIMARY KEY,
    item_id UUID NOT NULL,
    source_location_id UUID, -- Nullable for initial inbound
    dest_location_id UUID,   -- Nullable for outbound/scrap
    quantity DECIMAL(10,2) NOT NULL,
    reason VARCHAR(50) NOT NULL, -- INBOUND, OUTBOUND, MOVE, ADJUSTMENT
    operator_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movement_item FOREIGN KEY (item_id) REFERENCES item(id),
    CONSTRAINT fk_movement_source FOREIGN KEY (source_location_id) REFERENCES warehouse_location(id),
    CONSTRAINT fk_movement_dest FOREIGN KEY (dest_location_id) REFERENCES warehouse_location(id)
);

CREATE INDEX idx_movement_created_at ON stock_movement(created_at DESC);
