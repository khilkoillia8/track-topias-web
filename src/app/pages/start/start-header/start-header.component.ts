import {Component, EventEmitter, Output, Input} from '@angular/core';
import {PrimeTemplate} from "primeng/api";
import {ButtonDirective} from "primeng/button";
import {Menubar} from "primeng/menubar";
import {Ripple} from "primeng/ripple";

@Component({
  selector: 'app-start-header',
  imports: [
    ButtonDirective,
    Menubar,
    PrimeTemplate,
    Ripple
  ],
  templateUrl: './start-header.component.html',
  styleUrl: './start-header.component.css'
})
export class StartHeaderComponent {
  @Input() isLogin: boolean = true;
  @Output() loginToggle = new EventEmitter<boolean>();

  menuItems = [
    { label: 'Головна', routerLink: '/' },
    { label: 'Про нас', routerLink: '/about' },
    { label: 'Контакти', routerLink: '/contacts' },
    { label: 'Підтримка', routerLink: '/support' }
  ];

  onClick(): void {
    this.loginToggle.emit(this.isLogin);
  }
}
