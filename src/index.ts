import {NgModule, ModuleWithProviders, InjectionToken} from "@angular/core";

import {GoogleAnalyticsService} from "./tracker";

export const googleAnalyticsLoad: InjectionToken<string> = new InjectionToken("googleAnalytics");

@NgModule({
    providers: [GoogleAnalyticsService]
})
export class GoogleAnalyticsModule {


}
