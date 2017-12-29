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
var trackers = {};
var GoogleAnalyticsTracker = /** @class */ (function () {
    function GoogleAnalyticsTracker(id, fields) {
        this.tracker = ga.create(id, fields);
        this.tracker.set("customTask", offlineTracking);
    }
    /**
     * Creates new tracker instance for given id/name.
     * @param id Tracking id (UA-XXXXX-Y).
     *
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#trackingId.
     */
    GoogleAnalyticsTracker.tracker = function (id, fields) {
        return __awaiter(this, void 0, void 0, function () {
            var instance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, GoogleAnalyticsTracker.load()];
                    case 1:
                        _a.sent();
                        instance = trackers[name || id];
                        if (instance) {
                            return [2 /*return*/, instance];
                        }
                        return [2 /*return*/, trackers[name || id] = new GoogleAnalyticsTracker(id, Object.assign({}, { name: id }, fields))];
                }
            });
        });
    };
    GoogleAnalyticsTracker.load = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!window["GoogleAnalyticsObject"]) {
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
    GoogleAnalyticsTracker.prototype.send = function (hitType) {
        var fields = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            fields[_i - 1] = arguments[_i];
        }
        this.tracker.send(hitType, fields);
    };
    GoogleAnalyticsTracker.analyticsUrl = "https://www.google-analytics.com/analytics.js";
    return GoogleAnalyticsTracker;
}());
export { GoogleAnalyticsTracker };
function offlineTracking(customTaskModel) {
    var sendHitTask = customTaskModel.get("sendHitTask");
    customTaskModel.set("sendHitTask", function (model) {
        // let's send the original hit using the native functionality
        sendHitTask(model);
        // grab the hit Payload
        var payload = model.get("hitPayload");
        // check if GA endpoint is ready
        var http = new XMLHttpRequest();
        http.open("HEAD", "https://www.google-analytics.com/collect");
        http.onreadystatechange = function () {
            // google analytics endpoint is not reachable, let's save the hit
            if (this.readyState === this.DONE && this.status !== 200) {
                pushOfflineHit(payload + "&qt;=" + Date.now());
            }
            else {
                sendOfflineHits();
            }
        };
        http.send();
    });
}
function sendOfflineHits() {
    if (countOfflineHits()) {
        // process hits in queue
        var now = Date.now() / 1000;
        // let's loop thru the chunks array and send the hits to GA
        for (var _i = 0, _a = offlineHits(); _i < _a.length; _i++) {
            var hits = _a[_i];
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "https://www.google-analytics.com/batch", true);
            var payload = [];
            for (var _b = 0, hits_1 = hits; _b < hits_1.length; _b++) {
                var hit = hits_1[_b];
                if (hit.indexOf("&qt;=") > -1) {
                    payload.push(hit.replace(/qt=([^&]*)/, "qt=" + Math.round(now - parseInt(hit.match(/qt=([^&]*)/)[1]) / 1000) * 1000));
                }
                else {
                    payload.push(hit);
                }
            }
            xhr.onload = function () {
                clearOfflineHits();
            };
            xhr.send(payload.join("\n"));
        }
    }
}
function pushOfflineHit(hit) {
}
function countOfflineHits() {
    return 0;
}
// batch endpoint only allows 20 hits per batch, let's chunk the hits array
function offlineHits() {
    return [];
}
function clearOfflineHits() {
}
function chunkArray(arr, len) {
    var chunks = [];
    var i = 0;
    var n = arr.length;
    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }
    return chunks;
}
//# sourceMappingURL=tracker.js.map