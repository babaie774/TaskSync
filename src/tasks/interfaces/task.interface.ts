import { User } from '../../users/entities/user.entity';

export interface ITask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  reminderDate?: Date;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskEvent {
  taskId: string;
  userId: string;
  title: string;
  timestamp: Date;
}

export interface INotificationPayload {
  userId: string;
  title: string;
  message: string;
  type:
    | 'TASK_REMINDER'
    | 'TASK_COMPLETED'
    | 'TASK_CREATED'
    | 'TASK_UPDATED'
    | 'TASK_DELETED';
}
