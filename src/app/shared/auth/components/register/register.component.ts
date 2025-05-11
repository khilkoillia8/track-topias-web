import { NgClass } from "@angular/common";
import { Component, EventEmitter, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import { ButtonDirective } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { Panel } from "primeng/panel";
import { Password } from "primeng/password";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { TooltipModule } from "primeng/tooltip";
import { AuthService } from "../../services/auth.service";
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    InputText,
    ReactiveFormsModule,
    ButtonDirective,
    Panel,
    Password,
    ToastModule,
    NgClass,
    TooltipModule,
    TranslateModule
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  @Output() loginClick = new EventEmitter<void>();
  @Output() loginToggle = new EventEmitter<boolean>();
  registerForm: FormGroup;
  submitted = false;
  errorMessage: string | null = null;
  
  private prohibitedWords = ['admin', 'root', 'system', 'moderator', 'superuser'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20),
        this.usernameValidator()
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  usernameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }
      
      const validCharactersPattern = /^[a-zA-Z0-9_-]+$/;
      const validFormat = validCharactersPattern.test(value);
      
      const containsProhibitedWord = this.prohibitedWords.some(word => 
        value.toLowerCase().includes(word));
      
      if (!validFormat) {
        return { invalidFormat: true };
      }
      
      if (containsProhibitedWord) {
        return { prohibitedWord: true };
      }
      
      return null;
    };
  }
  
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  onSubmit() {
    this.submitted = true;
    this.errorMessage = null;
    if (this.registerForm.valid) {
      this.authService.signUp(this.registerForm.value).subscribe({
        next: (credentials) => {
          this.translateService.get(['register.success.title', 'register.success.message']).subscribe(translations => {
            this.messageService.add({
              severity: 'success',
              summary: translations['register.success.title'],
              detail: translations['register.success.message']
            });
          });
          this.loginToggle.emit(true);
        },
        error: (error) => {
          console.error('Registration failed', error);
          
          let errorMsg: string;
          
          this.translateService.get('register.error.defaultMessage').subscribe(message => {
            errorMsg = message;
          });
          
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.message) {
            errorMsg = error.message;
          }
          
          this.translateService.get('register.error.title').subscribe(title => {
            this.messageService.add({
              severity: 'error',
              summary: title,
              detail: errorMsg
            });
          });
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(field => {
        const control = this.registerForm.get(field);
        control?.markAsTouched();
      });
    }
  }
  
  onLoginClick(event: Event): void {
    event.preventDefault();
    this.loginClick.emit();
  }
  
  get username() { return this.registerForm.get('username'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  
  getUsernameErrorMessage(): string {
    if (this.username?.errors?.['required']) {
      return this.translateService.instant('register.error.usernameRequired');
    }
    if (this.username?.errors?.['minlength'] || this.username?.errors?.['maxlength']) {
      return this.translateService.instant('register.error.usernameLength');
    }
    if (this.username?.errors?.['invalidFormat']) {
      return this.translateService.instant('register.error.usernameFormat');
    }
    if (this.username?.errors?.['prohibitedWord']) {
      return this.translateService.instant('register.error.usernameProhibited');
    }
    return '';
  }
  
  getEmailErrorMessage(): string {
    if (this.email?.errors?.['required']) {
      return this.translateService.instant('register.error.emailRequired');
    }
    if (this.email?.errors?.['email']) {
      return this.translateService.instant('register.error.emailInvalid');
    }
    return '';
  }
  
  getPasswordErrorMessage(): string {
    if (this.password?.errors?.['required']) {
      return this.translateService.instant('register.error.passwordRequired');
    }
    if (this.password?.errors?.['minlength']) {
      return this.translateService.instant('register.error.passwordLength');
    }
    return '';
  }
  
  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.errors?.['required']) {
      return this.translateService.instant('register.error.confirmRequired');
    }
    if (this.confirmPassword?.errors?.['passwordMismatch']) {
      return this.translateService.instant('register.error.passwordMismatch');
    }
    return '';
  }
  
  shouldShowTooltip(field: AbstractControl | null): boolean {
    return !!field && field.invalid && (field.touched || this.submitted);
  }
}
