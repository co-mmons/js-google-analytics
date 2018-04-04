//https://www.simoahava.com/analytics/track-users-who-are-offline-in-google-analytics
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { GoogleAnalyticsTracker } from "./tracker";
var offlineStorageKey = "googleAnalytics.offlineHits";
var GoogleAnalyticsService = /** @class */ (function () {
    function GoogleAnalyticsService() {
        this.trackers = {};
    }
    GoogleAnalyticsService.load = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!window["ga"]) {
                var script = document.createElement("script");
                script.src = _this.analyticsUrl;
                script.onload = function () {
                    resolve();
                };
                var sibling = document.getElementsByTagName("script")[0];
                sibling.parentNode.insertBefore(script, sibling);
            }
            else {
                resolve();
            }
        });
    };
    /**
     * Starts sending hits in batch mode. In order to send hits you have to
     * either call endBatch() or flushBatch().
     */
    GoogleAnalyticsService.prototype.startBatch = function () {
        if (!this.batchQueue) {
            this.batchQueue = [];
        }
    };
    /**
     * Send hits, that are waiting in batch queue. Batch queue is cleared but
     * batch mode is still enabled.
     */
    GoogleAnalyticsService.prototype.flushBatch = function () {
        if (this.batchQueue) {
            // console.log("batch queue");
            // console.log(this.batchQueue);
            var q = this.batchQueue.slice();
            this.sendHits(q);
            this.batchQueue = [];
        }
    };
    /**
     * Send hits, that are waiting in batch queue and disables batch mode.
     */
    GoogleAnalyticsService.prototype.endBatch = function () {
        if (this.batchQueue) {
            var q = this.batchQueue.slice();
            this.sendHits(q);
            this.batchQueue = undefined;
        }
    };
    /**
     * Implementation of GA sentHitTask. If batch mode is enabled, task is added to
     * batch queue.
     */
    GoogleAnalyticsService.prototype.sendHitTask = function (model) {
        // console.log("send hit task");
        // console.log(model.get("hitPayload"));
        if (this.batchQueue) {
            this.batchQueue.push(model.get("hitPayload"));
        }
        else {
            this.sendHits([model.get("hitPayload")]);
        }
    };
    GoogleAnalyticsService.prototype.sendHits = function (hits) {
        var _this = this;
        var now = Date.now();
        var allHits = this.pullOfflineHits();
        for (var _i = 0, hits_1 = hits; _i < hits_1.length; _i++) {
            var h = hits_1[_i];
            if (h.indexOf("&tmpts=") < 0) {
                h += "&tmpts=" + now;
            }
            allHits.push(h);
        }
        var chunkedHits = this.chunkArray(allHits, 10);
        var sendingChunk = 0;
        var sendBatch = function (batchHits) {
            // console.log("send batch");
            // console.log(batchHits);
            var http = new XMLHttpRequest();
            http.open("POST", "https://www.google-analytics.com/batch", true);
            http.onreadystatechange = function () {
                if (http.readyState === http.DONE) {
                    if (http.status !== 200) {
                        _this.pushOfflineHits(batchHits);
                    }
                    if (chunkedHits.length - 1 > sendingChunk) {
                        sendBatch(chunkedHits[++sendingChunk]);
                    }
                }
            };
            var httpPayload = [];
            for (var _i = 0, _a = (batchHits || []); _i < _a.length; _i++) {
                var h = _a[_i];
                if (h.indexOf("&tmpts=") > -1) {
                    var t = Math.round(now - parseInt(h.match(/tmpts=([^&]*)/)[1]));
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
    };
    GoogleAnalyticsService.prototype.pushOfflineHits = function (hits) {
        var offline = JSON.parse(window.localStorage.getItem(offlineStorageKey) || "[]");
        offline = offline.concat(hits);
        window.localStorage.setItem(offlineStorageKey, JSON.stringify(offline));
    };
    GoogleAnalyticsService.prototype.pullOfflineHits = function () {
        var hits = JSON.parse(window.localStorage.getItem(offlineStorageKey) || "[]");
        window.localStorage.removeItem(offlineStorageKey);
        return hits;
    };
    GoogleAnalyticsService.prototype.chunkArray = function (arr, len) {
        var chunks = [];
        var i = 0;
        var n = arr.length;
        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }
        return chunks;
    };
    GoogleAnalyticsService.trackerName = function (id) {
        return id.replace(/\-/g, "");
    };
    /**
     * Creates new tracker instance for given id/name.
     *
     * @param id Tracking id (UA-XXXXX-Y).
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#trackingId.
     */
    GoogleAnalyticsService.prototype.newTracker = function (id, fields) {
        return __awaiter(this, void 0, void 0, function () {
            var instanceId, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, GoogleAnalyticsService.load()];
                    case 1:
                        _c.sent();
                        instanceId = (fields && fields.name) || GoogleAnalyticsService.trackerName(id);
                        if (this.trackers[instanceId]) {
                            throw new Error("Tracker " + instanceId + " already exists");
                        }
                        _a = this.trackers;
                        _b = instanceId;
                        return [4 /*yield*/, GoogleAnalyticsTracker.newTracker(id, Object.assign({}, { name: GoogleAnalyticsService.trackerName(id) }, fields), this)];
                    case 2: return [2 /*return*/, _a[_b] = (_c.sent())];
                }
            });
        });
    };
    GoogleAnalyticsService.prototype.getTracker = function (id, name) {
        var tracker = this.trackers[name || id];
        if (!tracker) {
            throw new Error("Tracker " + (name || id) + " not exists");
        }
        return tracker;
    };
    GoogleAnalyticsService.analyticsUrl = "https://www.google-analytics.com/analytics.js";
    return GoogleAnalyticsService;
}());
export { GoogleAnalyticsService };
//# sourceMappingURL=service.js.map