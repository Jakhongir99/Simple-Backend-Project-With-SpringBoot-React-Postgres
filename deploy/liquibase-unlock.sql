-- Run if backend hangs on "Waiting for changelog lock..."
-- psql -U postgres -d crud_demo -f deploy/liquibase-unlock.sql

UPDATE databasechangeloglock
SET locked = false,
    lockgranted = NULL,
    lockedby = NULL
WHERE id = 1;
