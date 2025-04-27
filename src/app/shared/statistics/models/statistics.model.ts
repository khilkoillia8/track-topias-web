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
