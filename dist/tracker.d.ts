/// <reference types="google.analytics" />
export declare type GoogleAnalyticsHitType = "pageview" | "screenview" | "event" | "transaction" | "item" | "social" | "exception" | "timing";
export declare class GoogleAnalyticsTracker {
    static analyticsUrl: string;
    /**
     * List of hits, that are to be sent in batch session.
     * When undefined, batch is disabled.
     */
    private static batchQueue;
    /**
     * Starts sending hits in batch mode. In order to send hits you have to
     * either call endBatch() or flushBatch().
     */
    static startBatch(): void;
    /**
     * Send hits, that are waiting in batch queue. Batch queue is cleared but
     * batch mode is still enabled.
     */
    static flushBatch(): void;
    /**
     * Send hits, that are waiting in batch queue and disables batch mode.
     */
    static endBatch(): void;
    /**
     * Implementation of GA sentHitTask. If batch mode is enabled, task is added to
     * batch queue.
     */
    private static sendHitTask(model);
    private static sendHits(hits?);
    private static pushOfflineHits(hits);
    private static pullOfflineHits();
    private static chunkArray(arr, len);
    private static load();
    /**
     * Creates new tracker instance for given id/name.
     *
     * @param id Tracking id (UA-XXXXX-Y).
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#trackingId.
     */
    static newTracker(id: string, fields?: UniversalAnalytics.FieldsObject): Promise<GoogleAnalyticsTracker>;
    static getTracker(id: string, name?: string): GoogleAnalyticsTracker;
    private constructor();
    readonly tracker: UniversalAnalytics.Tracker;
    send(hitType: GoogleAnalyticsHitType, fields: {}): this;
}
