export class GoogleAnalyticsEcommercePlugin {
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
//# sourceMappingURL=ecommerce.js.map