//https://www.simoahava.com/analytics/track-users-who-are-offline-in-google-analytics

const trackers: {[trackerName: string]: GoogleAnalyticsTracker} = {};

const offlineStorageKey = "googleAnalytics.offlineHits";

export type GoogleAnalyticsHitType = "pageview" | "screenview" | "event" | "transaction" | "item" | "social" | "exception" | "timing";

export class GoogleAnalyticsTracker {

    static analyticsUrl = "https://www.google-analytics.com/analytics.js";

    /**
     * List of hits, that are to be sent in batch session. 
     * When undefined, batch is disabled.
     */
    private static batchQueue: string[];

    /**
     * Starts sending hits in batch mode. In order to send hits you have to 
     * either call endBatch() or flushBatch().
     */
    public static startBatch() {
        if (!this.batchQueue) {
            this.batchQueue = [];
        }
    }
    
    /**
     * Send hits, that are waiting in batch queue. Batch queue is cleared but
     * batch mode is still enabled.
     */
    public static flushBatch() {
        if (this.batchQueue) {
            this.sendHits(this.batchQueue);
            this.batchQueue = [];
        }
    }

    /**
     * Send hits, that are waiting in batch queue and disables batch mode.
     */
    public static endBatch() {
        if (this.batchQueue) {
            this.sendHits(this.batchQueue);
            this.batchQueue = undefined;
        }
    }


    /**
     * Implementation of GA sentHitTask. If batch mode is enabled, task is added to 
     * batch queue.
     */
    private static sendHitTask(model: UniversalAnalytics.Model) {
        if (this.batchQueue) {
            this.batchQueue.push(model.get("hitPayload"));
        } else {
            this.sendHits([model.get("hitPayload")]);
        }
    }

    private static sendHits(hits?: string[]) {

        let now = Date.now();

        let allHits = this.pullOfflineHits();
        for (let h of hits) {

            if (h.indexOf("&tmpts=") < 0) {
                h += "&tmpts=" + now;
            }

            allHits.push(h);
        }

        let chunkedHits = this.chunkArray(allHits, 10);
        let sendingChunk = 0;

        let sendBatch = (batchHits: string[]) => {

            let http = new XMLHttpRequest();
            http.open("POST", "https://www.google-analytics.com/batch", true);

            http.onreadystatechange = () => {

                if (http.readyState === http.DONE) {

                    if (http.status !== 200) {
                        this.pushOfflineHits(batchHits);
                    }

                    if (chunkedHits.length - 1 > sendingChunk) {
                        sendingChunk++;
                        sendBatch(chunkedHits[sendingChunk]);
                    }
                }
            };

            let httpPayload: string[] = [];

            for (let h of batchHits) {
                if (h.indexOf("&tmpts=") > -1) {
                    let t = Math.round(now - parseInt(h.match(/tmpts=([^&]*)/)[1]));
                    h = h.replace(/tmpts=([^&]*)/, t > 0 ? "qt=" + t : "");
                    if (t > 10000) {
                        h += "&cm1=" + Math.round(t / 1000);
                    }
                    httpPayload.push(h);
                } else {
                    httpPayload.push(h);
                }
            }

            http.send(httpPayload.join("\n"));
        };

        sendBatch(chunkedHits[0]);
    }

    private static pushOfflineHits(hits: string[]) {

        let offline: string[] = JSON.parse(window.localStorage.getItem(offlineStorageKey) || "[]");
        offline = offline.concat(hits);

        window.localStorage.setItem(offlineStorageKey, JSON.stringify(offline));
    }

    private static pullOfflineHits(): string[] {
        let hits = JSON.parse(window.localStorage.getItem(offlineStorageKey) || "[]");
        window.localStorage.removeItem(offlineStorageKey);
        return hits;
    }

    private static chunkArray(arr: any[], len: number) {

        let chunks = [];
        let i = 0;
        let n = arr.length;

        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }

        return chunks;
    }

    private static load(): Promise<void> {

        return new Promise((resolve, reject) => {
            if (!window["GoogleAnalyticsObject"]) {

                let script: HTMLScriptElement = document.createElement("script");
                script.src = this.analyticsUrl;
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


    /**
     * Creates new tracker instance for given id/name.
     * 
     * @param id Tracking id (UA-XXXXX-Y). 
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#trackingId.
     */
    static async newTracker(id: string, fields?: UniversalAnalytics.FieldsObject): Promise<GoogleAnalyticsTracker> {
        await this.load();

        let instanceId = (fields && fields.name) || id;

        if (trackers[instanceId]) {
            throw new Error("Tracker " + instanceId + " already exists");
        }

        return trackers[instanceId] = new GoogleAnalyticsTracker(id, Object.assign({}, {name: id}, fields));
    }

    static getTracker(id: string, name?: string) {
        let tracker = trackers[name || id];
        
        if (!tracker) {
            throw new Error("Tracker " + (name || id) + " not exists");
        }

        return tracker;
    }

    private constructor(id: string, fields?: UniversalAnalytics.FieldsObject) {
        this.tracker = ga.create(id, fields);
        this.tracker.set(fields);
        this.tracker.set("sendHitTask", (model) => GoogleAnalyticsTracker.sendHitTask(model));
    }

    readonly tracker: UniversalAnalytics.Tracker;

    send(hitType: GoogleAnalyticsHitType, fields: {}): this {
        this.tracker.send(hitType, fields);
        return this;
    }

}