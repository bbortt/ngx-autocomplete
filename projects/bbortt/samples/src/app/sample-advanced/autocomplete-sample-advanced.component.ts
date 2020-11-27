import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ALL_COUNTRIES } from '../countries.const';

type Country = {
  name: string;
};

@Component({
  selector: 'app-autocomplete-advanced',
  templateUrl: './autocomplete-sample-advanced.component.html'
})
export class AutocompleteSampleAdvancedComponent {
  editForm = this.fb.group({
    name: [],
    country: [null, Validators.required]
  });

  private allOptions: Country[] = ALL_COUNTRIES.map(
    (name: string) => ({ name } as Country)
  );
  options: Country[] = [];

  constructor(private fb: FormBuilder) {}

  filter(value: any): void {
    this.options = this.allOptions.filter((option: Country) =>
      option.name.startsWith(value)
    );
  }

  currentValue(): string {
    return JSON.stringify(this.editForm.get('country')!.value);
  }
}
