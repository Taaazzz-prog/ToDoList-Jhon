import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

console.log('🚀 main.ts: Démarrage de l\'application Angular');
console.log('🚀 main.ts: Routes configurées =', routes);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(BrowserAnimationsModule)
  ]
}).then(() => {
  console.log('✅ main.ts: Application Angular démarrée avec succès');
}).catch(err => {
  console.error('❌ main.ts: Erreur au démarrage de l\'application =', err);
});
