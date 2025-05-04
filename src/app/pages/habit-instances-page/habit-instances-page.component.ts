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
    ToolbarModule
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
  
  private destroy$ = new Subject<void>();

  constructor(
    private habitInstanceService: HabitInstanceService,
    private habitService: HabitService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadHabits();
    this.loadHabitInstances();
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
          this.messageService.add({
            severity: 'error',
            summary: 'Помилка',
            detail: 'Не вдалося завантажити звички'
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
          this.messageService.add({
            severity: 'error',
            summary: 'Помилка',
            detail: 'Не вдалося завантажити екземпляри звичок'
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
        
        this.messageService.add({
          severity: 'success',
          summary: 'Успішно',
          detail: 'Звичку позначено як виконану'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Помилка',
          detail: 'Не вдалося оновити статус екземпляра звички'
        });
        console.error('Error updating habit instance status', err);
      }
    });
  }

  getHabitTitle(habitId: number): string {
    const habit = this.habits.find(h => h.id === habitId);
    return habit ? habit.title : 'Невідома звичка';
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
    if (!weekdays || weekdays.length === 0) return 'Не вказано';
    
    const daysMap: {[key: string]: string} = {
      'monday': 'Пн',
      'tuesday': 'Вт',
      'wednesday': 'Ср',
      'thursday': 'Чт',
      'friday': 'Пт',
      'saturday': 'Сб',
      'sunday': 'Нд'
    };
    
    return weekdays.map(day => daysMap[day] || day).join(', ');
  }
  
  getStreakInfo(habitId: number): string {
    const habit = this.habits.find(h => h.id === habitId);
    return habit && habit.streak ? 
      `${habit.streak.currentStreak} днів (найкращий: ${habit.streak.bestStreak})` : 
      'Немає даних';
  }

  regenerateInstances() {
    this.loading = true;

    const promises = this.habits.map(habit => 
      this.habitService.regenerateHabitInstances(habit.id).toPromise()
    );
    
    Promise.all(promises)
      .then(() => {
        this.loadHabitInstances();
        this.messageService.add({
          severity: 'success',
          summary: 'Успішно',
          detail: 'Екземпляри звичок успішно оновлено'
        });
      })
      .catch(err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Помилка',
          detail: 'Не вдалося оновити екземпляри звичок'
        });
        console.error('Error regenerating habit instances', err);
        this.loading = false;
      });
  }
  
  getFrequencyLabel(habitId: number): string {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit || !habit.weekdays || habit.weekdays.length === 0) return 'Не вказано';

    switch(habit.weekdays.length) {
      case 1: case 2: return 'Легко';
      case 3: case 4: case 5: return 'Середньо';
      case 6: case 7: return 'Складно';
      default: return 'Не визначено';
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
