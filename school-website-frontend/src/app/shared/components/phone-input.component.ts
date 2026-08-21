import { Component, Input, forwardRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface CountryCode {
  iso: string;
  dialCode: string;
  label: string;
  flag: string;
  nationalLength: number;
}

/**
 * Reusable, form-friendly phone input.
 *
 * - Country-code selector (defaults to India +91).
 * - Numeric-only entry; India is capped at 10 digits.
 * - Live tick/cross validity indicator.
 * - Implements ControlValueAccessor so it works with [(ngModel)] / reactive forms.
 *
 * The value written to the parent model is the full E.164-style string
 * (e.g. "+919876543210"). Consumers can read the national part via (validChange).
 */
@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="pi-wrap" [class.pi-invalid]="touched() && !isValid()" [class.pi-valid]="isValid()">
      <select
        class="pi-country"
        [disabled]="disabled()"
        [value]="country().iso"
        (change)="onCountryChange($any($event.target).value)"
        aria-label="Country code">
        @for (c of countries; track c.iso) {
          <option [value]="c.iso">{{ c.flag }} {{ c.dialCode }}</option>
        }
      </select>

      <div class="pi-field">
        <input
          type="tel"
          inputmode="numeric"
          autocomplete="tel-national"
          class="pi-input"
          [disabled]="disabled()"
          [value]="national()"
          [attr.maxlength]="country().nationalLength"
          [placeholder]="placeholder"
          (input)="onInput($any($event.target).value)"
          (blur)="onBlur()" />

        @if (national().length > 0) {
          <span class="pi-mark" [class.pi-mark-ok]="isValid()" [class.pi-mark-bad]="!isValid()" aria-hidden="true">
            {{ isValid() ? '✓' : '✕' }}
          </span>
        }
      </div>
    </div>

    @if (touched() && national().length > 0 && !isValid()) {
      <span class="pi-help">Enter a valid {{ country().nationalLength }}-digit {{ country().label }} number.</span>
    }
  `,
  styleUrl: './phone-input.component.scss'
})
export class PhoneInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Mobile number';

  readonly countries: CountryCode[] = [
    { iso: 'IN', dialCode: '+91', label: 'India', flag: '🇮🇳', nationalLength: 10 },
    { iso: 'US', dialCode: '+1', label: 'USA', flag: '🇺🇸', nationalLength: 10 },
    { iso: 'GB', dialCode: '+44', label: 'UK', flag: '🇬🇧', nationalLength: 10 },
    { iso: 'AE', dialCode: '+971', label: 'UAE', flag: '🇦🇪', nationalLength: 9 },
    { iso: 'AU', dialCode: '+61', label: 'Australia', flag: '🇦🇺', nationalLength: 9 },
    { iso: 'SG', dialCode: '+65', label: 'Singapore', flag: '🇸🇬', nationalLength: 8 }
  ];

  protected readonly country = signal<CountryCode>(this.countries[0]);
  protected readonly national = signal<string>('');
  protected readonly touched = signal(false);
  protected readonly disabled = signal(false);

  protected readonly isValid = computed(
    () => this.national().length === this.country().nationalLength
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(raw: string): void {
    const digits = (raw || '').replace(/\D/g, '').slice(0, this.country().nationalLength);
    this.national.set(digits);
    this.emit();
  }

  onCountryChange(iso: string): void {
    const next = this.countries.find((c) => c.iso === iso) ?? this.countries[0];
    this.country.set(next);
    // Re-clamp existing digits to the new country's max length.
    this.national.set(this.national().slice(0, next.nationalLength));
    this.emit();
  }

  onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }

  private emit(): void {
    const value = this.national() ? `${this.country().dialCode}${this.national()}` : '';
    this.onChange(value);
  }

  // ControlValueAccessor
  writeValue(value: string | null): void {
    if (!value) {
      this.national.set('');
      return;
    }
    const match = this.countries.find((c) => value.startsWith(c.dialCode));
    if (match) {
      this.country.set(match);
      this.national.set(value.slice(match.dialCode.length).replace(/\D/g, '').slice(0, match.nationalLength));
    } else {
      this.national.set(value.replace(/\D/g, '').slice(0, this.country().nationalLength));
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
