import {GoogleAnalyticsTracker} from "../tracker";

export class GoogleAnalyticsEcommercePlugin {
    
    static addTransaction(tracker: GoogleAnalyticsTracker, data: UniversalAnalytics.FieldsObject) {
        tracker.pluginCall("ecommerce", "addTransaction", data);
    }
    
    static sendTransaction(tracker: GoogleAnalyticsTracker, data: UniversalAnalytics.FieldsObject) {
        GoogleAnalyticsEcommercePlugin.addTransaction(tracker, data);
        GoogleAnalyticsEcommercePlugin.send(tracker);
    }

    static send(tracker: GoogleAnalyticsTracker) {
        tracker.pluginCall("ecommerce", "send");
    }
}
