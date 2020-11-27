import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ALL_COUNTRIES } from '../countries.const';

@Component({
  selector: 'app-autocomplete-sample',
  templateUrl: './autocomplete-sample.component.html'
})
export class AutocompleteSampleComponent implements OnInit {
  editForm = this.fb.group({
    name: [],
    country: ['', Validators.required]
  });

  private allOptions = ALL_COUNTRIES;
  options: string[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.editForm
      .get('country')!
      .valueChanges.subscribe((value: string) => this.filter(value));
  }

  filter(value: string): void {
    this.options = this.allOptions.filter((option: string) =>
      option.startsWith(value)
    );
  }
}
