"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GoogleAnalyticsEcommercePlugin {
    static addTransaction(tracker, data) {
        tracker.pluginCall("ecommerce", "addTransaction", data);
    }
    static sendTransaction(tracker, data) {
        GoogleAnalyticsEcommercePlugin.addTransaction(tracker, data);
        GoogleAnalyticsEcommercePlugin.send(tracker);
    }
    static send(tracker) {
        tracker.pluginCall("ecommerce", "send");
    }
}
exports.GoogleAnalyticsEcommercePlugin = GoogleAnalyticsEcommercePlugin;
//# sourceMappingURL=ecommerce.js.map