/// <reference types="google.analytics" />
import { GoogleAnalyticsHitType } from "./hit-type";
import { GoogleAnalyticsService } from "./service";
export declare class GoogleAnalyticsTracker {
    readonly service: GoogleAnalyticsService;
    /**
     * Creates new tracker instance for given id/name.
     *
     * @param id Tracking id (UA-XXXXX-Y).
     * @param fields Tracking settings.
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference.
     */
    static newTracker(id: string, fields?: UniversalAnalytics.FieldsObject, service?: GoogleAnalyticsService): Promise<GoogleAnalyticsTracker>;
    constructor(service: GoogleAnalyticsService, id: string, fields?: UniversalAnalytics.FieldsObject);
    private readonly tracker;
    send(hitType: GoogleAnalyticsHitType, fields: {}): this;
    flush(): void;
}
