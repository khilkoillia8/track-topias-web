export interface TopicDto {
  id: number;
  name: string;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: number;
}

export interface TopicCreationDto {
  name: string;
  color: string;
}
