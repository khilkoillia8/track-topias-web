import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { UserPhotoService } from '../services/user-photo-service.service';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule, AvatarModule],
  template: `
    <div class="user-avatar-container">
      <img *ngIf="photoUrl && !loading" 
           [src]="photoUrl" 
           [alt]="username"
           class="user-photo" 
           [ngClass]="size" 
           (error)="handlePhotoError()" />
      
      <p-avatar *ngIf="!photoUrl && !loading" 
                icon="pi pi-user" 
                [size]="size" 
                [style]="{'background-color': isCurrentUser ? 'var(--primary-color)' : '#4169e1'}" 
                shape="circle">
      </p-avatar>
      
      <div *ngIf="loading" class="avatar-loading" [ngClass]="size">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
    </div>
  `,
  styles: [`
    .user-avatar-container {
      display: inline-block;
      position: relative;
    }
    
    .user-photo {
      border-radius: 50%;
      object-fit: cover;
      display: inline-block;
      background-color: var(--surface-card);
    }
    
    .user-photo.normal {
      width: 2.5rem;
      height: 2.5rem;
    }
    
    .user-photo.large {
      width: 3rem;
      height: 3rem;
    }
    
    .user-photo.xlarge {
      width: 4rem;
      height: 4rem;
    }
    
    .avatar-loading {
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #e9ecef;
    }
    
    .avatar-loading.normal {
      width: 2.5rem;
      height: 2.5rem;
    }
    
    .avatar-loading.large {
      width: 3rem;
      height: 3rem;
    }
    
    .avatar-loading.xlarge {
      width: 4rem;
      height: 4rem;
    }
    
    .avatar-loading i {
      color: #6c757d;
      font-size: 1rem;
    }
    
    .avatar-loading.large i {
      font-size: 1.25rem;
    }
    
    .avatar-loading.xlarge i {
      font-size: 1.5rem;
    }
  `]
})
export class UserAvatarComponent implements OnInit, OnChanges {
  @Input() userId!: number;
  @Input() username: string = '';
  @Input() size: 'normal' | 'large' | 'xlarge' = 'normal';
  @Input() isCurrentUser: boolean = false;
  
  photoUrl: SafeUrl | null = null;
  loading: boolean = false;
  
  constructor(private userPhotoService: UserPhotoService) {}
  
  ngOnInit(): void {
    this.loadUserPhoto();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && !changes['userId'].firstChange) {
      this.loadUserPhoto();
    }
  }
  
  loadUserPhoto(): void {
    if (!this.userId) {
      return;
    }
    
    this.loading = true;
    this.userPhotoService.getUserPhotoUrl(this.userId).subscribe({
      next: (url) => {
        this.photoUrl = url;
        this.loading = false;
      },
      error: () => {
        this.photoUrl = null;
        this.loading = false;
      }
    });
  }
  
  handlePhotoError(): void {
    this.photoUrl = null;
  }
}
