const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');

class DatabaseService {
    constructor() {
        this.supabase = null;
        this.init();
    }

    init() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        if (supabaseUrl && supabaseKey) {
            this.supabase = createClient(supabaseUrl, supabaseKey);
            logger.info('DatabaseService: Supabase client initialized');
        } else {
            logger.warn('DatabaseService: Supabase credentials missing');
        }
    }

    async upsertThread(thread) {
        if (!this.supabase) return null;

        // Prepare object, conditionally adding status if provided
        const threadData = {
            id: thread.id,
            subject: thread.subject,
            snippet: thread.snippet,
            last_message_timestamp: thread.last_message_timestamp,
            unread: thread.unread,
            participants: thread.participants,
            tags: thread.tags || [],
            updated_at: new Date()
        };

        if (thread.status) {
            threadData.status = thread.status;
        }

        const { error } = await this.supabase
            .from('threads')
            .upsert(threadData, { onConflict: 'id' });

        if (error) {
            logger.error('DatabaseService: Failed to upsert thread', { error, threadId: thread.id });
            throw error;
        }
    }

    async updateThreadStatus(threadId, status) {
        if (!this.supabase) return null;

        const { error } = await this.supabase
            .from('threads')
            .update({ status: status })
            .eq('id', threadId);

        if (error) {
            logger.error('DatabaseService: Failed to update thread status', { error, threadId });
            throw error;
        }
    }

    async upsertMessage(message) {
        if (!this.supabase) return null;

        const { error } = await this.supabase
            .from('messages')
            .upsert({
                id: message.id,
                thread_id: message.thread_id,
                subject: message.subject,
                body: message.body,
                "from": message.from,
                "to": message.to,
                cc: message.cc,
                date: message.date,
                created_at: new Date(message.date * 1000) // Ensure creation time matches message time
            }, { onConflict: 'id' });

        if (error) {
            logger.error('DatabaseService: Failed to upsert message', { error, messageId: message.id });
            throw error;
        }
    }

    async getThreads(limit = 50, offset = 0, status = null) {
        if (!this.supabase) return [];

        let query = this.supabase
            .from('threads')
            .select('*')
            .order('last_message_timestamp', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('status', status);
        } else {
            // Default behavior: if no status requested, maybe return all? 
            // Or should we default to 'inbox'? 
            // For now, let's return all if null, but the frontend will likely request 'inbox'.
        }

        const { data, error } = await query;

        if (error) {
            logger.error('DatabaseService: Failed to fetch threads', error);
            throw error;
        }
        return data;
    }

    async getMessages(threadId) {
        if (!this.supabase) return [];

        const { data, error } = await this.supabase
            .from('messages')
            .select('*')
            .eq('thread_id', threadId)
            .order('date', { ascending: true });

        if (error) {
            logger.error('DatabaseService: Failed to fetch messages', { error, threadId });
            throw error;
        }
        return data;
    }
}

module.exports = new DatabaseService();
