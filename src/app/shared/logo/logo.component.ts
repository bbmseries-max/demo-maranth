import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="wrapperClasses">
      
      <!-- Vector Emblem -->
      <svg 
        [class]="svgClasses" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg">
        <!-- Outer M in Navy / Slate -->
        <path d="M 15 80 L 15 35 L 38 60 L 50 48 L 62 60 L 85 30 L 85 80" 
              stroke="currentColor" 
              stroke-width="9" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              class="text-slate-900 dark:text-slate-100"/>
        
        <!-- Inner Cyan Circuit Path with Arrow -->
        <path d="M 22 70 L 22 45 L 38 62 L 50 50 L 78 22" 
              stroke="#0EA5E9" 
              stroke-width="6" 
              stroke-linecap="round" 
              stroke-linejoin="round"/>
        
        <!-- Arrowhead -->
        <path d="M 68 20 L 82 20 L 82 34" 
              stroke="#0EA5E9" 
              stroke-width="6" 
              stroke-linecap="round" 
              stroke-linejoin="round"/>
        
        <!-- Circuit Nodes -->
        <circle cx="22" cy="70" r="4" fill="#0EA5E9"/>
        <circle cx="50" cy="50" r="4" fill="#0EA5E9"/>
        <circle cx="65" cy="35" r="4" fill="#0EA5E9"/>
      </svg>

      <!-- Logo Typography (hidden in icon-only mode) -->
      @if (variant !== 'icon-only') {
        <div class="text-left leading-none">
          <span [class]="titleClasses">Maranth</span>
          
          @if (variant === 'full') {
            <span [class]="subtitleClasses">
              SOFTWARE | SERVICES | POS
            </span>
          }
        </div>
      }

    </div>
  `
})
export class LogoComponent {
  
  /** 'full' (with subtitle), 'compact' (title only), or 'icon-only' */
  @Input() variant: 'full' | 'compact' | 'icon-only' = 'full';
  
  /** 'sm', 'md', or 'lg' scaling */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /** Dark or light mode adjustments */
  @Input() darkText: boolean = false;

  get wrapperClasses(): string {
    return 'inline-flex items-center gap-3 select-none';
  }

  get svgClasses(): string {
    switch (this.size) {
      case 'sm': return 'w-6 h-6';
      case 'lg': return 'w-12 h-12';
      case 'md':
      default: return 'w-9 h-9';
    }
  }

  get titleClasses(): string {
    const textColor = this.darkText ? 'text-slate-900' : 'text-main';
    switch (this.size) {
      case 'sm': return `text-base font-black tracking-tight block ${textColor}`;
      case 'lg': return `text-3xl font-black tracking-tight block ${textColor}`;
      case 'md':
      default: return `text-2xl font-black tracking-tight block ${textColor}`;
    }
  }

  get subtitleClasses(): string {
    switch (this.size) {
      case 'sm': return 'text-[7px] font-black uppercase tracking-[0.2em] text-brand block mt-0.5';
      case 'lg': return 'text-[11px] font-black uppercase tracking-[0.22em] text-brand block mt-1.5';
      case 'md':
      default: return 'text-[9px] font-black uppercase tracking-[0.22em] text-brand block mt-1';
    }
  }
}