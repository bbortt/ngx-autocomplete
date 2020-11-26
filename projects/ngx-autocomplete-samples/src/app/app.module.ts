import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxAutocompleteModule } from '@bbortt/ngx-autocomplete';

import { AppComponent } from './app.component';
import { AutocompleteSampleComponent } from './sample/autocomplete-sample.component';
import { AutocompleteSampleAdvancedComponent } from './sample-advanced/autocomplete-sample-advanced.component';
import { AutocompleteSampleBootstrapComponent } from './sample-bootstrap/autocomplete-sample-bootstrap.component';

@NgModule({
  declarations: [
    AppComponent,
    AutocompleteSampleComponent,
    AutocompleteSampleAdvancedComponent,
    AutocompleteSampleBootstrapComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgxAutocompleteModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
