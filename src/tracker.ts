//https://www.simoahava.com/analytics/track-users-who-are-offline-in-google-analytics
import {GoogleAnalyticsHitType} from "./hit-type";
import {GoogleAnalyticsService} from "./service";

export class GoogleAnalyticsTracker {

    /**
     * Creates new tracker instance for given id/name.
     * 
     * @param id Tracking id (UA-XXXXX-Y).
     * @param fields Tracking settings.
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference.
     */
    static async newTracker(id: string, fields?: UniversalAnalytics.FieldsObject, service?: GoogleAnalyticsService): Promise<GoogleAnalyticsTracker> {
        if (!service) {
            service = new GoogleAnalyticsService();
        }

        return new GoogleAnalyticsTracker(service, id, fields);
    }

    constructor(public readonly service: GoogleAnalyticsService, id: string, fields?: UniversalAnalytics.FieldsObject) {
        this.tracker = ga.create(id, fields);
        this.tracker.set(fields);
        this.tracker.set("sendHitTask", (model) => service.sendHitTask(model));
    }

    private readonly tracker: UniversalAnalytics.Tracker;

    send(hitType: GoogleAnalyticsHitType, fields: {}): this {
        this.tracker.send(hitType, fields);
        return this;
    }

    flush() {
        this.service.flushBatch();
    }

}