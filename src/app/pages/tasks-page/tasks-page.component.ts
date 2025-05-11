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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    RouterLink,
    TranslateModule
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
    {label: 'tasks.priority.low', value: 'low'},
    {label: 'tasks.priority.medium', value: 'medium'},
    {label: 'tasks.priority.high', value: 'high'}
  ];

  weekdayOptions = [
    {label: 'tasks.weekdays.monday', value: 'monday'},
    {label: 'tasks.weekdays.tuesday', value: 'tuesday'},
    {label: 'tasks.weekdays.wednesday', value: 'wednesday'},
    {label: 'tasks.weekdays.thursday', value: 'thursday'},
    {label: 'tasks.weekdays.friday', value: 'friday'},
    {label: 'tasks.weekdays.saturday', value: 'saturday'},
    {label: 'tasks.weekdays.sunday', value: 'sunday'}
  ];

  missionForm: FormGroup;
  habitForm: FormGroup;
  topicForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private habitService: HabitService,
    private missionService: MissionService,
    private topicService: TopicService,
    private translateService: TranslateService
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
    this.translateOptions();
    this.loadData();
  }

  translateOptions() {
    this.translateService.get([
      'tasks.priority.low',
      'tasks.priority.medium',
      'tasks.priority.high',
      'tasks.weekdays.monday',
      'tasks.weekdays.tuesday',
      'tasks.weekdays.wednesday',
      'tasks.weekdays.thursday',
      'tasks.weekdays.friday',
      'tasks.weekdays.saturday',
      'tasks.weekdays.sunday'
    ]).subscribe(translations => {
      this.priorityOptions = [
        {label: translations['tasks.priority.low'], value: 'low'},
        {label: translations['tasks.priority.medium'], value: 'medium'},
        {label: translations['tasks.priority.high'], value: 'high'}
      ];
      
      this.weekdayOptions = [
        {label: translations['tasks.weekdays.monday'], value: 'monday'},
        {label: translations['tasks.weekdays.tuesday'], value: 'tuesday'},
        {label: translations['tasks.weekdays.wednesday'], value: 'wednesday'},
        {label: translations['tasks.weekdays.thursday'], value: 'thursday'},
        {label: translations['tasks.weekdays.friday'], value: 'friday'},
        {label: translations['tasks.weekdays.saturday'], value: 'saturday'},
        {label: translations['tasks.weekdays.sunday'], value: 'sunday'}
      ];
    });
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
        this.translateService.get(['tasks.error', 'tasks.error.loadTopics']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['tasks.error'],
            detail: translations['tasks.error.loadTopics']
          });
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
        this.translateService.get(['tasks.error', 'tasks.error.loadMissions']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['tasks.error'],
            detail: translations['tasks.error.loadMissions']
          });
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
        this.translateService.get(['tasks.error', 'tasks.error.loadHabits']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['tasks.error'],
            detail: translations['tasks.error.loadHabits']
          });
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
      this.translateService.get(['tasks.error', 'tasks.error.fillRequiredFields']).subscribe(translations => {
        this.messageService.add({
          severity: 'error',
          summary: translations['tasks.error'],
          detail: translations['tasks.error.fillRequiredFields']
        });
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
          this.translateService.get(['tasks.success', 'tasks.success.missionUpdated']).subscribe(translations => {
            this.messageService.add({
              severity: 'success',
              summary: translations['tasks.success'],
              detail: translations['tasks.success.missionUpdated']
            });
          });
          this.missionDialogVisible = false;
        },
        error: (err) => {
          this.translateService.get(['tasks.error', 'tasks.error.missionUpdate']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['tasks.error'],
              detail: translations['tasks.error.missionUpdate']
            });
          });
          console.error('Error updating mission', err);
        }
      });
    } else {
      this.missionService.createMission(missionData).subscribe({
        next: (newMission) => {
          this.missions.push(newMission);
          this.translateService.get(['tasks.success', 'tasks.success.missionCreated']).subscribe(translations => {
            this.messageService.add({
              severity: 'success',
              summary: translations['tasks.success'],
              detail: translations['tasks.success.missionCreated']
            });
          });
          this.missionDialogVisible = false;
        },
        error: (err) => {
          this.translateService.get(['tasks.error', 'tasks.error.missionCreate']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['tasks.error'],
              detail: translations['tasks.error.missionCreate']
            });
          });
          console.error('Error creating mission', err);
        }
      });
    }
  }

  saveHabit() {
    if (this.habitForm.invalid) {
      this.translateService.get(['tasks.error', 'tasks.error.fillRequiredFields']).subscribe(translations => {
        this.messageService.add({
          severity: 'error',
          summary: translations['tasks.error'],
          detail: translations['tasks.error.fillRequiredFields']
        });
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
          this.translateService.get(['tasks.success', 'tasks.success.habitUpdated']).subscribe(translations => {
            this.messageService.add({
              severity: 'success',
              summary: translations['tasks.success'],
              detail: translations['tasks.success.habitUpdated']
            });
          });
          this.habitDialogVisible = false;
        },
        error: (err) => {
          this.translateService.get(['tasks.error', 'tasks.error.habitUpdate']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['tasks.error'],
              detail: translations['tasks.error.habitUpdate']
            });
          });
          console.error('Error updating habit', err);
        }
      });
    } else {
      this.habitService.createHabit(habitData).subscribe({
        next: (newHabit) => {
          this.habits.push(newHabit);
          this.translateService.get(['tasks.success', 'tasks.success.habitCreated']).subscribe(translations => {
            this.messageService.add({
              severity: 'success',
              summary: translations['tasks.success'],
              detail: translations['tasks.success.habitCreated']
            });
          });
          this.habitDialogVisible = false;
        },
        error: (err) => {
          this.translateService.get(['tasks.error', 'tasks.error.habitCreate']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['tasks.error'],
              detail: translations['tasks.error.habitCreate']
            });
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
      this.translateService.get(['tasks.error', 'tasks.error.fillRequiredFields']).subscribe(translations => {
        this.messageService.add({
          severity: 'error',
          summary: translations['tasks.error'],
          detail: translations['tasks.error.fillRequiredFields']
        });
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
          this.translateService.get(['tasks.success', 'tasks.success.topicUpdated']).subscribe(translations => {
            this.messageService.add({
              severity: 'success',
              summary: translations['tasks.success'],
              detail: translations['tasks.success.topicUpdated']
            });
          });
          
          this.topics = [...this.topics];
        },
        error: (err) => {
          this.translateService.get(['tasks.error', 'tasks.error.topicUpdate']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['tasks.error'],
              detail: translations['tasks.error.topicUpdate']
            });
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
          
          this.translateService.get(['tasks.success', 'tasks.success.topicCreated']).subscribe(translations => {
            this.messageService.add({
              severity: 'success',
              summary: translations['tasks.success'],
              detail: translations['tasks.success.topicCreated']
            });
          });
        },
        error: (err) => {
          this.translateService.get(['tasks.error', 'tasks.error.topicCreate']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['tasks.error'],
              detail: translations['tasks.error.topicCreate']
            });
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
        
        this.translateService.get(['tasks.success', 'tasks.success.missionDeleted']).subscribe(translations => {
          this.messageService.add({
            severity: 'success',
            summary: translations['tasks.success'],
            detail: translations['tasks.success.missionDeleted']
          });
        });
      },
      error: (err) => {
        this.translateService.get(['tasks.error', 'tasks.error.missionDelete']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['tasks.error'],
            detail: translations['tasks.error.missionDelete']
          });
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
        
        this.translateService.get(['tasks.success', 'tasks.success.habitDeleted']).subscribe(translations => {
          this.messageService.add({
            severity: 'success',
            summary: translations['tasks.success'],
            detail: translations['tasks.success.habitDeleted']
          });
        });
      },
      error: (err) => {
        this.translateService.get(['tasks.error', 'tasks.error.habitDelete']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['tasks.error'],
            detail: translations['tasks.error.habitDelete']
          });
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
        
        this.translateService.get(['tasks.error', 'tasks.error.missionStatusUpdate']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['tasks.error'],
            detail: translations['tasks.error.missionStatusUpdate']
          });
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
        
        this.translateService.get(['tasks.error', 'tasks.error.habitStatusUpdate']).subscribe(translations => {
          this.messageService.add({
            severity: 'error',
            summary: translations['tasks.error'],
            detail: translations['tasks.error.habitStatusUpdate']
          });
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
