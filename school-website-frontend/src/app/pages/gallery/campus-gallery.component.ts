import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface GalleryItem {
  id: number;
  type: string; // PHOTO, VIDEO
  title: string;
  mediaUrl: string;
  category: string;
}

@Component({
  selector: 'app-campus-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ds-card ds-reveal cg-card">
      
      <div class="cg-header">
        <span [style.color]="accentColor" class="cg-eyebrow">Inside our Campus</span>
        <h3 [style.color]="primaryColor" class="ds-heading cg-heading">Experience Our Vibrant Campus Life</h3>
        <p class="cg-subtitle">Explore real highlights of our sports meets, STEM exhibitions, annual celebrations, and assemblies.</p>
      </div>

      <!-- Filter Category Tabs Bar -->
      <div class="cg-filter-bar">
        <button (click)="selectCategory('All')" 
          class="cg-filter-btn"
          [style.background-color]="activeCategory() === 'All' ? primaryColor : 'white'"
          [style.color]="activeCategory() === 'All' ? 'white' : '#475569'"
          [style.border-color]="activeCategory() === 'All' ? primaryColor : '#cbd5e1'">
          All Campus Life
        </button>
        @for (cat of categories(); track cat) {
          <button (click)="selectCategory(cat)" 
            class="cg-filter-btn"
            [style.background-color]="activeCategory() === cat ? primaryColor : 'white'"
            [style.color]="activeCategory() === cat ? 'white' : '#475569'"
            [style.border-color]="activeCategory() === cat ? primaryColor : '#cbd5e1'">
            {{ cat }}
          </button>
        }
      </div>

      <!-- Gallery Grid -->
      @if (filteredItems().length === 0) {
        <p class="cg-empty">No media items loaded in this category yet.</p>
      } @else {
        <div class="cg-grid">
          @for (item of filteredItems(); track item.id) {
            <div class="ds-card ds-card-hover cg-item">
              
              <!-- Media Frame -->
              <div class="cg-media-frame">
                @if (item.type === 'PHOTO') {
                  <img [src]="item.mediaUrl" alt="Campus event image" class="cg-media-img" />
                } @else {
                  <!-- Video Placeholder with play button overlay -->
                  <div (click)="playVideo(item)" class="cg-video-placeholder">
                    <span class="cg-play-icon" onmouseenter="this.style.transform='scale(1.15)'" onmouseleave="this.style.transform='scale(1)'">▶️</span>
                    <span class="cg-video-badge">VIDEO</span>
                  </div>
                }
              </div>

              <!-- Details Footer -->
              <div class="cg-details">
                <span [style.color]="accentColor" class="cg-category">{{ item.category }}</span>
                <strong class="cg-title">{{ item.title }}</strong>
              </div>

            </div>
          }
        </div>
      }

      <!-- Interactive Embedded Video Play Modal Overlay -->
      @if (activeVideoItem()) {
        <div class="cg-modal-overlay">
          <div class="cg-modal">
            
            <div class="cg-modal-header">
              <strong class="cg-modal-title">{{ activeVideoItem()?.title }}</strong>
              <button (click)="closeVideo()" class="cg-modal-close">×</button>
            </div>

            <!-- YouTube Safe Embedded Player Frame -->
            <div class="cg-video-wrapper">
              <iframe 
                [src]="getSafeUrl(activeVideoItem()!.mediaUrl)" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen
                class="cg-video-iframe">
              </iframe>
            </div>

            <div class="cg-modal-footer">
              <button (click)="closeVideo()" class="ds-btn cg-close-btn" [style.background-color]="primaryColor">
                Close Player
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `,
  styleUrl: './campus-gallery.component.scss'
})
export class CampusGalleryComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() primaryColor!: string;
  @Input() accentColor!: string;

  protected readonly galleryItems = signal<GalleryItem[]>([]);
  protected readonly filteredItems = signal<GalleryItem[]>([]);
  protected readonly categories = signal<string[]>([]);
  
  protected readonly activeCategory = signal<string>('All');
  protected readonly activeVideoItem = signal<GalleryItem | null>(null);

  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantId'] && this.tenantId) {
      this.fetchGallery();
    }
  }

  fetchGallery() {
    this.http.get<GalleryItem[]>(`http://localhost:8080/api/sites/${this.tenantId}/gallery`)
      .subscribe({
        next: (data) => {
          this.galleryItems.set(data);
          this.filteredItems.set(data);
          this.activeCategory.set('All');
          
          // Deduplicate unique categories
          const cats = Array.from(new Set(data.map(item => item.category)));
          this.categories.set(cats);
        },
        error: (err) => console.error(err)
      });
  }

  selectCategory(category: string) {
    this.activeCategory.set(category);
    if (category === 'All') {
      this.filteredItems.set(this.galleryItems());
    } else {
      const filtered = this.galleryItems().filter(item => item.category === category);
      this.filteredItems.set(filtered);
    }
  }

  playVideo(item: GalleryItem) {
    this.activeVideoItem.set(item);
  }

  closeVideo() {
    this.activeVideoItem.set(null);
  }

  private static readonly ALLOWED_EMBED_HOSTS = [
    'youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com',
    'player.vimeo.com', 'vimeo.com', 'drive.google.com'
  ];

  private isSafeEmbedUrl(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url, 'https://invalid.local');
      if (parsed.protocol !== 'https:') return false;
      const host = parsed.hostname.toLowerCase();
      return CampusGalleryComponent.ALLOWED_EMBED_HOSTS.some(h => host === h || host.endsWith('.' + h));
    } catch {
      return false;
    }
  }

  getSafeUrl(url: string): SafeResourceUrl {
    if (!this.isSafeEmbedUrl(url)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
