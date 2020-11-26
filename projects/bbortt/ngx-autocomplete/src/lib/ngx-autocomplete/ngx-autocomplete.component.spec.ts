import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxAutocompleteComponent } from './ngx-autocomplete.component';

describe('NgxAutocompleteComponent', () => {
  describe('string options', () => {
    let component: NgxAutocompleteComponent<string>;
    let fixture: ComponentFixture<NgxAutocompleteComponent<string>>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [NgxAutocompleteComponent]
      }).compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent<NgxAutocompleteComponent<string>>(NgxAutocompleteComponent) ;
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
});
