CREATE TABLE picking_task (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES outbound_order(id),
    item_id UUID NOT NULL REFERENCES item(id),
    source_location_id UUID NOT NULL REFERENCES warehouse_location(id),
    target_quantity INT NOT NULL,
    picked_quantity INT DEFAULT 0,
    status VARCHAR(20) NOT NULL, -- PENDING, ASSIGNED, COMPLETED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_picking_task_status ON picking_task(status);
CREATE INDEX idx_picking_task_order ON picking_task(order_id);
