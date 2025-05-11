import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MainHeaderComponent } from '../../shared/main-header/main-header.component';
import { HabitInstanceService } from '../../shared/habit-instance/services/habit-instance.service';
import { HabitInstanceDto } from '../../shared/habit-instance/models/habit-instance.model';
import { HabitService } from '../../shared/habit/services/habit.service';
import { HabitDto } from '../../shared/habit/models/habit.model';
import { RouterLink } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-habit-instances-page',
  standalone: true,
  imports: [
    MainHeaderComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    DropdownModule,
    TableModule,
    ToastModule,
    BadgeModule,
    TagModule,
    ToolbarModule,
    TranslateModule
  ],
  providers: [MessageService],
  templateUrl: './habit-instances-page.component.html',
  styleUrl: './habit-instances-page.component.css'
})
export class HabitInstancesPageComponent implements OnInit, OnDestroy {
  habitInstances: HabitInstanceDto[] = [];
  habits: HabitDto[] = [];
  loading = false;
  
  selectedDate: Date = new Date();
  selectedHabitId: number | null = null;
  showCompleted = true;
  showPending = true;
  searchQuery: string = '';
  
  weekdaysMap: {[key: string]: string} = {};
  
  private destroy$ = new Subject<void>();

  constructor(
    private habitInstanceService: HabitInstanceService,
    private habitService: HabitService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.initTranslations();
    this.loadHabits();
    this.loadHabitInstances();
  }

  initTranslations() {
    this.translateService.get([
      'habitsTracking.weekdays.monday',
      'habitsTracking.weekdays.tuesday',
      'habitsTracking.weekdays.wednesday',
      'habitsTracking.weekdays.thursday',
      'habitsTracking.weekdays.friday',
      'habitsTracking.weekdays.saturday',
      'habitsTracking.weekdays.sunday'
    ]).subscribe(translations => {
      this.weekdaysMap = {
        'monday': translations['habitsTracking.weekdays.monday'],
        'tuesday': translations['habitsTracking.weekdays.tuesday'],
        'wednesday': translations['habitsTracking.weekdays.wednesday'],
        'thursday': translations['habitsTracking.weekdays.thursday'],
        'friday': translations['habitsTracking.weekdays.friday'],
        'saturday': translations['habitsTracking.weekdays.saturday'],
        'sunday': translations['habitsTracking.weekdays.sunday']
      };
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHabits() {
    this.habitService.getAllHabits()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (habits) => {
          this.habits = habits;
        },
        error: (err) => {
          this.translateService.get(['habitsTracking.error', 'habitsTracking.error.loadHabits']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['habitsTracking.error'],
              detail: translations['habitsTracking.error.loadHabits']
            });
          });
          console.error('Error loading habits', err);
        }
      });
  }

  loadHabitInstances() {
    this.loading = true;
    
    let observable;
    
    if (this.selectedDate) {
      observable = this.habitInstanceService.getInstancesByDate(this.selectedDate);
    } else {
      observable = this.habitInstanceService.getUserInstances();
    }
    
    observable.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (instances) => {
          let filteredInstances = instances;
          
          if (this.selectedHabitId) {
            filteredInstances = filteredInstances.filter(
              instance => instance.habitId === this.selectedHabitId
            );
          }
          
          if (!this.showCompleted) {
            filteredInstances = filteredInstances.filter(
              instance => !instance.completed
            );
          }
          
          if (!this.showPending) {
            filteredInstances = filteredInstances.filter(
              instance => instance.completed
            );
          }
          
          if (this.searchQuery) {
            const lowerQuery = this.searchQuery.toLowerCase();
            filteredInstances = filteredInstances.filter(instance => {
              const habit = this.habits.find(h => h.id === instance.habitId);
              return (
                habit?.title?.toLowerCase().includes(lowerQuery) || 
                habit?.description?.toLowerCase().includes(lowerQuery) ||
                instance.date?.toString().toLowerCase().includes(lowerQuery)
              );
            });
          }
          
          this.habitInstances = filteredInstances;
          this.loading = false;
        },
        error: (err) => {
          this.translateService.get(['habitsTracking.error', 'habitsTracking.error.loadInstances']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['habitsTracking.error'],
              detail: translations['habitsTracking.error.loadInstances']
            });
          });
          console.error('Error loading habit instances', err);
          this.loading = false;
        }
      });
  }

  applyFilters() {
    this.loadHabitInstances();
  }

  resetFilters() {
    this.selectedDate = new Date();
    this.selectedHabitId = null;
    this.showCompleted = true;
    this.showPending = true;
    this.searchQuery = '';
    this.loadHabitInstances();
  }

  toggleInstanceComplete(instance: HabitInstanceDto) {
    if (instance.completed) {
      return;
    }
    
    this.habitInstanceService.completeInstance(instance.id).subscribe({
      next: (updatedInstance) => {
        const index = this.habitInstances.findIndex(i => i.id === instance.id);
        if (index !== -1) {
          this.habitInstances[index] = updatedInstance;
        }
        
        if (instance.habitId) {
          this.habitService.updateHabitStreak(instance.habitId).subscribe();
        }
        
        this.translateService.get(['habitsTracking.success', 'habitsTracking.success.habitCompleted']).subscribe(translations => {
          this.messageService.add({
            severity: 'success',
            summary: translations['habitsTracking.success'],
            detail: translations['habitsTracking.success.habitCompleted']
          });
        });
      },
      error: (err) => {
        this.translateService.get(['habitsTracking.error', 'habitsTracking.error.updateStatus']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['habitsTracking.error'],
            detail: translations['habitsTracking.error.updateStatus']
          });
        });
        console.error('Error updating habit instance status', err);
      }
    });
  }

  getHabitTitle(habitId: number): string {
    const habit = this.habits.find(h => h.id === habitId);
    return habit ? habit.title : this.translateService.instant('habitsTracking.unknownHabit');
  }
  
  getHabitDescription(habitId: number): string | null {
    const habit = this.habits.find(h => h.id === habitId);
    return habit ? habit.description : null;
  }
  
  getHabitWeekdays(habitId: number): string[] {
    const habit = this.habits.find(h => h.id === habitId);
    return habit ? habit.weekdays || [] : [];
  }
  
  formatWeekdays(weekdays: string[]): string {
    if (!weekdays || weekdays.length === 0) {
      return this.translateService.instant('habitsTracking.notSpecified');
    }
    
    return weekdays.map(day => this.translateService.instant(`habitsTracking.weekdays.short.${day}`) || day).join(', ');
  }
  
  getStreakInfo(habitId: number): string {
    const habit = this.habits.find(h => h.id === habitId);
    if (habit && habit.streak) {
      return this.translateService.instant('habitsTracking.streakInfo', {
        current: habit.streak.currentStreak,
        best: habit.streak.bestStreak
      });
    }
    return this.translateService.instant('habitsTracking.noData');
  }

  regenerateInstances() {
    this.loading = true;

    const promises = this.habits.map(habit => 
      this.habitService.regenerateHabitInstances(habit.id).toPromise()
    );
    
    Promise.all(promises)
      .then(() => {
        this.loadHabitInstances();
        this.translateService.get(['habitsTracking.success', 'habitsTracking.success.instancesUpdated']).subscribe(translations => {
          this.messageService.add({
            severity: 'success',
            summary: translations['habitsTracking.success'],
            detail: translations['habitsTracking.success.instancesUpdated']
          });
        });
      })
      .catch(err => {
        this.translateService.get(['habitsTracking.error', 'habitsTracking.error.regenerate']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['habitsTracking.error'],
            detail: translations['habitsTracking.error.regenerate']
          });
        });
        console.error('Error regenerating habit instances', err);
        this.loading = false;
      });
  }
  
  getFrequencyLabel(habitId: number): string {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit || !habit.weekdays || habit.weekdays.length === 0) {
      return this.translateService.instant('habitsTracking.notSpecified');
    }

    switch(habit.weekdays.length) {
      case 1: case 2: return this.translateService.instant('habitsTracking.frequency.easy');
      case 3: case 4: case 5: return this.translateService.instant('habitsTracking.frequency.medium');
      case 6: case 7: return this.translateService.instant('habitsTracking.frequency.hard');
      default: return this.translateService.instant('habitsTracking.frequency.undefined');
    }
  }
  
  getFrequencyClass(habitId: number): string {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit || !habit.weekdays || habit.weekdays.length === 0) return 'info';

    switch(habit.weekdays.length) {
      case 1: case 2: return 'success';
      case 3: case 4: case 5: return 'warning';
      case 6: case 7: return 'danger';
      default: return 'info';
    }
  }
  
  search() {
    this.loadHabitInstances();
  }
}
