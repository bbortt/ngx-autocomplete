import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { NgxAutocompleteComponent } from './ngx-autocomplete/ngx-autocomplete.component';

@NgModule({
  declarations: [NgxAutocompleteComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [NgxAutocompleteComponent]
})
export class NgxAutocompleteModule {}
