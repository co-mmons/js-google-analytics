"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const service_1 = require("./service");
class GoogleAnalyticsTracker {
    constructor(service, id, fields) {
        this.service = service;
        fields = Object.assign({}, fields, { cookieDomain: window.location.protocol.indexOf("file") > -1 ? "none" : "auto" });
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
    /**
     * Creates new tracker instance for given id/name.
     *
     * @param id Tracking id (UA-XXXXX-Y).
     * @param fields Tracking settings.
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference.
     */
    static newTracker(id, fields, service) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!service) {
                service = new service_1.GoogleAnalyticsService();
            }
            return new GoogleAnalyticsTracker(service, id, fields);
        });
    }
    pluginRequire(plugin) {
        ga(this.name + ".require", plugin);
    }
    pluginCall(plugin, method, callArgs) {
        ga(this.name + "." + plugin + ":" + method, callArgs);
    }
    send(hitType, fields) {
        // console.log("send " + hitType);
        // console.log(this.tracker);
        this.tracker.send(hitType, fields);
        return this;
    }
    flush() {
        this.service.flushBatch();
    }
    get(fieldName) {
        return this.tracker.get(fieldName);
    }
    set(fieldName, fieldValue) {
        this.tracker.set(fieldName, fieldValue);
    }
}
exports.GoogleAnalyticsTracker = GoogleAnalyticsTracker;
//# sourceMappingURL=tracker.js.map