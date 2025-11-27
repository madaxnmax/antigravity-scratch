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

        let finalThreadId = message.thread_id;
        let messageToUpsert = { ...message };

        // --- Deduplication & Merging Logic ---

        // 1. Check for existing message by internet_message_id
        if (message.internet_message_id) {
            const { data: existingMessage } = await this.supabase
                .from('messages')
                .select('id, thread_id')
                .eq('internet_message_id', message.internet_message_id)
                .single();

            if (existingMessage) {
                // Message exists!
                // Use the existing ID to update it (deduplication)
                messageToUpsert.id = existingMessage.id;

                // Check if threads need merging
                if (existingMessage.thread_id !== finalThreadId) {
                    logger.info(`DatabaseService: Duplicate message found. Merging thread ${finalThreadId} into ${existingMessage.thread_id}`);
                    await this.mergeThreads(finalThreadId, existingMessage.thread_id);
                    finalThreadId = existingMessage.thread_id;
                }
            } else {
                // Message does not exist, but check if it's a reply to an existing message (Threading via Headers)
                // Message does not exist, but check if it's a reply to an existing message (Threading via Headers)
                let parentMessage = null;

                // A. Check In-Reply-To
                if (message.in_reply_to) {
                    const { data } = await this.supabase
                        .from('messages')
                        .select('thread_id')
                        .eq('internet_message_id', message.in_reply_to)
                        .single();
                    if (data) parentMessage = data;
                }

                // B. Check References (if In-Reply-To didn't yield a result)
                if (!parentMessage && message.references) {
                    // References is a space-separated list of IDs, e.g. "<msg1> <msg2>"
                    // We need to clean them and check if ANY exist.
                    // Note: Supabase/Postgres 'in' query works with arrays.
                    const refs = message.references.split(/\s+/).map(r => r.trim()).filter(r => r.length > 0);

                    if (refs.length > 0) {
                        const { data } = await this.supabase
                            .from('messages')
                            .select('thread_id')
                            .in('internet_message_id', refs)
                            .limit(1) // Just need one match to link the thread
                            .maybeSingle();

                        if (data) parentMessage = data;
                    }
                }

                if (parentMessage) {
                    // Found parent! Ensure we are in the same thread.
                    if (parentMessage.thread_id !== finalThreadId) {
                        logger.info(`DatabaseService: Thread link detected via Headers. Merging thread ${finalThreadId} into parent thread ${parentMessage.thread_id}`);
                        await this.mergeThreads(finalThreadId, parentMessage.thread_id);
                        finalThreadId = parentMessage.thread_id;
                    }
                }
            }
        }

        // Update the thread_id in the message object before upserting
        messageToUpsert.thread_id = finalThreadId;

        const { error } = await this.supabase
            .from('messages')
            .upsert({
                id: messageToUpsert.id,
                thread_id: messageToUpsert.thread_id,
                subject: messageToUpsert.subject,
                body: messageToUpsert.body,
                "from": messageToUpsert.from,
                "to": messageToUpsert.to,
                cc: messageToUpsert.cc,
                date: messageToUpsert.date,
                created_at: new Date(messageToUpsert.date * 1000),
                internet_message_id: messageToUpsert.internet_message_id,
                in_reply_to: messageToUpsert.in_reply_to,
                "references": messageToUpsert.references
            }, { onConflict: 'id' });

        if (error) {
            logger.error('DatabaseService: Failed to upsert message', { error, messageId: messageToUpsert.id });
            throw error;
        }
    }

    async mergeThreads(sourceThreadId, targetThreadId) {
        if (!this.supabase || sourceThreadId === targetThreadId) return;

        logger.info(`DatabaseService: Merging thread ${sourceThreadId} INTO ${targetThreadId}`);

        // 1. Move all messages from source to target
        const { error: moveError } = await this.supabase
            .from('messages')
            .update({ thread_id: targetThreadId })
            .eq('thread_id', sourceThreadId);

        if (moveError) {
            logger.error(`DatabaseService: Failed to move messages from ${sourceThreadId} to ${targetThreadId}`, moveError);
            throw moveError;
        }

        // 2. Delete the source thread
        // Note: We might want to merge tags/participants before deleting, but for now we assume target is canonical or will be updated by sync.
        // Actually, let's try to merge tags if possible, but simple deletion is safer to avoid conflicts for now.
        // The sync service usually updates the thread metadata anyway.
        const { error: deleteError } = await this.supabase
            .from('threads')
            .delete()
            .eq('id', sourceThreadId);

        if (deleteError) {
            logger.error(`DatabaseService: Failed to delete source thread ${sourceThreadId}`, deleteError);
            // Not fatal, but messy
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

    // --- Materials ---
    async getMaterials(type) {
        if (!this.supabase) return [];
        let query = this.supabase.from('materials').select('*');
        if (type) {
            query = query.eq('type', type);
        }
        const { data, error } = await query;
        if (error) {
            logger.error('DatabaseService: Failed to get materials', error);
            throw error;
        }
        return data;
    }

    async upsertMaterials(materials) {
        if (!this.supabase || !materials.length) return;

        // Supabase upsert works in batches
        const { error } = await this.supabase
            .from('materials')
            .upsert(materials, { onConflict: 'id' }); // Assuming ID is preserved or we want to update by ID. 
        // If we want to replace based on SKU/Type, we might need a different conflict target, but ID is safest for now.
        // For import, if we don't have IDs, we might be creating new rows. 
        // If the user wants to "Update" existing items by SKU, we'd need a unique constraint on SKU+Type.
        // For now, let's assume imports might be new items or updates if ID is provided.

        if (error) {
            logger.error('DatabaseService: Failed to upsert materials', error);
            throw error;
        }
    }

    async deleteAllMaterials(type) {
        if (!this.supabase) return;
        const { error } = await this.supabase
            .from('materials')
            .delete()
            .eq('type', type);

        if (error) {
            logger.error('DatabaseService: Failed to delete materials', error);
            throw error;
        }
    }
}

module.exports = new DatabaseService();
