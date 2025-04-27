import { Component } from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {Card} from "primeng/card";
import {RegisterComponent} from "../../../shared/auth/components/register/register.component";
import {LoginComponent} from "../../../shared/auth/components/login/login.component";
import {StartHeaderComponent} from "../start-header/start-header.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-start-page',
  imports: [
    StartHeaderComponent,
    RegisterComponent,
    LoginComponent,
    Card,
    ButtonDirective,
    NgIf
  ],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.css'
})
export class StartPageComponent {
  showLogin = false;
  
  toggleForm(showLogin: boolean): void {
    this.showLogin = showLogin;
  }
}
