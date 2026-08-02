import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" (click)="toastService.dismiss(toast.id)">
          <span class="toast-icon">{{ (toast.type === 'success') ? '✓' : (toast.type === 'error') ? '✕' : 'ℹ' }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.dismiss(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border-radius: 12px;
      min-width: 280px;
      max-width: 420px;
      color: #fff;
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      font-size: 0.95rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      cursor: pointer;
      pointer-events: all;
      animation: slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    .toast-success { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .toast-error   { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .toast-info    { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .toast-icon {
      font-size: 1.1rem;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      flex-shrink: 0;
    }
    .toast-message { flex: 1; line-height: 1.3; }
    .toast-close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.7);
      font-size: 1.2rem;
      cursor: pointer;
      line-height: 1;
      padding: 0;
      flex-shrink: 0;
    }
    .toast-close:hover { color: #fff; }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(60px) scale(0.9); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
