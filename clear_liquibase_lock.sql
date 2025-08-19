-- Clear Liquibase lock to fix startup issue
DELETE FROM public.databasechangeloglock WHERE locked = true;
UPDATE public.databasechangeloglock SET locked = false, lockgranted = null, lockedby = null;
