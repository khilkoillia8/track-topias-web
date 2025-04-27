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

@Component({
  selector: 'app-register',
  imports: [
    InputText,
    ReactiveFormsModule,
    ButtonDirective,
    Panel,
    Password,
    ToastModule,
    NgClass,
    TooltipModule
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
    private messageService: MessageService
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
          this.messageService.add({
            severity: 'success',
            summary: 'Успішна реєстрація',
            detail: 'Ви успішно зареєструвалися. Тепер ви можете увійти.'
          });
          this.loginToggle.emit(true);
        },
        error: (error) => {
          console.error('Registration failed', error);
          let errorMsg = 'Помилка реєстрації. Будь ласка, спробуйте пізніше.';
          
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.message) {
            errorMsg = error.message;
          }
          
          this.messageService.add({
            severity: 'error',
            summary: 'Помилка реєстрації',
            detail: errorMsg
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
      return 'Нікнейм обов\'язковий';
    }
    if (this.username?.errors?.['minlength'] || this.username?.errors?.['maxlength']) {
      return 'Нікнейм має бути від 1 до 20 символів';
    }
    if (this.username?.errors?.['invalidFormat']) {
      return 'Дозволені лише літери, цифри, дефіс та нижнє підкреслення';
    }
    if (this.username?.errors?.['prohibitedWord']) {
      return 'Цей нікнейм містить заборонене слово';
    }
    return '';
  }
  
  getEmailErrorMessage(): string {
    if (this.email?.errors?.['required']) {
      return 'Email обов\'язковий';
    }
    if (this.email?.errors?.['email']) {
      return 'Введіть правильний email';
    }
    return '';
  }
  
  getPasswordErrorMessage(): string {
    if (this.password?.errors?.['required']) {
      return 'Пароль обов\'язковий';
    }
    if (this.password?.errors?.['minlength']) {
      return 'Пароль має містити мінімум 8 символів';
    }
    return '';
  }
  
  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.errors?.['required']) {
      return 'Підтвердження паролю обов\'язкове';
    }
    if (this.confirmPassword?.errors?.['passwordMismatch']) {
      return 'Паролі не співпадають';
    }
    return '';
  }
  
  shouldShowTooltip(field: AbstractControl | null): boolean {
    return !!field && field.invalid && (field.touched || this.submitted);
  }
}