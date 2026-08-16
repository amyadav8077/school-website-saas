import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PromoBox {
  label: string;
  color: string;
  icon?: string; // emoji fallback icon
}

export interface AdmissionsPromoConfig {
  promoEnabled?: boolean;
  promoVideoUrl?: string;
  promoPosterUrl?: string;
  promoLogo?: string;
  promoSchoolName?: string;
  promoTitle?: string;
  promoSubtitle?: string;
  promoProcessText?: string;
  promoRequirementsText?: string;
  promoRequirements?: string[];
  promoBoxes?: PromoBox[];
  promoPhone?: string;
  promoWebsite?: string;
  promoAccent?: string;
  promoCtaText?: string;
  promoCtaSlug?: string;
}

@Component({
  selector: 'app-admissions-promo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admissions-promo.component.html',
  styleUrl: './admissions-promo.component.scss',
})
export class AdmissionsPromoComponent {
  @Input() promo: AdmissionsPromoConfig = {};
  @Input() logo = '🎓';
  @Output() close = new EventEmitter<void>();
  @Output() cta = new EventEmitter<string>();

  private readonly defaultBoxes: PromoBox[] = [
    { label: 'Smart\nTechnology', color: '#8cc63f', icon: '⭐' },
    { label: 'Dynamic\nTeam Work', color: '#45b29d', icon: '⭐' },
    { label: 'Best\nQuality\nEducation', color: '#f39c12', icon: '👑' },
    { label: 'Creative\nLearning', color: '#45b29d', icon: '⭐' },
    { label: 'Advanced\nProgram', color: '#8cc63f', icon: '⭐' },
  ];

  private readonly defaultRequirements = [
    'Completed application form',
    'Birth certificate copy',
    'Previous academic records',
    'Passport-size photographs',
  ];

  get accent(): string {
    return this.promo.promoAccent || '#d95d41';
  }

  get boxes(): PromoBox[] {
    return this.promo.promoBoxes && this.promo.promoBoxes.length > 0
      ? this.promo.promoBoxes
      : this.defaultBoxes;
  }

  get requirements(): string[] {
    return this.promo.promoRequirements && this.promo.promoRequirements.length > 0
      ? this.promo.promoRequirements
      : this.defaultRequirements;
  }

  get isCenterBox(): (i: number, total: number) => boolean {
    return (i: number, total: number) => i === Math.floor(total / 2);
  }

  centerIndex(): number {
    return Math.floor(this.boxes.length / 2);
  }

  boxLines(label: string): string[] {
    return (label || '').split('\n');
  }

  onClose(): void {
    this.close.emit();
  }

  onCta(): void {
    this.cta.emit(this.promo.promoCtaSlug || 'admissions');
  }
}
