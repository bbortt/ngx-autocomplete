import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
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
  inputId?: string;
  @Input()
  inputName?: string;
  @Input()
  placeholder = 'Search';

  // Autocompleting tools, options and propertyAccessor for complex objects
  @Input()
  options: T[] = [];
  @Input()
  propertyAccessor?: string | ((option: T) => string);
  @Input()
  navigateInfinite = false;

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

  // Accessibility, keyboard navigation
  optionIndex = -1;
  @ViewChildren('autocompleteOption')
  autocompleteOptions?: QueryList<ElementRef<HTMLDivElement>>;

  // Component-internal FormControl
  formValue: T;
  isFocused = false;
  preventEscapeFocus = false;
  autocompleteControl = new FormControl('');

  // Implementation of ControlValueAccessor functionality
  private onChange = (update: T) => {};
  onTouched = () => {};

  ngOnInit(): void {
    this.autocompleteControl.valueChanges
      .pipe(
        startWith(this.autocompleteControl.value as string),
        debounceTime(this.debounceTime)
      )
      .subscribe((value: string) => this.valueChanges(value));
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

  valueChanges(value: string): void {
    this.optionIndex = -1;

    if (this.isFocused && !value) {
      this.emitValueChange(null);
    } else if (!!value) {
      this.onFocusIn(true);
    }

    this.autocompleteChanges.next(value);
  }

  emitValueChange(value: T): void {
    this.formValue = value;
    this.onChange(value);
  }

  onWindowResize(): void {
    this.autocompleteInputWidth = this.autocompleteInput!.nativeElement.offsetWidth;
  }

  onWindowClick($event: MouseEvent): void {
    if (
      !(
        $event.target instanceof HTMLInputElement &&
        this.autocompleteInput.nativeElement ===
          ($event.target as HTMLInputElement)
      ) &&
      !(
        $event.target instanceof HTMLDivElement &&
        this.autocompleteOptions
          .toArray()
          .map(
            (autocompleteOption: ElementRef<HTMLDivElement>) =>
              autocompleteOption.nativeElement
          )
          .includes($event.target as HTMLDivElement)
      )
    ) {
      this.onFocusOut(true);
    }
  }

  onFocusIn(force = false): void {
    if (!this.isFocused) {
      this.onTouched();
    }

    if (force) {
      this.optionIndex = -1;
      this.isFocused = true;
    }
    // Prevent focus when reaching input via `escape`
    else if (!this.preventEscapeFocus) {
      this.isFocused = true;
    }

    this.preventEscapeFocus = false;
    this.onWindowResize();
  }

  onFocusOut(force = false): void {
    if (this.optionIndex < 0 || force) {
      this.isFocused = false;

      if (force) {
        this.preventEscapeFocus = true;
      } else {
        this.autocompleteInput!.nativeElement.focus({ preventScroll: true });
      }
    }
  }

  isAutocompleted(): boolean {
    return (
      this.autocompleteControl.value ===
      this.optionPropertyAccessor(this.formValue)
    );
  }

  selectOption(option: T): void {
    this.emitValueChange(option);
    this.autocompleteControl.setValue(this.optionPropertyAccessor(option));
    this.isFocused = false;
  }

  optionPropertyAccessor(option: T): string {
    if (option && this.propertyAccessor) {
      if (typeof this.placeholder === 'string') {
        return option[this.propertyAccessor as string];
      } else {
        return (this.propertyAccessor as (option: T) => string)(option);
      }
    } else if (!option) {
      return null;
    }

    return (option as any) as string;
  }

  nextIndex(): void {
    if (this.optionIndex < this.options.length - 1) {
      this.optionIndex++;
    } else if (this.navigateInfinite) {
      this.optionIndex = 0;
    }

    this.indexChange();
  }

  previousIndex(): void {
    if (this.optionIndex < 0) {
      this.onFocusOut();
    } else if (this.optionIndex === 0 && this.navigateInfinite) {
      this.optionIndex = this.options.length - 1;
    } else if (this.optionIndex > 0) {
      this.optionIndex--;
    }

    this.indexChange();
  }

  activeIndex(index: number): void {
    this.optionIndex = index;
    this.indexChange();
  }

  indexChange(): void {
    this.autocompleteOptions!.toArray()[this.optionIndex].nativeElement.focus({
      preventScroll: true
    });
  }
}
