const nylas = require('nylas');
const db = require('./db');
const logger = require('./logger');

class SyncService {
    constructor() {
        this.nylas = null;
        this.init();
    }

    init() {
        const nylasApiKey = process.env.NYLAS_API_KEY;
        if (nylasApiKey) {
            this.nylas = new nylas({ apiKey: nylasApiKey });
            logger.info('SyncService: Nylas client initialized');
        } else {
            logger.warn('SyncService: Nylas credentials missing');
        }
    }

    async syncThreads(grantId, limit = 50) {
        if (!this.nylas) return;

        try {
            logger.info(`SyncService: Syncing threads for grant ${grantId}...`);
            const threads = await this.nylas.threads.list({
                identifier: grantId,
                queryParams: { limit }
            });

            logger.info(`SyncService: Fetched ${threads.data.length} threads. Subjects: ${threads.data.map(t => t.subject).join(', ')}`);

            for (const thread of threads.data) {
                await db.upsertThread({
                    id: thread.id,
                    subject: thread.subject,
                    snippet: thread.snippet,
                    last_message_timestamp: thread.latestMessageReceivedDate || thread.date, // Fix: Use correct field
                    unread: thread.unread,
                    participants: thread.participants,
                    tags: [] // Nylas v3 doesn't have tags on thread object directly in same way, or we need to fetch folders. Keeping simple for now.
                });

                // Sync messages for this thread immediately
                await this.syncMessages(grantId, thread.id);
            }
            logger.info(`SyncService: Synced ${threads.data.length} threads.`);
        } catch (error) {
            logger.error('SyncService: Error syncing threads', error);
            throw error;
        }
    }

    async syncMessages(grantId, threadId) {
        if (!this.nylas) return;

        try {
            const messages = await this.nylas.messages.list({
                identifier: grantId,
                queryParams: { threadId }
            });

            for (const message of messages.data) {
                await db.upsertMessage({
                    id: message.id,
                    thread_id: threadId,
                    subject: message.subject,
                    body: message.body,
                    from: message.from,
                    to: message.to,
                    cc: message.cc,
                    date: message.date
                });
            }
        } catch (error) {
            logger.error(`SyncService: Error syncing messages for thread ${threadId}`, error);
        }
    }
}

module.exports = new SyncService();
