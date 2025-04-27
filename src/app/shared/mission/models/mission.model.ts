import { TopicDto } from '../../topic/models/topic.model';

export interface MissionDto {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  completed: boolean;
  topics?: TopicDto[];
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
}

export interface MissionCreationDto {
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  completed?: boolean;
  topicIds?: number[];
}
