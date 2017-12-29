//https://www.simoahava.com/analytics/track-users-who-are-offline-in-google-analytics

const trackers: {[trackerName: string]: GoogleAnalyticsTracker} = {};

export type HitType = "pageview" | "screenview" | "event" | "transaction" | "item" | "social" | "exception" | "timing";

export class GoogleAnalyticsTracker {

    static analyticsUrl = "https://www.google-analytics.com/analytics.js";

    /**
     * Creates new tracker instance for given id/name.
     * @param id Tracking id (UA-XXXXX-Y). 
     * 
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#trackingId.
     */
    static async tracker(id: string, fields?: UniversalAnalytics.FieldsObject): Promise<GoogleAnalyticsTracker> {
        await GoogleAnalyticsTracker.load();

        let instance = trackers[name || id];
        if (instance) {
            return instance;
        }

        return trackers[name || id] = new GoogleAnalyticsTracker(id, Object.assign({}, {name: id}, fields));
    }

    private static load(): Promise<void> {

        return new Promise((resolve, reject) => {
            if (!window["GoogleAnalyticsObject"]) {

                let script: HTMLScriptElement = document.createElement("script");
                script.src = GoogleAnalyticsTracker.analyticsUrl;
                script.onload = () => {
                    resolve();
                };

                let sibling = document.getElementsByTagName("script")[0];
                sibling.parentNode.insertBefore(script, sibling);

            } else {
                resolve();
            }
        });
    }

    private constructor(id: string, fields?: UniversalAnalytics.FieldsObject) {
        this.tracker = ga.create(id, fields);
        this.tracker.set("customTask", offlineTracking);
    }

    private readonly tracker: UniversalAnalytics.Tracker;

    send(hitType: HitType, fieldsObject: {}): void;

    send(hitType: HitType, ...fields: any[]): void {
        this.tracker.send(hitType, fields);
    }

}

function offlineTracking(customTaskModel: UniversalAnalytics.Model) {

    let sendHitTask: Function = customTaskModel.get("sendHitTask");

    customTaskModel.set("sendHitTask", function(model: UniversalAnalytics.Model) {

        // let's send the original hit using the native functionality
        sendHitTask(model);

        // grab the hit Payload
        let payload = model.get("hitPayload");

        // check if GA endpoint is ready
        let http = new XMLHttpRequest();
        http.open("HEAD", "https://www.google-analytics.com/collect");

        http.onreadystatechange = function() {

            // google analytics endpoint is not reachable, let's save the hit
            if (this.readyState === this.DONE && this.status !== 200) {
                pushOfflineHit(payload + "&qt;=" + Date.now());

            } else {
                sendOfflineHits();
            }
        };
        http.send();
    });
}

function sendOfflineHits() {

    if (countOfflineHits()) {

        // process hits in queue
        let now = Date.now() / 1000;

        // let's loop thru the chunks array and send the hits to GA
        for (let hits of offlineHits()) {

            let xhr = new XMLHttpRequest();
            xhr.open("POST", "https://www.google-analytics.com/batch", true);

            let payload: string[] = [];
            for (let hit of hits) {
                if (hit.indexOf("&qt;=") > -1) {
                    payload.push(hit.replace(/qt=([^&]*)/, "qt=" + Math.round(now - parseInt(hit.match(/qt=([^&]*)/)[1]) / 1000) * 1000));
                } else {
                    payload.push(hit);
                }
            }

            xhr.onload = () => {
                clearOfflineHits();
            }

            xhr.send(payload.join("\n"));
        }
    }
    
}

function pushOfflineHit(hit: string) {
}

function countOfflineHits(): number {
    return 0;
}

// batch endpoint only allows 20 hits per batch, let's chunk the hits array
function offlineHits(): string[][] {
    return [];
}

function clearOfflineHits() {

}

function chunkArray(arr: any[], len: number) {

    let chunks = [];
    let i = 0;
    let n = arr.length;

    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }

    return chunks;
}