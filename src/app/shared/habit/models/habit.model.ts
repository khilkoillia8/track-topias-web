import { TopicDto } from '../../topic/models/topic.model';
import { HabitStreakResponse } from '../services/habit.service';

export interface HabitDto {
  id: number;
  title: string;
  description: string;
  weekdays: string[];
  completed: boolean;
  topics?: TopicDto[];
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
  streak?: HabitStreakResponse;
}

export interface HabitCreationDto {
  title: string;
  description: string;
  weekdays: string[];
  completed?: boolean;
  topicIds?: number[];
}
