import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainHeaderComponent } from "../../shared/main-header/main-header.component";
import { StatisticsService } from '../../shared/statistics/services/statistics.service';
import { UserRatingDto } from '../../shared/statistics/models/statistics.model';
import { Subject, takeUntil } from 'rxjs';

import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ranking-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MainHeaderComponent,
    TableModule,
    CardModule,
    TabViewModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    TagModule,
    ProgressBarModule,
    AvatarModule,
    SkeletonModule,
    TranslateModule
  ],
  providers: [MessageService],
  templateUrl: './ranking-page.component.html',
  styleUrl: './ranking-page.component.css'
})
export class RankingPageComponent implements OnInit, OnDestroy {
  levelRatings: UserRatingDto[] = [];
  missionRatings: UserRatingDto[] = [];
  habitStreakRatings: UserRatingDto[] = [];
  habitCompletionRatings: UserRatingDto[] = [];
  
  filteredLevelRatings: UserRatingDto[] = [];
  filteredMissionRatings: UserRatingDto[] = [];
  filteredHabitStreakRatings: UserRatingDto[] = [];
  filteredHabitCompletionRatings: UserRatingDto[] = [];
  
  levelSearchQuery: string = '';
  missionSearchQuery: string = '';
  habitStreakSearchQuery: string = '';
  habitCompletionSearchQuery: string = '';
  
  loading = {
    level: false,
    missions: false,
    habitStreak: false,
    habitCompletions: false
  };
  
  currentUserId: number | null = null;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private statisticsService: StatisticsService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}
  
  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserId = user.id;
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
    
    this.loadAllRatings();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadAllRatings(): void {
    this.loadLevelRatings();
    this.loadMissionRatings();
    this.loadHabitStreakRatings();
    this.loadHabitCompletionRatings();
  }
  
  loadLevelRatings(): void {
    this.loading.level = true;
    this.statisticsService.getUserRatingsByLevel().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ratings) => {
        this.levelRatings = ratings;
        this.filteredLevelRatings = [...ratings];
        this.loading.level = false;
      },
      error: (err) => {
        this.translateService.get(['ranking.error-label', 'ranking.error.loadLevelRatings']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['ranking.error-label'],
            detail: translations['ranking.error.loadLevelRatings']
          });
        });
        console.error('Error loading level ratings', err);
        this.loading.level = false;
      }
    });
  }
  
  loadMissionRatings(): void {
    this.loading.missions = true;
    this.statisticsService.getUserRatingsByMissionsCompleted().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ratings) => {
        this.missionRatings = ratings;
        this.filteredMissionRatings = [...ratings];
        this.loading.missions = false;
      },
      error: (err) => {
        this.translateService.get(['ranking.error-label', 'ranking.error.loadMissionRatings']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['ranking.error-label'],
            detail: translations['ranking.error.loadMissionRatings']
          });
        });
        console.error('Error loading mission ratings', err);
        this.loading.missions = false;
      }
    });
  }
  
  loadHabitStreakRatings(): void {
    this.loading.habitStreak = true;
    this.statisticsService.getUserRatingsByMaxHabitStreak().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ratings) => {
        this.habitStreakRatings = ratings;
        this.filteredHabitStreakRatings = [...ratings];
        this.loading.habitStreak = false;
      },
      error: (err) => {
        this.translateService.get(['ranking.error-label', 'ranking.error.loadHabitStreakRatings']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['ranking.error-label'],
            detail: translations['ranking.error.loadHabitStreakRatings']
          });
        });
        console.error('Error loading habit streak ratings', err);
        this.loading.habitStreak = false;
      }
    });
  }
  
  loadHabitCompletionRatings(): void {
    this.loading.habitCompletions = true;
    this.statisticsService.getUserRatingsByHabitCompletions().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (ratings) => {
        this.habitCompletionRatings = ratings;
        this.filteredHabitCompletionRatings = [...ratings];
        this.loading.habitCompletions = false;
      },
      error: (err) => {
        this.translateService.get(['ranking.error-label', 'ranking.error.loadHabitCompletionRatings']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['ranking.error-label'],
            detail: translations['ranking.error.loadHabitCompletionRatings']
          });
        });
        console.error('Error loading habit completion ratings', err);
        this.loading.habitCompletions = false;
      }
    });
  }
  
  filterLevelRatings(): void {
    if (!this.levelSearchQuery.trim()) {
      this.filteredLevelRatings = [...this.levelRatings];
      return;
    }
    
    const query = this.levelSearchQuery.toLowerCase();
    this.filteredLevelRatings = this.levelRatings.filter(rating => 
      rating.username.toLowerCase().includes(query)
    );
  }
  
  filterMissionRatings(): void {
    if (!this.missionSearchQuery.trim()) {
      this.filteredMissionRatings = [...this.missionRatings];
      return;
    }
    
    const query = this.missionSearchQuery.toLowerCase();
    this.filteredMissionRatings = this.missionRatings.filter(rating => 
      rating.username.toLowerCase().includes(query)
    );
  }
  
  filterHabitStreakRatings(): void {
    if (!this.habitStreakSearchQuery.trim()) {
      this.filteredHabitStreakRatings = [...this.habitStreakRatings];
      return;
    }
    
    const query = this.habitStreakSearchQuery.toLowerCase();
    this.filteredHabitStreakRatings = this.habitStreakRatings.filter(rating => 
      rating.username.toLowerCase().includes(query)
    );
  }
  
  filterHabitCompletionRatings(): void {
    if (!this.habitCompletionSearchQuery.trim()) {
      this.filteredHabitCompletionRatings = [...this.habitCompletionRatings];
      return;
    }
    
    const query = this.habitCompletionSearchQuery.toLowerCase();
    this.filteredHabitCompletionRatings = this.habitCompletionRatings.filter(rating => 
      rating.username.toLowerCase().includes(query)
    );
  }
  
  getRankClass(rank: number): string {
    switch(rank) {
      case 1: return 'rank-first';
      case 2: return 'rank-second';
      case 3: return 'rank-third';
      default: return '';
    }
  }
  
  isCurrentUser(userId: number): boolean {
    return userId === this.currentUserId;
  }
}
