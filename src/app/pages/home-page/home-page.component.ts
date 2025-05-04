import {CommonModule} from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {BaseChartDirective} from "ng2-charts";
import {MessageService, PrimeTemplate} from "primeng/api";
import {Card} from 'primeng/card';
import {CheckboxModule} from 'primeng/checkbox';
import {ProgressBarModule} from 'primeng/progressbar';
import {ToastModule} from 'primeng/toast';
import {forkJoin, Subject, switchMap} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {User} from '../../shared/auth/models/auth.model';
import {Level} from "../../shared/auth/models/level.model";
import {AuthService} from '../../shared/auth/services/auth.service';
import {UserService} from '../../shared/auth/services/user-service';
import {HabitInstanceDto} from '../../shared/habit-instance/models/habit-instance.model';
import {HabitInstanceService} from '../../shared/habit-instance/services/habit-instance.service';
import {HabitService} from '../../shared/habit/services/habit.service';
import {MainHeaderComponent} from "../../shared/main-header/main-header.component";
import {MissionCreationDto, MissionDto} from '../../shared/mission/models/mission.model';
import {MissionService} from '../../shared/mission/services/mission.service';
import {StatisticsService} from "../../shared/statistics/services/statistics.service";

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
    ProgressBarModule,
    BaseChartDirective
  ],
  providers: [MessageService],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit, OnDestroy {
  user: User | null = null;
  todayMissions: MissionDto[] = [];
  radarChartLabels: string[] = [];
  todayHabitInstances: HabitInstanceDto[] = [];
  userLevel: Level | null = null;
  loading = {
    level: false
  };

  public radarChartData = [
    {
      data: [65, 59, 90, 81, 56, 55, 40],
      label: 'Habits',
      backgroundColor: 'rgba(65, 105, 225, 0.3)',
      borderColor: '#4169e1',
    },
    {
      data: [28, 48, 40, 19, 96, 27, 100],
      label: 'Tasks',
      backgroundColor: 'rgba(255, 99, 132, 0.3)',
      borderColor: '#ff6384',
    },
  ];

  public radarChartType: 'radar' = 'radar';

  private destroy$ = new Subject<void>();
  
  constructor(
    private authService: AuthService,
    private statisticsService: StatisticsService,
    private missionService: MissionService,
    private habitService: HabitService,
    private habitInstanceService: HabitInstanceService,
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
    this.loadStatistics();
  }

  private loadStatistics() {
    this.statisticsService.getMainUserStatistics().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (statistics) => {
        const uniqueTopics = [
          ...new Set([
            ...statistics.habitsByTopic.map(h => h.topicName),
            ...statistics.missionsByTopic.map(m => m.topicName)
          ])
        ];

        const habitsData = uniqueTopics.map(topic => {
          const habit = statistics.habitsByTopic.find(h => h.topicName === topic);
          return habit ? habit.completedCount : 0;
        });

        const tasksData = uniqueTopics.map(topic => {
          const mission = statistics.missionsByTopic.find(m => m.topicName === topic);
          return mission ? mission.completedCount : 0;
        });

        this.radarChartData = [
          {
            data: habitsData,
            label: 'Habits',
            backgroundColor: 'rgba(65, 105, 225, 0.3)',
            borderColor: '#4169e1',
          },
          {
            data: tasksData,
            label: 'Tasks',
            backgroundColor: 'rgba(255, 99, 132, 0.3)',
            borderColor: '#ff6384',
          },
        ];

        this.radarChartLabels = uniqueTopics;
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
    this.loadTodaysHabitInstances();
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
  
  loadTodaysHabitInstances() {
    this.habitService.getAllHabits().pipe(
      takeUntil(this.destroy$),
      switchMap(habits => {
        return forkJoin(
          habits.map(habit => this.habitService.regenerateHabitInstances(habit.id))
        );
      }),
      switchMap(() => {
        const today = new Date();
        return this.habitInstanceService.getInstancesByDate(today);
      })
    ).subscribe({
      next: (instances) => {
        this.todayHabitInstances = instances;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Помилка',
          detail: 'Не вдалося завантажити екземпляри звичок'
        });
        console.error('Error loading habit instances', err);
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
  
  toggleHabitInstanceComplete(instance: HabitInstanceDto) {
    this.habitInstanceService.completeInstance(instance.id).subscribe({
      next: (updatedInstance) => {
        const index = this.todayHabitInstances.findIndex(i => i.id === instance.id);
        if (index !== -1) {
          this.todayHabitInstances[index] = updatedInstance;
        }
        
        if (this.user && this.user.id) {
          this.loadUserLevel(this.user.id);
          
          if (instance.habitId) {
            this.habitService.updateHabitStreak(instance.habitId).subscribe();
          }
        }
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
