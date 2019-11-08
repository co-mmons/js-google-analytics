/// <reference types="google.analytics" />
import { GoogleAnalyticsTracker } from "./tracker";
export declare class GoogleAnalyticsService {
    static analyticsUrl: string;
    static load(): Promise<void>;
    private trackers;
    /**
     * List of hits, that are to be sent in batch session.
     * When undefined, batch is disabled.
     */
    private batchQueue;
    /**
     * Starts sending hits in batch mode. In order to send hits you have to
     * either call endBatch() or flushBatch().
     */
    startBatch(): void;
    /**
     * Send hits, that are waiting in batch queue. Batch queue is cleared but
     * batch mode is still enabled.
     */
    flushBatch(): void;
    /**
     * Send hits, that are waiting in batch queue and disables batch mode.
     */
    endBatch(): void;
    /**
     * Implementation of GA sentHitTask. If batch mode is enabled, task is added to
     * batch queue.
     */
    sendHitTask(model: UniversalAnalytics.Model): void;
    private sendHits;
    private pushOfflineHits;
    private pullOfflineHits;
    private chunkArray;
    private static trackerName;
    /**
     * Creates new tracker instance for given id/name.
     *
     * @param id Tracking id (UA-XXXXX-Y).
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#trackingId.
     */
    newTracker(id: string, fields?: UniversalAnalytics.FieldsObject): Promise<GoogleAnalyticsTracker>;
    getTracker(id: string, name?: string): GoogleAnalyticsTracker;
}
