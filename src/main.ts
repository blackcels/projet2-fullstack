import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
//import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './app/core/service/auth.interceptor';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  //  provideAnimations()
  ]
}).catch(err => console.error('Erreur lors du bootstrap :', err));