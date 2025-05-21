import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from "../../shared/habit/services/habit.service";
import { MainHeaderComponent } from "../../shared/main-header/main-header.component";
import { UserService } from '../../shared/auth/services/user-service';
import { User } from '../../shared/auth/models/auth.model';
import { Level } from '../../shared/auth/models/level.model';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { ChartModule } from 'primeng/chart';
import { StatisticsService } from '../../shared/statistics/services/statistics.service';
import { MissionService } from '../../shared/mission/services/mission.service';
import { MissionDto } from '../../shared/mission/models/mission.model';
import { HabitDto } from '../../shared/habit/models/habit.model';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserAvatarComponent } from '../../shared/profile-photo/components/user-avatar.component';

interface UserWithLevel {
  user: User;
  level: Level | null;
}

interface UserDetailStats {
  completedMissions: number;
  totalMissions: number;
  completedHabits: number;
  totalHabits: number;
  topicData: {
    labels: string[];
    habitsData: number[];
    missionsData: number[];
  };
}

@Component({
  selector: 'app-social-page',
  standalone: true,
  imports: [
    MainHeaderComponent,
    CommonModule,
    ToastModule,
    CardModule,
    AvatarModule,
    ProgressBarModule,
    SkeletonModule,
    DialogModule,
    TabViewModule,
    ChartModule,
    ButtonModule,
    TranslateModule,
    UserAvatarComponent
  ],
  providers: [MessageService],
  templateUrl: './social-page.component.html',
  styleUrl: './social-page.component.css'
})
export class SocialPageComponent implements OnInit, OnDestroy {
  users: UserWithLevel[] = [];
  loading = true;
  dialogVisible = false;
  loadingUserDetails = false;
  selectedUser: User | null = null;
  selectedUserLevel: Level | null = null;

  userMissions: MissionDto[] = [];
  userHabits: HabitDto[] = [];
  userStats: UserDetailStats = {
    completedMissions: 0,
    totalMissions: 0,
    completedHabits: 0,
    totalHabits: 0,
    topicData: {
      labels: [],
      habitsData: [],
      missionsData: []
    }
  };
  
  chartData: any;
  chartOptions: any;
  
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private statisticsService: StatisticsService,
    private missionService: MissionService,
    private habitService: HabitService,
    private translateService: TranslateService
  ) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAvailableUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.fetchUserLevels(users);
        },
        error: (err) => {
          this.translateService.get(['social.error', 'social.error.loadUsers']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['social.error'],
              detail: translations['social.error.loadUsers']
            });
          });
          console.error('Error loading users', err);
          this.loading = false;
        }
      });
  }

  fetchUserLevels(users: User[]): void {
    const userLevelRequests = users.map(user => {
      if (user.id) {
        return this.userService.getLevelByUserId(user.id)
          .pipe(
            takeUntil(this.destroy$)
          );
      }
      return null;
    }).filter(request => request !== null);

    if (userLevelRequests.length > 0) {
      forkJoin(userLevelRequests).subscribe({
        next: (levels) => {
          this.users = users.map((user, index) => ({
            user,
            level: levels[index] || null
          }));
          this.loading = false;
        },
        error: (err) => {
          this.translateService.get(['social.error', 'social.error.loadLevels']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['social.error'],
              detail: translations['social.error.loadLevels']
            });
          });
          console.error('Error loading user levels', err);
          this.users = users.map(user => ({
            user,
            level: null
          }));
          this.loading = false;
        }
      });
    } else {
      this.users = users.map(user => ({
        user,
        level: null
      }));
      this.loading = false;
    }
  }

  getProgressPercentage(level: Level): number {
    if (level && level.scoreToNextLevel > 0) {
      return (level.score / level.scoreToNextLevel) * 100;
    }
    return 0;
  }

  showUserDetails(user: User, userLevel: Level | null): void {
    this.dialogVisible = true;
    this.selectedUser = user;
    this.selectedUserLevel = userLevel;
    this.loadingUserDetails = true;
    
    if (user.id) {
      this.loadUserStats(user.id);
    }
  }

  loadUserStats(userId: number): void {
    forkJoin({
      missions: this.missionService.getAllMissionsByUserId(userId),
      habits: this.habitService.getAllHabitsByUserId(userId),
      statistics: this.statisticsService.getUserStatistics(userId)
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        const userStats = result.statistics;
        
        this.userMissions = result.missions;
        this.userHabits = result.habits;
        
        this.userStats.totalMissions = userStats.totalMissions;
        this.userStats.completedMissions = userStats.completedMissions;
        this.userStats.totalHabits = userStats.totalHabits;
        this.userStats.completedHabits = userStats.completedHabits;

        const uniqueTopics = [
          ...new Set([
            ...userStats.habitsByTopic.map(h => h.topicName),
            ...userStats.missionsByTopic.map(m => m.topicName)
          ])
        ];

        const habitsData = uniqueTopics.map(topic => {
          const habit = userStats.habitsByTopic.find(h => h.topicName === topic);
          return habit ? habit.completedCount : 0;
        });

        const missionsData = uniqueTopics.map(topic => {
          const mission = userStats.missionsByTopic.find(m => m.topicName === topic);
          return mission ? mission.completedCount : 0;
        });
        
        this.userStats.topicData = {
          labels: uniqueTopics,
          habitsData,
          missionsData
        };
        
        this.updateChartData();
        this.loadingUserDetails = false;
      },
      error: (err) => {
        this.translateService.get(['social.error', 'social.error.loadUserDetails']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['social.error'],
            detail: translations['social.error.loadUserDetails']
          });
        });
        console.error('Error loading user details', err);
        this.loadingUserDetails = false;
      }
    });
  }
  
  updateChartData(): void {
    this.translateService.get(['social.habits', 'social.missions']).subscribe(translations => {
      this.chartData = {
        labels: this.userStats.topicData.labels,
        datasets: [
          {
            label: translations['social.habits'],
            backgroundColor: 'rgba(65, 105, 225, 0.3)',
            borderColor: '#4169e1',
            pointBackgroundColor: '#4169e1',
            data: this.userStats.topicData.habitsData
          },
          {
            label: translations['social.missions'],
            backgroundColor: 'rgba(255, 99, 132, 0.3)',
            borderColor: '#ff6384',
            pointBackgroundColor: '#ff6384',
            data: this.userStats.topicData.missionsData
          }
        ]
      };
    });
  }
  
  initChartOptions(): void {
    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        r: {
          pointLabels: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          },
          angleLines: {
            color: '#ebedef'
          }
        }
      }
    };
  }

  getMissionPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getFrequencyClass(weekdays: string[]): string {
    if (!weekdays || weekdays.length === 0) return 'bg-info';

    switch(weekdays.length) {
      case 1: case 2: return 'bg-success';
      case 3: case 4: case 5: return 'bg-warning';
      case 6: case 7: return 'bg-danger';
      default: return 'bg-info';
    }
  }

  formatWeekdays(weekdays: string[]): string {
    if (!weekdays || weekdays.length === 0) {
      return this.translateService.instant('social.notSpecified');
    }

    return weekdays.map(day => this.translateService.instant(`social.weekdays.short.${day}`) || day).join(', ');
  }
}
