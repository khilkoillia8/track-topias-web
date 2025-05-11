import { Component } from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {Card} from "primeng/card";
import {RegisterComponent} from "../../../shared/auth/components/register/register.component";
import {LoginComponent} from "../../../shared/auth/components/login/login.component";
import {StartHeaderComponent} from "../start-header/start-header.component";
import {CommonModule} from "@angular/common";
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [
    StartHeaderComponent,
    RegisterComponent,
    LoginComponent,
    Card,
    ButtonDirective,
    CommonModule,
    TranslateModule
  ],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.css'
})
export class StartPageComponent {
  showLogin = false;
  
  toggleForm(showLogin: boolean): void {
    this.showLogin = showLogin;
  }
  
  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
