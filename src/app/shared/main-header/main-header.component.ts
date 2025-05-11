import {Component} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {PrimeTemplate} from "primeng/api";
import {ButtonDirective} from "primeng/button";
import {Menubar} from "primeng/menubar";
import {Ripple} from "primeng/ripple";

@Component({
  selector: 'app-main-header',
  imports: [
    ButtonDirective,
    Menubar,
    PrimeTemplate,
    Ripple,
    RouterLink
  ],
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.css'
})
export class MainHeaderComponent {
  constructor(private router: Router) {
  }

  menuItems = [
    {label: 'Головна', routerLink: '/home'},
    {label: 'Завдання', routerLink: '/task'},
    {label: 'Відстеження звичок', routerLink: '/habit-instances'},
    {label: 'Соціальність', routerLink: '/social'},
    {label: 'Рейтинг', routerLink: '/ranking'}
  ];

  onClick() {
    localStorage.removeItem('jwtToken');
    this.router.navigate(['/start']);
  }
}
