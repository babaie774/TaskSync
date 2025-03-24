import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Job } from 'bull';

@Processor('tasks')
export class TaskProcessor {
  private readonly logger = new Logger(TaskProcessor.name);

  constructor(@Inject('TASK_SERVICE') private taskClient: ClientProxy) {}

  @Process('send-reminder')
  async handleReminder(
    job: Job<{ taskId: string; userId: string; title: string }>,
  ) {
    this.logger.debug('Processing reminder job...');
    this.logger.debug(job.data);

    // Send notification through RabbitMQ
    this.taskClient.emit('send_notification', {
      userId: job.data.userId,
      title: 'Task Reminder',
      message: `Your task "${job.data.title}" is due soon!`,
    });

    this.logger.debug('Reminder job completed');
  }
}
