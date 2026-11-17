import { provideAppInitializer } from "@angular/core";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export function provideDeviceId() {
  return provideAppInitializer(async () => {
    const agent = await FingerprintJS.load();
    const result = await agent.get();
    return result.visitorId;
  });
}
