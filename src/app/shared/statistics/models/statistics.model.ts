export interface CompletedHabitsByTopicDto {
  topicId: number;
  topicName: string;
  completedCount: number;
}

export interface CompletedMissionsByTopicDto {
  topicId: number;
  topicName: string;
  completedCount: number;
}

export interface UserStatisticsDto {
  userId: number;
  username: string;
  totalHabits: number;
  completedHabits: number;
  totalMissions: number;
  completedMissions: number;
  habitsByTopic: CompletedHabitsByTopicDto[];
  missionsByTopic: CompletedMissionsByTopicDto[];
}

export interface UserHabitInstanceStatisticsDto {
  userId: number;
  username: string;
  totalInstances: number;
  completedInstances: number;
  completionRate: number;
}

export interface HabitInstanceStatisticsDto {
  habitId: number;
  habitName: string;
  totalInstances: number;
  completedInstances: number;
  completionRate: number;
}

export interface UserRatingDto {
  userId: number;
  username: string;
  value: number;
  rank: number;
}
