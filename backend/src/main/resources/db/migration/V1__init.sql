CREATE TABLE product(
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE NOT NULL
);

CREATE TABLE app_user(
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT('STAFF'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    username TEXT,
    password_hashed TEXT,
    pin_hashed TEXT,
    CONSTRAINT chk_role
        CHECK(role in ('MANAGER','STAFF'))
);

CREATE TABLE expiry_record(
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    quantity BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by TEXT NOT NULL,
    updated_at TIMESTAMPTZ,
    updated_by TEXT,
    CONSTRAINT fk_expiry_product
        FOREIGN KEY(product_id)
        REFERENCES product(id)
        ON DELETE RESTRICT,
    CONSTRAINT expiry_record_create_user
        FOREIGN KEY(created_by)
        REFERENCES app_user(id)
        ON DELETE RESTRICT,
    CONSTRAINT expiry_record_update_user
            FOREIGN KEY(updated_by)
            REFERENCES app_user(id)
            ON DELETE RESTRICT,
    CONSTRAINT expiry_record_quantity_minimum
            CHECK(quantity > 0)
);

CREATE TABLE writeoff(
    id TEXT PRIMARY KEY,
    expiry_record_id TEXT NOT NULL,
    quantity BIGINT NOT NULL,
    reason TEXT NOT NULL DEFAULT('EXPIRED'),
    writeoff_at TIMESTAMPTZ,
    writeoff_by TEXT NOT NULL,
    CONSTRAINT write_expiry_record_id
            FOREIGN KEY(expiry_record_id)
            REFERENCES expiry_record(id)
            ON DELETE RESTRICT,
    CONSTRAINT write_off_by_user
                FOREIGN KEY(writeoff_by)
                REFERENCES app_user(id)
                ON DELETE RESTRICT,
    CONSTRAINT write_off_quantity_minimum
        CHECK(quantity > 0),
    CONSTRAINT chk_reason
            CHECK(reason in ('EXPIRED','DAMAGED','STAFF_MEAL'))
);

CREATE INDEX idx_product_expiry_date
    ON expiry_record(expiry_date ASC, product_id);