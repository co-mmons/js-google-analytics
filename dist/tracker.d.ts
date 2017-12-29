/// <reference types="google.analytics" />
export declare type HitType = "pageview" | "screenview" | "event" | "transaction" | "item" | "social" | "exception" | "timing";
export declare class GoogleAnalyticsTracker {
    static analyticsUrl: string;
    /**
     * Creates new tracker instance for given id/name.
     * @param id Tracking id (UA-XXXXX-Y).
     *
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#trackingId.
     */
    static tracker(id: string, fields?: UniversalAnalytics.FieldsObject): Promise<GoogleAnalyticsTracker>;
    private static load();
    private constructor();
    private readonly tracker;
    send(hitType: HitType, fieldsObject: {}): void;
}
