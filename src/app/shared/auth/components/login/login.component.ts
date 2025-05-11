import { Component, EventEmitter, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { 
  AbstractControl, 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { Password } from 'primeng/password';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    InputText,
    ReactiveFormsModule,
    ButtonDirective,
    Panel,
    Password,
    NgClass,
    TooltipModule,
    ToastModule,
    TranslateModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @Output() registerClick = new EventEmitter<void>();
  loginForm: FormGroup;
  submitted = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.valid) {
      this.authService.signIn(this.loginForm.value).subscribe({
        next: (credentials) => {
          localStorage.setItem('jwtToken', credentials.token);
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Login failed', error);
          let errorMsg: string;
          
          this.translateService.get('login.error.defaultMessage').subscribe(message => {
            errorMsg = message;
          });
          
          if (error.error && error.error.message) {
            errorMsg = error.error.message;
          } else if (error.message) {
            errorMsg = error.message;
          }
          
          this.translateService.get('login.error.title').subscribe(title => {
            this.messageService.add({
              severity: 'error',
              summary: title,
              detail: errorMsg
            });
          });
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(field => {
        const control = this.loginForm.get(field);
        control?.markAsTouched();
      });
    }
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  getUsernameErrorMessage(): string {
    if (this.username?.errors?.['required']) {
      let message = '';
      this.translateService.get('login.error.usernameRequired').subscribe(msg => {
        message = msg;
      });
      return message;
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.errors?.['required']) {
      let message = '';
      this.translateService.get('login.error.passwordRequired').subscribe(msg => {
        message = msg;
      });
      return message;
    }
    return '';
  }

  shouldShowTooltip(field: AbstractControl | null): boolean {
    return !!field && field.invalid && (field.touched || this.submitted);
  }

  onRegisterClick(event: Event): void {
    event.preventDefault();
    this.registerClick.emit();
  }
}
