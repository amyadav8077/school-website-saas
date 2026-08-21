import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PhoneInputComponent } from './phone-input.component';

describe('PhoneInputComponent', () => {
  let component: PhoneInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneInputComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(PhoneInputComponent);
    component = fixture.componentInstance;
  });

  it('should create with India (+91) as the default country', () => {
    expect(component).toBeTruthy();
    expect((component as any).country().iso).toEqual('IN');
    expect((component as any).country().dialCode).toEqual('+91');
    expect((component as any).country().nationalLength).toEqual(10);
  });

  it('should strip non-numeric characters from input', () => {
    let emitted = '';
    component.registerOnChange((v: string) => (emitted = v));

    component.onInput('98ab76cd54');

    expect((component as any).national()).toEqual('987654');
    expect(emitted).toEqual('+91987654');
  });

  it('should cap India input at 10 digits', () => {
    component.onInput('123456789012345');
    expect((component as any).national()).toEqual('1234567890');
  });

  it('should be valid only at exactly 10 digits for India', () => {
    component.onInput('98765');
    expect((component as any).isValid()).toBe(false);

    component.onInput('9876543210');
    expect((component as any).isValid()).toBe(true);
  });

  it('should emit full E.164 value with dial code', () => {
    let emitted = '';
    component.registerOnChange((v: string) => (emitted = v));

    component.onInput('9876543210');

    expect(emitted).toEqual('+919876543210');
  });

  it('should emit empty string when the national number is cleared', () => {
    let emitted = 'seed';
    component.registerOnChange((v: string) => (emitted = v));

    component.onInput('');

    expect(emitted).toEqual('');
  });

  it('should re-clamp digits when switching to a shorter-length country', () => {
    component.onInput('9876543210'); // 10 digits, India
    component.onCountryChange('SG'); // Singapore national length = 8

    expect((component as any).country().iso).toEqual('SG');
    expect((component as any).national()).toEqual('98765432');
  });

  it('writeValue should parse an E.164 value into country + national parts', () => {
    component.writeValue('+9198765432');

    expect((component as any).country().iso).toEqual('IN');
    expect((component as any).national()).toEqual('98765432');
  });

  it('writeValue with null should clear the national number', () => {
    component.onInput('9876543210');
    component.writeValue(null);
    expect((component as any).national()).toEqual('');
  });

  it('should mark the control touched on blur', () => {
    let touched = false;
    component.registerOnTouched(() => (touched = true));

    component.onBlur();

    expect((component as any).touched()).toBe(true);
    expect(touched).toBe(true);
  });

  it('setDisabledState should toggle the disabled signal', () => {
    component.setDisabledState(true);
    expect((component as any).disabled()).toBe(true);
    component.setDisabledState(false);
    expect((component as any).disabled()).toBe(false);
  });
});
