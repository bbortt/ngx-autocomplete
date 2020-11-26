import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { ALL_COUNTRIES } from '../countries.const';

@Component({
  selector: 'app-autocomplete-bootstrap',
  templateUrl: './autocomplete-sample-bootstrap.component.html',
  styleUrls: ['./autocomplete-sample-bootstrap.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AutocompleteSampleBootstrapComponent implements OnInit {
  editForm = this.fb.group({
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
