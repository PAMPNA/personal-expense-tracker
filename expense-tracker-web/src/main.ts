import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
import { Chart, registerables } from 'chart.js';

/* ✅ Register Pie Chart support */
Chart.register(...registerables);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
