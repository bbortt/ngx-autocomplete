import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import { debounceTime, startWith } from 'rxjs/operators';

@Component({
  selector: 'ngx-autocomplete',
  templateUrl: './ngx-autocomplete.component.html',
  styleUrls: ['./ngx-autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxAutocompleteComponent),
      multi: true
    }
  ]
})
export class NgxAutocompleteComponent<T>
  implements ControlValueAccessor, OnInit {
  // Control values for ElementRef<HtmlInputElement>
  @Input()
  id?: string;
  @Input()
  name?: string;
  @Input()
  placeholder = 'Search';

  // Autocompleting tools, options and propertyAccessor for complex objects
  @Input()
  options: T[] = [];
  @Input()
  propertyAccessor?: string | ((option: T) => string);

  // Advanced configuration
  @Input()
  private debounceTime = 0;

  // Autocomplete, filter value change event
  @Output()
  autocompleteChanges = new EventEmitter<string>();

  // Size control
  autocompleteInputWidth = 0;
  @ViewChild('autocompleteInput')
  autocompleteInput?: ElementRef<HTMLInputElement>;

  // Component-internal FormControl
  autocompleteControl = new FormControl('');
  isFocused = false;

  // Implementation of ControlValueAccessor functionality
  private onChange = (update: T) => {};
  onTouched = () => {};

  ngOnInit(): void {
    this.autocompleteControl.valueChanges
      .pipe(
        startWith(this.autocompleteControl.value as string),
        debounceTime(this.debounceTime)
      )
      .subscribe((value: string) => this.autocompleteChanges.next(value));
  }

  registerOnChange(onChange: (update: T) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.autocompleteControl.disable();
    } else {
      this.autocompleteControl.enable();
    }
  }

  writeValue(object: T): void {
    if (object) {
      this.autocompleteControl.setValue(this.optionPropertyAccessor(object));
    }
  }

  onWindowResize(): void {
    this.autocompleteInputWidth = this.autocompleteInput!.nativeElement.offsetWidth;
  }

  onFocus(): void {
    this.onWindowResize();
    this.onTouched();
    this.isFocused = true;
  }

  selectOption(option: T): void {
    this.onChange(option);
    this.autocompleteControl.setValue(this.optionPropertyAccessor(option));
    this.isFocused = false;
  }

  public optionPropertyAccessor(option: T): string {
    if (option && this.propertyAccessor) {
      if (typeof this.placeholder === 'string') {
        return option[this.propertyAccessor as string];
      } else {
        return (this.propertyAccessor as (option: T) => string)(option);
      }
    }

    return (option as any) as string;
  }
}
