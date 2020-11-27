# @bbortt/ngx-autocomplete

> Angular V11 compatible autocomplete component to use with any style framework.

[![Travis CI](https://travis-ci.com/bbortt/ngx-autocomplete.svg?branch=release)](https://travis-ci.com/bbortt/ngx-autocomplete)
[![Blazing Fast](https://img.shields.io/badge/speed-blazing%20%F0%9F%94%A5-brightgreen.svg?style=flat-square)](https://twitter.com/acdlite/status/974390255393505280)
[![License: Apache 2](https://img.shields.io/badge/License-Apache2-blue.svg)](https://opensource.org/licenses/MIT)

##_Highlights_:

- Fully flexible for any autocomplete object through `propertyAccessor` function
- Scales perfectly to every screen size, even when resizing
- Navigable using the mouse or keyboard (see [Navigation](#navigation))
- Create your own filter method which matches the case best
- Fits into the `@angular/forms` / `FormGroup` setup
- Customizable styling using css classes

[>> Life Samples](https://bbortt.github.io/ngx-autocomplete).

# Contents

- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
  - [Css Classes](#css-classes)
- [Navigation](#navigation)
- [Examples](#examples)
  - [Simple](#simple)
  - [Advanced](#advanced)
  - [Bootstrap](#bootstrap)

# Getting Started

Add the `NgxAutocompleteModule` to your `app.module.ts` like this:

```ts
[...]

import { NgxAutocompleteModule } from '@bbortt/ngx-autocomplete';

@NgModule({
  declarations: [ ... ],
  imports: [ ..., NgxAutocompleteModule ],
  bootstrap: [ ... ],
})
export class AppModule {
}
```

That's it. You can head into the code at this point! The component selector is named `<ngx-autocomplete />`.

# API Reference

## Inputs

|       Input        |                Type                 | Description                                                                                             | Default     |
| :----------------: | :---------------------------------: | :------------------------------------------------------------------------------------------------------ | :---------- |
|        `id`        |              `string`               | The ID of the `<input />` component. Mostly used to link any `<label />` elements.                      |             |
|       `name`       |              `string`               | The `<input />` element name. Makes the form accessible for screen readers.                             |             |
|   `placeholder`    |              `string`               | The typical default placeholder of the `<input />` element. Displayed weak as long as no value present. | `'Search.'` |
|     `options`      |               `any[]`               | An array of options which could be selected.                                                            | `[]`        |
| `propertyAccessor` | `string` or `(option: T) => string` | The object autocomplete (and display) property name. Or an accessor function, given the option.         |             |
| `navigateInfinite` |              `boolean`              | If true then the arrow key navigation will never end. Thus restart from the beginning / end.            | `false`     |
|   `debounceTime`   |              `number`               | A debounce time in ms. This delays the filtering as long as the user types continuously.                | `0`         |

## Outputs

|         Input         |          Type          | Description                                                                                                                                  |
| :-------------------: | :--------------------: | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `autocompleteChanges` | `EventEmitter<string>` | Event will be emitted whenever the filter value changes. The user is responsible for filtering his data and providing the updated `options`. |

## Css Classes

`ngx-autocomplete-input`: The autocomplete text input.

`ngx-autocomplete-container`: `<div />` with absolute position, holding the possible autocomplete options.

`ngx-autocomplete-option`: Every `<option />` of the autocomplete dropdown.

`ngx-autocomplete-option-active`: A single active option (not yet selected).

# Navigation

|            Key            |                                 Meaning                                 |
| :-----------------------: | :---------------------------------------------------------------------: |
| `arrow up` / `arrow down` | Navigate through the options. May be infinite using `navigateInfinite`. |
|          `enter`          |          Selects the current active option from the dropdown.           |
|         `escape`          |   Cancel the selection - this does not use the current active option.   |

# Examples

All example autocompletes are deployed life: [bbortt.github.io/ngx-autocomplete](https://bbortt.github.io/ngx-autocomplete).

## Simple

The easiest autocomplete is the pure string array.

`autocomplete-sample.component.ts`:

```ts
@Component({
  selector: 'app-autocomplete-sample',
  templateUrl: './autocomplete-sample.component.html'
})
export class AutocompleteSampleComponent implements OnInit {
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
```

`autocomplete-sample.component.html`

```html
<ngx-autocomplete
  inputName="country"
  inputId="field-country"
  formControlName="country"
  [options]="options"
  (autocompleteChanges)="filter($event)"
></ngx-autocomplete>
```

[Source](https://github.com/bbortt/ngx-autocomplete/tree/release/projects/bbortt/samples/src/app/sample).

## Advanced

The advanced sample uses complex objects and the `name` property as an accessor.
Take a look at the code in
[`projects/bbortt/samples/src/app/sample-advanced`](https://github.com/bbortt/ngx-autocomplete/tree/release/projects/bbortt/samples/src/app/sample-advanced).

## Bootstrap

The bootstrap sample lives up to its name. Using a custom `.scss` styling, it extends the Bootstrap form styles.
Take a look at the code in
[`projects/bbortt/samples/src/app/sample-bootstrap`](https://github.com/bbortt/ngx-autocomplete/tree/release/projects/bbortt/samples/src/app/sample-bootstrap).

# License

This project is licensed under the terms of the [Apache 2.0 License](https://github.com/bbortt/ngx-autocomplete/blob/release/LICENSE).
