import * as tslib_1 from "tslib";
import { GoogleAnalyticsService } from "./service";
var GoogleAnalyticsTracker = /** @class */ (function () {
    function GoogleAnalyticsTracker(service, id, fields) {
        this.service = service;
        fields = Object.assign({}, fields, { cookieDomain: window.location.protocol.indexOf("file") > -1 ? "none" : "auto" });
        // cookies disabled
        if (fields.cookieDomain == "none") {
            fields["storage"] = "none";
            if (!fields.clientId && window.localStorage) {
                fields.clientId = window.localStorage.getItem("ga:clientId");
                ga(function (tracker) {
                    window.localStorage.setItem("ga:clientId", tracker.get("clientId"));
                });
            }
        }
        this.tracker = ga.create(id, fields);
        this.tracker.set(fields);
        this.tracker.set("checkProtocolTask", function () { return null; });
        this.tracker.set("sendHitTask", function (model) { return service.sendHitTask(model); });
        this.name = fields.name;
    }
    /**
     * Creates new tracker instance for given id/name.
     *
     * @param id Tracking id (UA-XXXXX-Y).
     * @param fields Tracking settings.
     * @see Tracking id docs: https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference.
     */
    GoogleAnalyticsTracker.newTracker = function (id, fields, service) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (!service) {
                    service = new GoogleAnalyticsService();
                }
                return [2 /*return*/, new GoogleAnalyticsTracker(service, id, fields)];
            });
        });
    };
    GoogleAnalyticsTracker.prototype.pluginRequire = function (plugin) {
        ga(this.name + ".require", plugin);
    };
    GoogleAnalyticsTracker.prototype.pluginCall = function (plugin, method, callArgs) {
        ga(this.name + "." + plugin + ":" + method, callArgs);
    };
    GoogleAnalyticsTracker.prototype.send = function (hitType, fields) {
        // console.log("send " + hitType);
        // console.log(this.tracker);
        this.tracker.send(hitType, fields);
        return this;
    };
    GoogleAnalyticsTracker.prototype.flush = function () {
        this.service.flushBatch();
    };
    GoogleAnalyticsTracker.prototype.get = function (fieldName) {
        return this.tracker.get(fieldName);
    };
    GoogleAnalyticsTracker.prototype.set = function (fieldName, fieldValue) {
        this.tracker.set(fieldName, fieldValue);
    };
    return GoogleAnalyticsTracker;
}());
export { GoogleAnalyticsTracker };
//# sourceMappingURL=tracker.js.map