ALTER TABLE messages ADD COLUMN IF NOT EXISTS internet_message_id TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS in_reply_to TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "references" TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_internet_message_id ON messages(internet_message_id);
