//https://www.simoahava.com/analytics/track-users-who-are-offline-in-google-analytics

import {GoogleAnalyticsHitType} from "./hit-type";
import {GoogleAnalyticsTracker} from "./tracker";

const offlineStorageKey = "googleAnalytics.offlineHits";

export class GoogleAnalyticsService {

    static analyticsUrl = "https://www.google-analytics.com/analytics.js";

    static load(): Promise<void> {

        return new Promise((resolve, reject) => {
            if (!window["ga"]) {

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


    private trackers: {[trackerName: string]: GoogleAnalyticsTracker} = {};

    /**
     * List of hits, that are to be sent in batch session. 
     * When undefined, batch is disabled.
     */
    private batchQueue: string[];

    /**
     * Starts sending hits in batch mode. In order to send hits you have to 
     * either call endBatch() or flushBatch().
     */
    public startBatch() {
        if (!this.batchQueue) {
            this.batchQueue = [];
        }
    }
    
    /**
     * Send hits, that are waiting in batch queue. Batch queue is cleared but
     * batch mode is still enabled.
     */
    public flushBatch() {
        if (this.batchQueue) {
            // console.log("batch queue");
            // console.log(this.batchQueue);
            this.sendHits(this.batchQueue);
            this.batchQueue = [];
        }
    }

    /**
     * Send hits, that are waiting in batch queue and disables batch mode.
     */
    public endBatch() {
        if (this.batchQueue) {
            this.sendHits(this.batchQueue);
            this.batchQueue = undefined;
        }
    }


    /**
     * Implementation of GA sentHitTask. If batch mode is enabled, task is added to 
     * batch queue.
     */
    sendHitTask(model: UniversalAnalytics.Model) {
        // console.log("send hit task");
        // console.log(model.get("hitPayload"));
        if (this.batchQueue) {
            this.batchQueue.push(model.get("hitPayload"));
        } else {
            this.sendHits([model.get("hitPayload")]);
        }
    }

    private sendHits(hits?: string[]) {

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
            // console.log("send batch");
            // console.log(batchHits);

            let http = new XMLHttpRequest();
            http.open("POST", "https://www.google-analytics.com/batch", true);

            http.onreadystatechange = () => {

                if (http.readyState === http.DONE) {

                    if (http.status !== 200) {
                        this.pushOfflineHits(batchHits);
                    }

                    if (chunkedHits.length - 1 > sendingChunk) {
                        sendBatch(chunkedHits[++sendingChunk]);
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

    private pushOfflineHits(hits: string[]) {

        let offline: string[] = JSON.parse(window.localStorage.getItem(offlineStorageKey) || "[]");
        offline = offline.concat(hits);

        window.localStorage.setItem(offlineStorageKey, JSON.stringify(offline));
    }

    private pullOfflineHits(): string[] {
        let hits = JSON.parse(window.localStorage.getItem(offlineStorageKey) || "[]");
        window.localStorage.removeItem(offlineStorageKey);
        return hits;
    }

    private chunkArray(arr: any[], len: number) {

        let chunks = [];
        let i = 0;
        let n = arr.length;

        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }

        return chunks;
    }


    private static trackerName(id: string) {
        return id.replace(/\-/g, "");
    }

    /**
     * Creates new tracker instance for given id/name.
     * 
     * @param id Tracking id (UA-XXXXX-Y). 
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#trackingId.
     */
    async newTracker(id: string, fields?: UniversalAnalytics.FieldsObject): Promise<GoogleAnalyticsTracker> {
        await GoogleAnalyticsService.load();

        let instanceId = (fields && fields.name) || GoogleAnalyticsService.trackerName(id);

        if (this.trackers[instanceId]) {
            throw new Error("Tracker " + instanceId + " already exists");
        }

        return this.trackers[instanceId] = (await GoogleAnalyticsTracker.newTracker(id, Object.assign({}, {name: GoogleAnalyticsService.trackerName(id)}, fields), this));
    }

    public getTracker(id: string, name?: string) {
        let tracker = this.trackers[name || id];
        
        if (!tracker) {
            throw new Error("Tracker " + (name || id) + " not exists");
        }

        return tracker;
    }

}