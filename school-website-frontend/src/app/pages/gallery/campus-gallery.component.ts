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
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2.5rem; max-width: 1200px; margin: 2rem auto; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      
      <div style="text-align: center; margin-bottom: 2.5rem;">
        <span [style.color]="accentColor" style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem;">Inside our Campus</span>
        <h3 [style.color]="primaryColor" style="font-size: 2rem; font-weight: 800; margin: 0; letter-spacing: -0.025em; line-height: 1.2;">Experience Our Vibrant Campus Life</h3>
        <p style="color: #64748b; font-size: 0.95rem; margin-top: 0.5rem; margin-bottom: 0;">Explore real highlights of our sports meets, STEM exhibitions, annual celebrations, and assemblies.</p>
      </div>

      <!-- Filter Category Tabs Bar -->
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
        <button (click)="selectCategory('All')" 
          style="border: 1px solid #cbd5e1; padding: 0.45rem 1rem; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;"
          [style.background-color]="activeCategory() === 'All' ? primaryColor : 'white'"
          [style.color]="activeCategory() === 'All' ? 'white' : '#475569'"
          [style.border-color]="activeCategory() === 'All' ? primaryColor : '#cbd5e1'">
          All Campus Life
        </button>
        @for (cat of categories(); track cat) {
          <button (click)="selectCategory(cat)" 
            style="border: 1px solid #cbd5e1; padding: 0.45rem 1rem; border-radius: 9999px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;"
            [style.background-color]="activeCategory() === cat ? primaryColor : 'white'"
            [style.color]="activeCategory() === cat ? 'white' : '#475569'"
            [style.border-color]="activeCategory() === cat ? primaryColor : '#cbd5e1'">
            {{ cat }}
          </button>
        }
      </div>

      <!-- Gallery Grid -->
      @if (filteredItems().length === 0) {
        <p style="text-align: center; color: #64748b; font-style: italic;">No media items loaded in this category yet.</p>
      } @else {
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
          @for (item of filteredItems(); track item.id) {
            <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
              
              <!-- Media Frame -->
              <div style="position: relative; width: 100%; height: 160px; background: #e2e8f0; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                @if (item.type === 'PHOTO') {
                  <img [src]="item.mediaUrl" alt="Campus event image" style="width: 100%; height: 100%; object-fit: cover;" />
                } @else {
                  <!-- Video Placeholder with play button overlay -->
                  <div (click)="playVideo(item)" style="width: 100%; height: 100%; cursor: pointer; position: relative; background: #0f172a; display: flex; align-items: center; justify-content: center; color: white;">
                    <span style="font-size: 3rem; opacity: 0.85; text-shadow: 0 2px 4px rgba(0,0,0,0.5); transition: transform 0.2s;" onmouseenter="this.style.transform='scale(1.15)'" onmouseleave="this.style.transform='scale(1)'">▶️</span>
                    <span style="position: absolute; bottom: 0.5rem; left: 0.5rem; background: rgba(15, 23, 42, 0.75); color: white; padding: 0.15rem 0.40rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700;">VIDEO</span>
                  </div>
                }
              </div>

              <!-- Details Footer -->
              <div style="padding: 1rem; border-top: 1px solid #e2e8f0;">
                <span [style.color]="accentColor" style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.25rem;">{{ item.category }}</span>
                <strong style="color: #0f172a; font-size: 0.95rem; line-height: 1.3; display: block;">{{ item.title }}</strong>
              </div>

            </div>
          }
        </div>
      }

      <!-- Interactive Embedded Video Play Modal Overlay -->
      @if (activeVideoItem()) {
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.75); display: flex; align-items: center; justify-content: center; z-index: 999999; backdrop-filter: blur(2px);">
          <div style="background: white; border-radius: 12px; width: 100%; max-width: 600px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #cbd5e1; box-sizing: border-box; padding: 1.5rem;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
              <strong style="font-size: 1.15rem; color: #0f172a;">{{ activeVideoItem()?.title }}</strong>
              <button (click)="closeVideo()" style="background: none; border: 0; font-size: 1.5rem; cursor: pointer; color: #64748b; font-weight: 700;">×</button>
            </div>

            <!-- YouTube Safe Embedded Player Frame -->
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 6px; background: #000;">
              <iframe 
                [src]="getSafeUrl(activeVideoItem()!.mediaUrl)" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
              </iframe>
            </div>

            <div style="margin-top: 1rem; text-align: right;">
              <button (click)="closeVideo()" [style.background-color]="primaryColor" style="color: white; border: 0; padding: 0.55rem 1.25rem; border-radius: 6px; font-weight: 700; cursor: pointer;">
                Close Player
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
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

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
