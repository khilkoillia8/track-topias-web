import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {PrimeTemplate} from "primeng/api";
import {ButtonDirective} from "primeng/button";
import {Menubar} from "primeng/menubar";
import {Ripple} from "primeng/ripple";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {TranslationService} from '../i18n/translation.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [
    ButtonDirective,
    Menubar,
    PrimeTemplate,
    Ripple,
    RouterLink,
    TranslateModule,
    CommonModule
  ],
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.css'
})
export class MainHeaderComponent implements OnInit {
  menuItems: any[] = [];
  currentLang: string = 'uk';
  
  constructor(
    private router: Router,
    private translationService: TranslationService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      console.log(lang)
      this.updateMenuItems();
    });
  }

  updateMenuItems() {
    this.translateService.get([
      'header.home',
      'header.tasks',
      'header.habitTracking',
      'header.social',
      'header.ranking'
    ]).subscribe(translations => {
      this.menuItems = [
        {label: translations['header.home'], routerLink: '/home'},
        {label: translations['header.tasks'], routerLink: '/task'},
        {label: translations['header.habitTracking'], routerLink: '/habit-instances'},
        {label: translations['header.social'], routerLink: '/social'},
        {label: translations['header.ranking'], routerLink: '/ranking'}
      ];
    });
  }


  onClick() {
    localStorage.removeItem('jwtToken');
    this.router.navigate(['/start']);
  }

  toggleLanguage() {
    this.translationService.toggleLanguage();
  }

  getOtherLanguage(): string {
    return this.currentLang === 'uk' ? 'Українська' : 'English';
  }
}
