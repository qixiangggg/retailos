ALTER TABLE app_user
ADD CONSTRAINT username_unique UNIQUE(username);

ALTER TABLE app_user DROP CONSTRAINT IF EXISTS app_user_name_key;

ALTER TABLE writeoff
ALTER COLUMN writeoff_at SET DEFAULT now();

ALTER TABLE writeoff
ALTER COLUMN writeoff_at SET NOT NULL;