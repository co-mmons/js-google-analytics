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

        fields = Object.assign({}, fields, {cookieDomain: window.location.protocol.indexOf("file") > -1 ? "none" : "auto"});
        
        // cookies disabled
        if (fields.cookieDomain == "none") {
            fields["storage"] = "none";

            if (!fields.clientId && window.localStorage) {
                fields.clientId = window.localStorage.getItem("ga:clientId");

                ga((tracker) => {
                    window.localStorage.setItem("ga:clientId", tracker.get("clientId"));
                });
            }
        }

        this.tracker = ga.create(id, fields);
        this.tracker.set(fields);
        this.tracker.set("checkProtocolTask", () => null);
        this.tracker.set("sendHitTask", (model) => service.sendHitTask(model));

        this.name = fields.name;
    }

    public readonly name: string;

    private readonly tracker: UniversalAnalytics.Tracker;

    pluginRequire(plugin: string) {
        ga(this.name + ".require", plugin);
    }

    pluginCall(plugin: string, method: string, callArgs?: any) {
        ga(this.name + "." + plugin + ":" + method, callArgs);
    }

    send(hitType: GoogleAnalyticsHitType, fields: {}): this {
        // console.log("send " + hitType);
        // console.log(this.tracker);
        this.tracker.send(hitType, fields);
        return this;
    }

    flush() {
        this.service.flushBatch();
    }

    get(fieldName: string): any {
        return this.tracker.get(fieldName);
    }

    set(fieldName: string, fieldValue: any) {
        this.tracker.set(fieldName, fieldValue);
    }

}