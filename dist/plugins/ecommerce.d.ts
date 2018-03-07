/// <reference types="google.analytics" />
import { GoogleAnalyticsTracker } from "../tracker";
export declare class GoogleAnalyticsEcommercePlugin {
    static addTransaction(tracker: GoogleAnalyticsTracker, data: UniversalAnalytics.FieldsObject): void;
    static sendTransaction(tracker: GoogleAnalyticsTracker, data: UniversalAnalytics.FieldsObject): void;
    static send(tracker: GoogleAnalyticsTracker): void;
}
