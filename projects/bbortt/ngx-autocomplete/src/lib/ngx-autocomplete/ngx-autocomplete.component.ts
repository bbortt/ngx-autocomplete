import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
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

import { debounceTime, startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
  implements ControlValueAccessor, OnDestroy, OnInit {
  // Control values for ElementRef<HtmlInputElement>
  @Input()
  inputId?: string;
  @Input()
  inputName?: string;
  @Input()
  placeholder = 'Search';

  // Advanced configuration
  @Input()
  private debounceTime = 0;

  // Autocompleting tools, options and propertyAccessor for complex objects
  @Input()
  options: T[] = [];
  @Input()
  propertyAccessor?: string | ((option: T) => string);
  @Input()
  navigateInfinite = false;

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
  unsubscribe = new Subject();

  onTouched = () => {};

  /**
   * Bind to autocomplete input changes. Emits `valueChanges` of parent `FormControl` using `this.onChange`.
   */
  ngOnInit(): void {
    this.autocompleteControl.valueChanges
      .pipe(
        startWith(this.autocompleteControl.value as string),
        debounceTime(this.debounceTime),
        takeUntil(this.unsubscribe)
      )
      .subscribe((value: string) => this.valueChanges(value));
  }

  /**
   * Unbind `valueChanges` from internal form control.
   */
  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  /**
   * Register `onChange` listener of parent `FormControl`.
   *
   * @param onChange the `onChange` callback
   */
  registerOnChange(onChange: (update: T) => void): void {
    this.onChange = onChange;
  }

  /**
   * Register `onTouched` listener of parent `FormControl`.
   *
   * @param onTouched the `onTouched` callback
   */
  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }

  /**
   * Controls autocomplete `<input /> enabled/disabled state from parent `FormControl`.
   *
   * @param isDisabled if the autocomplete shall be disabled
   */
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.autocompleteControl.disable();
    } else {
      this.autocompleteControl.enable();
    }
  }

  /**
   * Update initial autocomplete (`string`) value. Does only trigger if a value is present.
   *
   * @param object the initial parent `FormControl` value
   */
  writeValue(object: T): void {
    if (object) {
      this.autocompleteControl.setValue(this.optionPropertyAccessor(object));
    }
  }

  /**
   * Handles autocomplete `<input />` value changes. Manages focus state and does emit the `@Output()` event if
   * appropriate (via `this.emitValueChange`).
   *
   * @param value the (possibly) new search/autocomplete value
   */
  valueChanges(value: string): void {
    this.optionIndex = -1;

    if (this.isFocused && !value) {
      this.emitValueChange(null);
    } else if (!!value) {
      this.onFocusIn(true);
    }

    this.autocompleteChanges.next(value);
  }

  /**
   * Actually updates the parent `FormControl` value via `@Output EventEmitter`.
   *
   * @param value the new value
   */
  emitValueChange(value: T): void {
    this.formValue = value;
    this.onChange(value);
  }

  /**
   * Listener for window resize events. Does adapt the autocomplete options/dropdown size.
   */
  onWindowResize(): void {
    this.autocompleteInputWidth = this.autocompleteInput!.nativeElement.offsetWidth;
  }

  /**
   * Listener for window click events. Is required to detect out-of-autocomplete clicks.
   *
   * @param $event the `MouseEvent` which happened anywhere in the window
   */
  onWindowClick($event: MouseEvent): void {
    if (
      this.isFocused &&
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

  /**
   * Listener for window tab events. Is required to detect out-of-autocomplete clicks.
   *
   * @param $event the `KeyboardEvent` which happened anywhere in the window
   */
  onWindowTab($event: KeyboardEvent): void {
    if (
      $event.key === 'Tab' &&
      $event.target instanceof HTMLInputElement &&
      this.autocompleteInput.nativeElement ===
        ($event.target as HTMLInputElement)
    ) {
      this.onFocusOut();
    }
  }

  /**
   * Handles focus in events. May not necessarily expand all options, e.g. if the focus was changed from options to
   * `<input />` via escape key (`this.preventEscapeFocus`).
   *
   * @param force whether to force-expand all options
   */
  onFocusIn(force = false): void {
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

  /**
   * Handles focus out events. Does update `this.isFocused` state based on selected option.
   *
   * @param force may force-close the options
   */
  onFocusOut(force = false): void {
    this.onTouched();
    this.isFocused = false;

    if (this.optionIndex < 0 || force) {
      if (force) {
        this.preventEscapeFocus = true;
      } else {
        this.autocompleteInput!.nativeElement.focus({ preventScroll: true });
      }
    } else {
      this.preventEscapeFocus = true;
      this.autocompleteInput!.nativeElement.focus({ preventScroll: true });
    }
  }

  /**
   * Detects whether the autocomplete `<input />` value does match the current parent `FormControl` value.
   */
  isAutocompleted(): boolean {
    return (
      this.autocompleteControl.value ===
      this.optionPropertyAccessor(this.formValue)
    );
  }

  /**
   * Selects the given option from the dropdown.
   *
   * @param option the option to pick
   */
  selectOption(option: T): void {
    this.emitValueChange(option);
    this.autocompleteControl.setValue(this.optionPropertyAccessor(option));
    this.isFocused = false;
  }

  /**
   * Returns complex objects as `string`. Does access complex parent `FormControl` values. Respects `null`, `string` and `T` values.
   *
   * @param option the current option to access as string
   */
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

  /**
   * Increase current option index by 1. Must also respect `this.navigateInfinite`.
   */
  nextIndex(): void {
    if (this.optionIndex < this.options.length - 1) {
      this.optionIndex++;
    } else if (this.navigateInfinite) {
      this.optionIndex = 0;
    }

    this.indexChange();
  }

  /**
   * Decrease current option index by 1. Must also respect `this.navigateInfinite`.
   */
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

  /**
   * Force-sets the current active option index. Mainly used for `MouseEvent`s.
   *
   * @param index the index to update the selection to
   */
  activeIndex(index: number): void {
    this.optionIndex = index;
    this.indexChange();
  }

  /**
   * Handles index changes, does update form focus and indirectly also sets the active class.
   */
  indexChange(): void {
    this.autocompleteOptions!.toArray()[this.optionIndex].nativeElement.focus({
      preventScroll: true
    });
  }

  // Implementation of ControlValueAccessor functionality
  private onChange = (update: T) => {};
}
