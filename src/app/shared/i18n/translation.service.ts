import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLangSubject = new BehaviorSubject<string>('uk');
  public currentLang$ = this.currentLangSubject.asObservable();

  constructor(private translate: TranslateService) { 
    this.initLanguage();
  }

  private initLanguage(): void {
    const savedLang = localStorage.getItem('preferredLanguage');
    const defaultLang = savedLang || 'uk';
    
    this.translate.setDefaultLang('uk');
    this.setLanguage(defaultLang);
  }

  setLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('preferredLanguage', lang);
    this.currentLangSubject.next(lang);
  }

  getCurrentLang(): string {
    return this.currentLangSubject.value;
  }

  toggleLanguage(): void {
    const currentLang = this.getCurrentLang();
    const newLang = currentLang === 'uk' ? 'en' : 'uk';
    this.setLanguage(newLang);
  }
}
