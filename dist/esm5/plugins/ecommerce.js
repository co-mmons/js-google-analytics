var GoogleAnalyticsEcommercePlugin = /** @class */ (function () {
    function GoogleAnalyticsEcommercePlugin() {
    }
    GoogleAnalyticsEcommercePlugin.addTransaction = function (tracker, data) {
        tracker.pluginCall("ecommerce", "addTransaction", data);
    };
    GoogleAnalyticsEcommercePlugin.sendTransaction = function (tracker, data) {
        GoogleAnalyticsEcommercePlugin.addTransaction(tracker, data);
        GoogleAnalyticsEcommercePlugin.send(tracker);
    };
    GoogleAnalyticsEcommercePlugin.send = function (tracker) {
        tracker.pluginCall("ecommerce", "send");
    };
    return GoogleAnalyticsEcommercePlugin;
}());
export { GoogleAnalyticsEcommercePlugin };
//# sourceMappingURL=ecommerce.js.map