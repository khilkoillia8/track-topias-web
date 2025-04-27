import {provideHttpClient, withFetch, withInterceptors} from "@angular/common/http";
import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';
import {definePreset} from "@primeng/themes";

import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';
import {authInterceptor} from "./shared/auth/jwt.interceptor";

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      0: '#ffffff',
      50: '{slate.50}',
      100: '{slate.100}',
      200: '{slate.200}',
      300: '{slate.300}',
      400: '{slate.400}',
      500: '{slate.500}',
      600: '{slate.600}',
      700: '{slate.700}',
      800: '{slate.800}',
      900: '{slate.900}',
      950: '{slate.950}'
    }
  }
});
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: MyPreset,
      }
    }),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()), provideAnimationsAsync(),]
};
