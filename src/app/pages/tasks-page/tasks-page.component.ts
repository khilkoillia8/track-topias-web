import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import {InputTextarea} from "primeng/inputtextarea";
import {MainHeaderComponent} from "../../shared/main-header/main-header.component";
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {TabViewModule} from 'primeng/tabview';
import {CardModule} from 'primeng/card';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import {CalendarModule} from 'primeng/calendar';
import {DropdownModule} from 'primeng/dropdown';
import {ToastModule} from 'primeng/toast';
import {CheckboxModule} from 'primeng/checkbox';
import {MessageService} from 'primeng/api';
import {TableModule} from 'primeng/table';
import {SidebarModule} from 'primeng/sidebar';
import {DividerModule} from 'primeng/divider';
import {SelectButtonModule} from 'primeng/selectbutton';
import {MultiSelectModule} from 'primeng/multiselect';
import {ColorPickerModule} from 'primeng/colorpicker';
import { HabitService } from '../../shared/habit/services/habit.service';
import { MissionService } from '../../shared/mission/services/mission.service';
import { TopicService } from '../../shared/topic/services/topic.service';
import { HabitDto, HabitCreationDto } from '../../shared/habit/models/habit.model';
import { MissionDto, MissionCreationDto } from '../../shared/mission/models/mission.model';
import { TopicDto, TopicCreationDto } from '../../shared/topic/models/topic.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    MainHeaderComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    TabViewModule,
    CardModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    ToastModule,
    CheckboxModule,
    InputTextarea,
    TableModule,
    SidebarModule,
    DividerModule,
    SelectButtonModule,
    MultiSelectModule,
    ColorPickerModule,
    RouterLink
  ],
  providers: [MessageService],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.css'
})
export class TasksPageComponent implements OnInit {
  missionDialogVisible: boolean = false;
  habitDialogVisible: boolean = false;
  topicDialogVisible: boolean = false;
  isEditing: boolean = false;
  isEditingTopic: boolean = false;
  editingType: 'mission' | 'habit' | null = null;
  activeTab: number = 0;

  missionSidebarVisible: boolean = false;
  habitSidebarVisible: boolean = false;
  selectedMission: MissionDto | null = null;
  selectedHabit: HabitDto | null = null;

  missions: MissionDto[] = [];
  habits: HabitDto[] = [];
  topics: TopicDto[] = [];

  priorityOptions = [
    {label: 'Низький', value: 'low'},
    {label: 'Середній', value: 'medium'},
    {label: 'Високий', value: 'high'}
  ];

  weekdayOptions = [
    {label: 'Понеділок', value: 'monday'},
    {label: 'Вівторок', value: 'tuesday'},
    {label: 'Середа', value: 'wednesday'},
    {label: 'Четвер', value: 'thursday'},
    {label: 'П\'ятниця', value: 'friday'},
    {label: 'Субота', value: 'saturday'},
    {label: 'Неділя', value: 'sunday'}
  ];

  missionForm: FormGroup;
  habitForm: FormGroup;
  topicForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private habitService: HabitService,
    private missionService: MissionService,
    private topicService: TopicService
  ) {
    this.missionForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      description: [''],
      dueDate: [new Date(), Validators.required],
      priority: ['medium', Validators.required],
      completed: [false],
      topicIds: [[], Validators.required]
    });

    this.habitForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      description: [''],
      weekdays: [[], Validators.required],
      completed: [false],
      topicIds: [[], Validators.required]
    });

    this.topicForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      color: ['#1976D2', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadMissions();
    this.loadHabits();
    this.loadTopics();
  }

  loadTopics() {
    this.topicService.getAllTopics().subscribe({
      next: (topics) => {
        this.topics = topics;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Помилка',
          detail: 'Не вдалося завантажити теми'
        });
        console.error('Error loading topics', err);
      }
    });
  }

  openMissionSidebar(mission: MissionDto, event: MouseEvent) {
    if ((event.target as HTMLElement).closest('.form-check-input')) {
      return;
    }
    this.selectedMission = {...mission}; 
    this.missionSidebarVisible = true;
  }

  openHabitSidebar(habit: HabitDto, event: MouseEvent) {
    if ((event.target as HTMLElement).closest('.form-check-input')) {
      return;
    }
    this.selectedHabit = {...habit};
    this.habitSidebarVisible = true;
  }

  loadMissions() {
    this.missionService.getAllMissions().subscribe({
      next: (missions) => {
        this.missions = missions;
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

  loadHabits() {
    this.habitService.getAllHabits().subscribe({
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

  openNewMissionDialog() {
    this.isEditing = false;
    this.editingType = 'mission';
    this.missionForm.reset({
      id: null,
      title: '',
      description: '',
      dueDate: new Date(),
      priority: 'medium',
      completed: false,
      topicIds: []
    });
    this.missionDialogVisible = true;
  }

  openNewHabitDialog() {
    this.isEditing = false;
    this.editingType = 'habit';
    this.habitForm.reset({
      id: null,
      title: '',
      description: '',
      weekdays: [],
      completed: false,
      topicIds: []
    });
    this.habitDialogVisible = true;
  }

  openEditMissionDialog(mission: MissionDto) {
    this.isEditing = true;
    this.editingType = 'mission';
    
    const topicIds = mission.topics ? mission.topics.map(topic => topic.id) : [];
    mission.dueDate = new Date(mission.dueDate)
    this.missionForm.patchValue({
      ...mission,
      topicIds: topicIds
    });
    this.missionDialogVisible = true;
  }

  openEditHabitDialog(habit: HabitDto) {
    this.isEditing = true;
    this.editingType = 'habit';
    
    const topicIds = habit.topics ? habit.topics.map(topic => topic.id) : [];
    
    this.habitForm.patchValue({
      ...habit,
      weekdays: habit.weekdays || [],
      topicIds: topicIds
    });
    this.habitDialogVisible = true;
  }

  saveMission() {
    if (this.missionForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Будь ласка, заповніть всі обов\'язкові поля'
      });
      return;
    }

    const formData = this.missionForm.value;
    const missionData: MissionCreationDto = {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      priority: formData.priority,
      completed: formData.completed,
      topicIds: formData.topicIds
    };

    if (this.isEditing) {
      this.missionService.updateMission(formData.id, missionData).subscribe({
        next: (updatedMission) => {
          const index = this.missions.findIndex(m => m.id === updatedMission.id);
          if (index !== -1) {
            this.missions[index] = updatedMission;
            if (this.selectedMission && this.selectedMission.id === updatedMission.id) {
              this.selectedMission = updatedMission;
            }
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Успішно',
            detail: 'Завдання успішно оновлено'
          });
          this.missionDialogVisible = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Помилка',
            detail: 'Не вдалося оновити завдання'
          });
          console.error('Error updating mission', err);
        }
      });
    } else {
      this.missionService.createMission(missionData).subscribe({
        next: (newMission) => {
          this.missions.push(newMission);
          this.messageService.add({
            severity: 'success',
            summary: 'Успішно',
            detail: 'Завдання успішно створено'
          });
          this.missionDialogVisible = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Помилка',
            detail: 'Не вдалося створити завдання'
          });
          console.error('Error creating mission', err);
        }
      });
    }
  }

  saveHabit() {
    if (this.habitForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Будь ласка, заповніть всі обов\'язкові поля'
      });
      return;
    }

    const formData = this.habitForm.value;
    const habitData: HabitCreationDto = {
      title: formData.title,
      description: formData.description,
      weekdays: formData.weekdays,
      completed: formData.completed,
      topicIds: formData.topicIds
    };

    if (this.isEditing) {
      this.habitService.updateHabit(formData.id, habitData).subscribe({
        next: (updatedHabit) => {
          const index = this.habits.findIndex(h => h.id === updatedHabit.id);
          if (index !== -1) {
            this.habits[index] = updatedHabit;
            if (this.selectedHabit && this.selectedHabit.id === updatedHabit.id) {
              this.selectedHabit = updatedHabit;
            }
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Успішно',
            detail: 'Звичку успішно оновлено'
          });
          this.habitDialogVisible = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Помилка',
            detail: 'Не вдалося оновити звичку'
          });
          console.error('Error updating habit', err);
        }
      });
    } else {
      this.habitService.createHabit(habitData).subscribe({
        next: (newHabit) => {
          this.habits.push(newHabit);
          this.messageService.add({
            severity: 'success',
            summary: 'Успішно',
            detail: 'Звичку успішно створено'
          });
          this.habitDialogVisible = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Помилка',
            detail: 'Не вдалося створити звичку'
          });
          console.error('Error creating habit', err);
        }
      });
    }
  }

  openNewTopicDialog() {
    this.isEditingTopic = false;
    this.topicForm.reset({
      id: null,
      name: '',
      color: '#1976D2'
    });
    this.topicDialogVisible = true;
  }

  openEditTopicDialog(topic: TopicDto) {
    this.isEditingTopic = true;
    this.topicForm.patchValue({
      id: topic.id,
      name: topic.name,
      color: topic.color
    });
    this.topicDialogVisible = true;
  }

  saveTopic() {
    if (this.topicForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Будь ласка, заповніть всі обов\'язкові поля'
      });
      return;
    }

    const formData = this.topicForm.value;
    const topicData: TopicCreationDto = {
      name: formData.name,
      color: formData.color
    };

    const currentMissionTopics = this.missionForm.get('topicIds')?.value || [];
    const currentHabitTopics = this.habitForm.get('topicIds')?.value || [];
    
    this.topicDialogVisible = false;

    if (this.isEditingTopic) {
      this.topicService.updateTopic(formData.id, topicData).subscribe({
        next: (updatedTopic) => {
          const index = this.topics.findIndex(t => t.id === updatedTopic.id);
          if (index !== -1) {
            this.topics[index] = updatedTopic;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Успішно',
            detail: 'Тему успішно оновлено'
          });
          
          this.topics = [...this.topics];
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Помилка',
            detail: 'Не вдалося оновити тему'
          });
          console.error('Error updating topic', err);
        }
      });
    } else {
      this.topicService.createTopic(topicData).subscribe({
        next: (newTopic) => {
          this.topics = [...this.topics, newTopic];
          
          if (this.missionDialogVisible) {
            this.missionForm.patchValue({ topicIds: currentMissionTopics });
          } else if (this.habitDialogVisible) {
            this.habitForm.patchValue({ topicIds: currentHabitTopics });
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Успішно',
            detail: 'Тему успішно створено'
          });
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Помилка',
            detail: 'Не вдалося створити тему'
          });
          console.error('Error creating topic', err);
        }
      });
    }
  }

  deleteMission(mission: MissionDto) {
    this.missionService.deleteMission(mission.id).subscribe({
      next: () => {
        const index = this.missions.findIndex(m => m.id === mission.id);
        if (index !== -1) {
          this.missions.splice(index, 1);
        }
        if (this.selectedMission && this.selectedMission.id === mission.id) {
          this.missionSidebarVisible = false;
          this.selectedMission = null;
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Успішно',
          detail: 'Завдання успішно видалено'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Помилка',
          detail: 'Не вдалося видалити завдання'
        });
        console.error('Error deleting mission', err);
      }
    });
  }

  deleteHabit(habit: HabitDto) {
    this.habitService.deleteHabit(habit.id).subscribe({
      next: () => {
        const index = this.habits.findIndex(h => h.id === habit.id);
        if (index !== -1) {
          this.habits.splice(index, 1);
        }
        if (this.selectedHabit && this.selectedHabit.id === habit.id) {
          this.habitSidebarVisible = false;
          this.selectedHabit = null;
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Успішно',
          detail: 'Звичку успішно видалено'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Помилка',
          detail: 'Не вдалося видалити звичку'
        });
        console.error('Error deleting habit', err);
      }
    });
  }

  toggleMissionComplete(mission: MissionDto) {
    mission.completed = !mission.completed;
    if (this.selectedMission && this.selectedMission.id === mission.id) {
      this.selectedMission.completed = mission.completed;
    }
    
    const updatedMission: MissionCreationDto = {
      title: mission.title,
      description: mission.description,
      dueDate: mission.dueDate,
      priority: mission.priority,
      completed: mission.completed
    };

    this.missionService.updateMission(mission.id, updatedMission).subscribe({
      error: (err) => {
        mission.completed = !mission.completed;
        if (this.selectedMission && this.selectedMission.id === mission.id) {
          this.selectedMission.completed = !mission.completed;
        }
        
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
    if (this.selectedHabit && this.selectedHabit.id === habit.id) {
      this.selectedHabit.completed = habit.completed;
    }
    
    const updatedHabit: HabitCreationDto = {
      title: habit.title,
      description: habit.description,
      weekdays: habit.weekdays,
      completed: habit.completed
    };
    
    this.habitService.updateHabit(habit.id, updatedHabit).subscribe({
      error: (err) => {
        habit.completed = !habit.completed;
        if (this.selectedHabit && this.selectedHabit.id === habit.id) {
          this.selectedHabit.completed = !habit.completed;
        }
        
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
}
