//https://www.simoahava.com/analytics/track-users-who-are-offline-in-google-analytics
import * as tslib_1 from "tslib";
import { GoogleAnalyticsTracker } from "./tracker";
const offlineStorageKey = "googleAnalytics.offlineHits";
export class GoogleAnalyticsService {
    constructor() {
        this.trackers = {};
    }
    static load() {
        return new Promise((resolve, reject) => {
            if (!window["ga"]) {
                let script = document.createElement("script");
                script.src = this.analyticsUrl;
                script.onload = () => {
                    resolve();
                };
                script.onerror = () => {
                    reject();
                };
                script.onabort = () => {
                    reject();
                };
                let sibling = document.getElementsByTagName("script")[0];
                sibling.parentNode.insertBefore(script, sibling);
            }
            else {
                resolve();
            }
        });
    }
    /**
     * Starts sending hits in batch mode. In order to send hits you have to
     * either call endBatch() or flushBatch().
     */
    startBatch() {
        if (!this.batchQueue) {
            this.batchQueue = [];
        }
    }
    /**
     * Send hits, that are waiting in batch queue. Batch queue is cleared but
     * batch mode is still enabled.
     */
    flushBatch() {
        if (this.batchQueue) {
            // console.log("batch queue");
            // console.log(this.batchQueue);
            let q = this.batchQueue.slice();
            this.sendHits(q);
            this.batchQueue = [];
        }
    }
    /**
     * Send hits, that are waiting in batch queue and disables batch mode.
     */
    endBatch() {
        if (this.batchQueue) {
            let q = this.batchQueue.slice();
            this.sendHits(q);
            this.batchQueue = undefined;
        }
    }
    /**
     * Implementation of GA sentHitTask. If batch mode is enabled, task is added to
     * batch queue.
     */
    sendHitTask(model) {
        // console.log("send hit task");
        // console.log(model.get("hitPayload"));
        if (this.batchQueue) {
            this.batchQueue.push(model.get("hitPayload"));
        }
        else {
            try {
                this.sendHits([model.get("hitPayload")]);
            }
            catch (error) {
                console.warn(error);
            }
        }
    }
    sendHits(hits) {
        try {
            let now = Date.now();
            let allHits = this.pullOfflineHits();
            for (let h of hits) {
                if (h) {
                    if (h.indexOf("&tmpts=") < 0) {
                        h += "&tmpts=" + now;
                    }
                    allHits.push(h);
                }
            }
            let chunkedHits = this.chunkArray(allHits, 10);
            let sendingChunk = 0;
            let sendBatch = (batchHits) => {
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
                let httpPayload = [];
                for (let h of (batchHits || [])) {
                    if (h.indexOf("&tmpts=") > -1) {
                        let t = Math.round(now - parseInt(h.match(/tmpts=([^&]*)/)[1]));
                        h = h.replace(/tmpts=([^&]*)/, t > 0 ? "qt=" + t : "");
                        if (t > 10000) {
                            h += "&cm1=" + Math.round(t / 1000);
                        }
                        httpPayload.push(h);
                    }
                    else {
                        httpPayload.push(h);
                    }
                }
                http.send(httpPayload.join("\n"));
            };
            sendBatch(chunkedHits[0]);
        }
        catch (error) {
            console.warn(error);
        }
    }
    pushOfflineHits(hits) {
        let offline = JSON.parse(window.localStorage.getItem(offlineStorageKey) || "[]");
        offline = offline.concat(hits);
        window.localStorage.setItem(offlineStorageKey, JSON.stringify(offline));
    }
    pullOfflineHits() {
        let hits = JSON.parse(window.localStorage.getItem(offlineStorageKey) || "[]");
        window.localStorage.removeItem(offlineStorageKey);
        return hits;
    }
    chunkArray(arr, len) {
        let chunks = [];
        let i = 0;
        let n = arr.length;
        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }
        return chunks;
    }
    static trackerName(id) {
        return id.replace(/\-/g, "");
    }
    /**
     * Creates new tracker instance for given id/name.
     *
     * @param id Tracking id (UA-XXXXX-Y).
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#trackingId.
     */
    newTracker(id, fields) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield GoogleAnalyticsService.load();
            let instanceId = (fields && fields.name) || GoogleAnalyticsService.trackerName(id);
            if (this.trackers[instanceId]) {
                throw new Error("Tracker " + instanceId + " already exists");
            }
            return this.trackers[instanceId] = (yield GoogleAnalyticsTracker.newTracker(id, Object.assign({}, { name: GoogleAnalyticsService.trackerName(id) }, fields), this));
        });
    }
    getTracker(id, name) {
        let tracker = this.trackers[name || id];
        if (!tracker) {
            throw new Error("Tracker " + (name || id) + " not exists");
        }
        return tracker;
    }
}
GoogleAnalyticsService.analyticsUrl = "https://www.google-analytics.com/analytics.js";
//# sourceMappingURL=service.js.map