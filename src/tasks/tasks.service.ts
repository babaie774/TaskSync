import { InjectQueue } from '@nestjs/bull';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectQueue('tasks') private tasksQueue: Queue,
    @Inject('TASK_SERVICE') private taskClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      user: { id: userId },
    });
    const savedTask = await this.tasksRepository.save(task);

    // Schedule reminder if dueDate is set
    if (createTaskDto.dueDate) {
      await this.scheduleReminder(savedTask);
    }

    // Publish task creation event
    this.taskClient.emit('task_created', savedTask);

    return savedTask;
  }

  async findAll(userId: string): Promise<Task[]> {
    const cacheKey = `tasks:${userId}`;
    const cachedTasks = await this.cacheManager.get<Task[]>(cacheKey);

    if (cachedTasks) {
      return cachedTasks;
    }

    const tasks = await this.tasksRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    await this.cacheManager.set(cacheKey, tasks, 300); // Cache for 5 minutes
    return tasks;
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const cacheKey = `task:${id}:${userId}`;
    const cachedTask = await this.cacheManager.get<Task>(cacheKey);

    if (cachedTask) {
      return cachedTask;
    }

    const task = await this.tasksRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.cacheManager.set(cacheKey, task, 300); // Cache for 5 minutes
    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);
    Object.assign(task, updateTaskDto);
    const updatedTask = await this.tasksRepository.save(task);

    // Clear cache
    await this.cacheManager.del(`task:${id}:${userId}`);
    await this.cacheManager.del(`tasks:${userId}`);

    // Publish task update event
    this.taskClient.emit('task_updated', updatedTask);

    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.tasksRepository.remove(task);

    // Clear cache
    await this.cacheManager.del(`task:${id}:${userId}`);
    await this.cacheManager.del(`tasks:${userId}`);

    // Publish task deletion event
    this.taskClient.emit('task_deleted', { id, userId });
  }

  async markAsCompleted(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    task.completed = true;
    const updatedTask = await this.tasksRepository.save(task);

    // Clear cache
    await this.cacheManager.del(`task:${id}:${userId}`);
    await this.cacheManager.del(`tasks:${userId}`);

    // Publish task completion event
    this.taskClient.emit('task_completed', updatedTask);

    return updatedTask;
  }

  private async scheduleReminder(task: Task): Promise<void> {
    if (task.dueDate) {
      const delay = task.dueDate.getTime() - Date.now();
      if (delay > 0) {
        await this.tasksQueue.add(
          'send-reminder',
          {
            taskId: task.id,
            userId: task.user.id,
            title: task.title,
          },
          {
            delay,
          },
        );
      }
    }
  }
}
