export interface HabitDto {
  id: number;
  title: string;
  description: string;
  weekdays: string[];
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
}

export interface HabitCreationDto {
  title: string;
  description: string;
  weekdays: string[]; 
  completed?: boolean;
}
