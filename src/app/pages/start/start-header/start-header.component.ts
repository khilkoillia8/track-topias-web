import {Component, EventEmitter, Output, Input, OnInit} from '@angular/core';
import {PrimeTemplate} from "primeng/api";
import {ButtonDirective} from "primeng/button";
import {Menubar} from "primeng/menubar";
import {Ripple} from "primeng/ripple";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {TranslationService} from '../../../shared/i18n/translation.service';

@Component({
  selector: 'app-start-header',
  standalone: true,
  imports: [
    ButtonDirective,
    Menubar,
    PrimeTemplate,
    Ripple,
    TranslateModule,
    CommonModule
  ],
  templateUrl: './start-header.component.html',
  styleUrl: './start-header.component.css'
})
export class StartHeaderComponent implements OnInit {
  @Input() isLogin: boolean = true;
  @Output() loginToggle = new EventEmitter<boolean>();

  menuItems: any[] = [];
  currentLang: string = 'uk';

  constructor(
    private translateService: TranslateService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.translationService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.updateMenuItems();
    });
  }

  updateMenuItems(): void {
    this.translateService.get([
      'start.header.home',
      'start.header.about',
      'start.header.contacts',
      'start.header.support'
    ]).subscribe(translations => {
      this.menuItems = [
        { 
          label: translations['start.header.home'], 
          command: () => this.scrollTo('home')
        },
        { 
          label: translations['start.header.about'], 
          command: () => this.scrollTo('about')
        },
        { 
          label: translations['start.header.contacts'], 
          command: () => this.scrollTo('contacts')
        },
        { 
          label: translations['start.header.support'], 
          command: () => this.scrollTo('support')
        }
      ];
    });
  }

  onClick(): void {
    this.loginToggle.emit(this.isLogin);
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
  }

  getOtherLanguage(): string {
    return this.currentLang === 'uk' ? 'Українська' : 'English';
  }

  scrollTo(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
