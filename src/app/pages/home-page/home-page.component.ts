import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrimeTemplate, MessageService } from "primeng/api";
import { Level } from "../../shared/auth/models/level.model";
import { MainHeaderComponent } from "../../shared/main-header/main-header.component";
import { AuthService } from '../../shared/auth/services/auth.service';
import { User } from '../../shared/auth/models/auth.model';
import { Card } from 'primeng/card';
import { MissionService } from '../../shared/mission/services/mission.service';
import { HabitService } from '../../shared/habit/services/habit.service';
import { MissionDto, MissionCreationDto } from '../../shared/mission/models/mission.model';
import { HabitDto, HabitCreationDto } from '../../shared/habit/models/habit.model';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { UserService } from '../../shared/auth/services/user-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MainHeaderComponent,
    Card,
    PrimeTemplate,
    CommonModule,
    ToastModule,
    CheckboxModule,
    ProgressBarModule
  ],
  providers: [MessageService],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit, OnDestroy {
  user: User | null = null;
  todayMissions: MissionDto[] = [];
  todayHabits: HabitDto[] = [];
  userLevel: Level | null = null;
  loading = {
    level: false
  };
  private destroy$ = new Subject<void>();
  
  constructor(
    private authService: AuthService,
    private missionService: MissionService,
    private habitService: HabitService,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.authService.user$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.user = user;
      if (user && user.id) {
        this.loadUserLevel(user.id);
      }
    });
    
    this.loadTodaysTasks();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadUserLevel(userId: number) {
    this.userService.getLevelByUserId(userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (level) => {
        this.userLevel = level;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Помилка',
          detail: 'Не вдалося завантажити рівень користувача'
        });
        console.error('Error loading user level', err);
      }
    });
  }

  loadTodaysTasks() {
    this.loadTodaysMissions();
    this.loadTodaysHabits();
  }
  
  loadTodaysMissions() {
    this.missionService.getAllMissions().subscribe({
      next: (missions) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        this.todayMissions = missions.filter(mission => {
          const missionDate = new Date(mission.dueDate);
          missionDate.setHours(0, 0, 0, 0);
          return missionDate.getTime() === today.getTime();
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Помилка',
          detail: 'Не вдалося завантажити завдання'
        });
        console.error('Error loading missions', err);
      }
    });
  }
  
  loadTodaysHabits() {
    this.habitService.getAllHabits().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (habits) => {
        const today = new Date();
        const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        
        this.todayHabits = habits.filter(habit => 
          habit.weekdays && habit.weekdays.includes(dayOfWeek)
        );
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
  
  toggleMissionComplete(mission: MissionDto) {
    mission.completed = !mission.completed;
    
    const updatedMission: MissionCreationDto = {
      title: mission.title,
      description: mission.description,
      dueDate: mission.dueDate,
      priority: mission.priority,
      completed: mission.completed
    };

    this.missionService.updateMission(mission.id, updatedMission).subscribe({
      next: () => {
        if (this.user && this.user.id) {
          this.loadUserLevel(this.user.id);
        }
      },
      error: (err) => {
        mission.completed = !mission.completed;
        this.messageService.add({
          severity: 'error',
          summary: 'Помилка',
          detail: 'Не вдалося оновити статус завдання'
        });
        console.error('Error updating mission status', err);
      }
    });
  }
  
  toggleHabitComplete(habit: HabitDto) {
    habit.completed = !habit.completed;
    
    const updatedHabit: HabitCreationDto = {
      title: habit.title,
      description: habit.description,
      weekdays: habit.weekdays,
      completed: habit.completed
    };
    
    this.habitService.updateHabit(habit.id, updatedHabit).subscribe({
      next: () => {
        if (this.user && this.user.id) {
          this.loadUserLevel(this.user.id);
        }
      },
      error: (err) => {
        habit.completed = !habit.completed;
        this.messageService.add({
          severity: 'error',
          summary: 'Помилка',
          detail: 'Не вдалося оновити статус звички'
        });
        console.error('Error updating habit status', err);
      }
    });
  }
  
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
  
  getProgressPercentage(): number {
    if (this.userLevel && this.userLevel.scoreToNextLevel > 0) {
      return (this.userLevel.score / this.userLevel.scoreToNextLevel) * 100;
    }
    return 0;
  }
}
