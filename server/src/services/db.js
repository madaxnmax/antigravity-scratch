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

        if (typeof thread.is_new !== 'undefined') {
            threadData.is_new = thread.is_new;
        }

        if (thread.channel) {
            threadData.channel = thread.channel;
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

        logger.info(`DatabaseService: Updating thread ${threadId} status to ${status}`);

        const { error } = await this.supabase
            .from('threads')
            .update({ status: status })
            .eq('id', threadId);

        if (error) {
            logger.error('DatabaseService: Failed to update thread status', { error, threadId });
            throw error;
        }
    }

    async updateThreadIsNew(threadId, isNew) {
        if (!this.supabase) return null;

        logger.info(`DatabaseService: Updating thread ${threadId} is_new to ${isNew}`);

        const { error } = await this.supabase
            .from('threads')
            .update({ is_new: isNew })
            .eq('id', threadId);

        if (error) {
            logger.error('DatabaseService: Failed to update thread is_new', { error, threadId });
            throw error;
        }
    }

    async updateThreadChannel(threadId, channel) {
        if (!this.supabase) return null;

        logger.info(`DatabaseService: Updating thread ${threadId} channel to ${channel}`);

        const { error } = await this.supabase
            .from('threads')
            .update({ channel: channel })
            .eq('id', threadId);

        if (error) {
            logger.error('DatabaseService: Failed to update thread channel', { error, threadId });
            throw error;
        }
    }

    async updateThreadDraft(threadId, draft) {
        if (!this.supabase) return null;

        // logger.info(`DatabaseService: Updating thread ${threadId} draft`); // Commented out to reduce noise

        const { error } = await this.supabase
            .from('threads')
            .update({ draft: draft })
            .eq('id', threadId);

        if (error) {
            logger.error('DatabaseService: Failed to update thread draft', { error, threadId });
            throw error;
        }
    }

    async getNewThreadCount(channel = 'Inbox') {
        if (!this.supabase) return 0;

        let query = this.supabase
            .from('threads')
            .select('*', { count: 'exact', head: true })
            .eq('is_new', true)
            .or('status.eq.inbox,status.eq.Open,status.is.null'); // Only count new threads in inbox

        if (channel) {
            if (channel === 'Inbox') {
                query = query.or('channel.eq.Inbox,channel.is.null');
            } else {
                query = query.eq('channel', channel);
            }
        }

        const { count, error } = await query;

        if (error) {
            logger.error('DatabaseService: Failed to get new thread count', error);
            return 0;
        }
        return count;
    }

    async upsertMessage(message) {
        if (!this.supabase) return null;

        // Deduplication Logic:
        // 1. If internet_message_id is present, check if it exists.
        if (message.internet_message_id) {
            const { data: existing } = await this.supabase
                .from('messages')
                .select('id, thread_id')
                .eq('internet_message_id', message.internet_message_id)
                .single();

            if (existing) {
                // Message exists.
                // If thread_id matches, we can update it (or skip).
                // If thread_id differs, we have a conflict.
                // Spec says: "If two messages have identical message_id or internet_message_id, treat them as the same message"
                // We will update the existing message to ensure we have the latest metadata, but we keep the original ID to avoid breaking references.
                // However, if the new message has a DIFFERENT thread_id, we might want to update the thread_id if the new one is "more canonical" (e.g. from a newer sync).
                // For now, we'll just update the existing record with the new details, effectively merging them.

                // Note: We use the EXISTING ID for the update to ensure we overwrite the correct row.
                message.id = existing.id;
            }
        }

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
                created_at: new Date(message.date * 1000),
                internet_message_id: message.internet_message_id,
                in_reply_to: message.in_reply_to,
                "references": message.references
            }, { onConflict: 'id' });

        if (error) {
            logger.error('DatabaseService: Failed to upsert message', { error, messageId: message.id });
            throw error;
        }
    }

    async getThreads(limit = 50, offset = 0, status = null, channel = null) {
        if (!this.supabase) return [];

        logger.info(`DatabaseService: getThreads called with status=${status}, channel=${channel}`);

        let query = this.supabase
            .from('threads')
            .select('*')
            .order('last_message_timestamp', { ascending: false })
            .range(offset, offset + limit - 1);

        // Simplified Filtering Logic
        if (channel === 'Sent') {
            // Filter by tags containing 'sent' or 'Sent'
            // Note: Supabase 'cs' operator checks if array contains value.
            // We'll check for both common cases.
            query = query.or('tags.cs.{Sent},tags.cs.{sent},tags.cs.{SENT}');
        } else if (channel && channel !== 'Inbox') {
            // Case 1: Specific Channel (e.g. 'Sales', 'Logistics')
            // Show all threads in this channel that aren't deleted/spam
            query = query.eq('channel', channel).neq('status', 'trash').neq('status', 'spam');
        } else if (status && status !== 'inbox') {
            // Case 2: Specific Status (e.g. 'done', 'trash', 'spam')
            // Show threads with this status, regardless of channel (unless we want to restrict, but usually 'Done' is global)
            query = query.eq('status', status);
        } else {
            // Case 3: Inbox (Default)
            // Show threads with inbox-like status AND (in Inbox channel OR no channel)
            query = query.or('status.eq.inbox,status.eq.Open,status.is.null');
            query = query.or('channel.eq.Inbox,channel.is.null');
        }

        const { data, error } = await query;

        if (error) {
            logger.error('DatabaseService: Failed to fetch threads', error);
            throw error;
        }
        logger.info(`DatabaseService: Fetched ${data.length} threads`);
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

    // --- Teammates ---
    async getTeammates() {
        if (!this.supabase) return [];
        const { data, error } = await this.supabase.from('teammates').select('*').order('name');
        if (error) {
            logger.error('DatabaseService: Failed to get teammates', error);
            throw error;
        }
        return data;
    }

    async createTeammate(teammate) {
        if (!this.supabase) return null;
        const { data, error } = await this.supabase.from('teammates').insert(teammate).select();
        if (error) {
            logger.error('DatabaseService: Failed to create teammate', error);
            throw error;
        }
        return data[0];
    }

    // --- Tags ---
    async getTags() {
        if (!this.supabase) return [];
        const { data, error } = await this.supabase.from('tags').select('*').order('name');
        if (error) {
            logger.error('DatabaseService: Failed to get tags', error);
            throw error;
        }
        return data;
    }

    async createTag(tag) {
        if (!this.supabase) return null;
        const { data, error } = await this.supabase.from('tags').insert(tag).select();
        if (error) {
            logger.error('DatabaseService: Failed to create tag', error);
            throw error;
        }
        return data[0];
    }

    async updateTag(id, updates) {
        if (!this.supabase) return null;
        const { data, error } = await this.supabase.from('tags').update(updates).eq('id', id).select();
        if (error) {
            logger.error('DatabaseService: Failed to update tag', error);
            throw error;
        }
        return data[0];
    }

    async deleteTag(id) {
        if (!this.supabase) return null;
        const { error } = await this.supabase.from('tags').delete().eq('id', id);
        if (error) {
            logger.error('DatabaseService: Failed to delete tag', error);
            throw error;
        }
    }
}

module.exports = new DatabaseService();
