import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserPhotoService } from '../services/user-photo-service.service';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    FileUploadModule,
    ToastModule,
    TranslateModule
  ],
  providers: [MessageService],
  template: `
    <p-dialog [(visible)]="visible" 
              (visibleChange)="visibleChange.emit($event)"
              [header]="'photo.uploadTitle' | translate" 
              [modal]="true" 
              [style]="{width: '450px'}"
              [draggable]="false"
              [resizable]="false">
      <p-toast></p-toast>
      <div class="upload-container">
        <p class="mb-3">{{ 'photo.selectPrompt' | translate }}</p>
        <p class="small">{{ 'photo.sizeLimit' | translate }}</p>
        
        <p-fileUpload 
          #fileUpload
          mode="basic" 
          [auto]="false"
          chooseLabel="{{ 'photo.chooseButton' | translate }}"
          accept="image/*" 
          [maxFileSize]="5000000"
          (onSelect)="onFileSelect($event)"
          [disabled]="uploading">
        </p-fileUpload>
        
        <div *ngIf="selectedFile" class="selected-file mt-3">
          <div class="d-flex align-items-center">
            <i class="pi pi-image me-2"></i>
            <span>{{ selectedFile.name }}</span>
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton 
                [label]="'photo.uploadButton' | translate" 
                icon="pi pi-upload"
                [disabled]="!selectedFile || uploading"
                (click)="uploadPhoto()"
                [loading]="uploading">
        </button>
        <button pButton 
                [label]="'photo.cancelButton' | translate" 
                icon="pi pi-times" 
                class="p-button-secondary ms-2" 
                (click)="cancel()"
                [disabled]="uploading">
        </button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .upload-container {
      padding: 1rem 0;
    }
    
    .selected-file {
      padding: 0.5rem;
      background-color: var(--surface-ground);
      border-radius: 4px;
    }
    
    :host ::ng-deep .p-fileupload-buttonbar {
      background: transparent;
      border: none;
      padding: 0;
    }
    
    :host ::ng-deep .p-fileupload-content {
      display: none;
    }
  `]
})
export class PhotoUploadComponent {
  @Input() userId: number | null = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() photoUploaded = new EventEmitter<null>();
  @ViewChild('fileUpload') fileUpload: any;
  
  selectedFile: File | null = null;
  uploading = false;
  
  constructor(
    private userPhotoService: UserPhotoService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}
  
  onFileSelect(event: any): void {
    const files = event.files;
    if (files && files.length) {
      if (files[0].size > 5 * 1024 * 1024) {
        this.translateService.get(['photo.error.title', 'photo.error.fileSize']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['photo.error.title'],
            detail: translations['photo.error.fileSize']
          });
        });
        if (this.fileUpload) {
          this.fileUpload.clear();
        }
        return;
      }
      this.selectedFile = files[0];
    }
  }

  uploadPhoto(): void {
    if (!this.selectedFile || !this.userId) {
      return;
    }

    this.uploading = true;

    this.userPhotoService.uploadUserPhoto(this.userId, this.selectedFile).subscribe({
      next: () => {
        this.uploading = false;

        this.translateService.get(['photo.success.title', 'photo.success.message']).subscribe(translations => {
          this.messageService.add({
            severity: 'success',
            summary: translations['photo.success.title'],
            detail: translations['photo.success.message']
          });
        });
        this.photoUploaded.emit();
        this.closeDialog();
      },
      error: (error) => {
        this.uploading = false;
        this.translateService.get('photo.error.title').subscribe(title => {
          this.messageService.add({
            severity: 'error',
            summary: title,
            detail: error.message
          });
        });
      }
    });
  }
  
  cancel(): void {
    this.closeDialog();
  }
  
  private closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.selectedFile = null;
    if (this.fileUpload) {
      this.fileUpload.clear();
    }
  }
}
