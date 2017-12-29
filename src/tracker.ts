import {Injectable} from "@angular/core";

@Injectable()
export class GoogleAnalyticsService {

    constructor() {
    }

    public analyticsUrl = "https://www.google-analytics.com/analytics.js";

    private load() {
        
        if (!window["GoogleAnalyticsObject"]) {

            window["GoogleAnalyticsObject"] = "ga";
            window["ga"] = window["ga"] || function() { (window["ga"].q = window["ga"].q || []).push(arguments); };
            window["ga"].l = 1 * Date.now();

            let script: HTMLScriptElement = document.createElement("script");
            script.async = true;
            script.src = this.analyticsUrl;

            let sibling = document.getElementsByTagName("script")[0];
            sibling.parentNode.insertBefore(script, sibling);
        }
    }

    createTracker(id: string, name?: string): GoogleAnalyticsTracker {
        
    }

}

export class GoogleAnalyticsTracker {

}