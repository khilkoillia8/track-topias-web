import { HabitDto } from '../../habit/models/habit.model';

export interface HabitInstanceDto {
  id: number;
  habitId: number;
  habitTitle: string;
  habit?: HabitDto;
  date: Date;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
