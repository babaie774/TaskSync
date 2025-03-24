import { HttpException, HttpStatus } from '@nestjs/common';

export class TaskNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Task with ID "${id}" not found`, HttpStatus.NOT_FOUND);
  }
}

export class TaskNotOwnedException extends HttpException {
  constructor() {
    super(
      'You do not have permission to access this task',
      HttpStatus.FORBIDDEN,
    );
  }
}

export class TaskAlreadyCompletedException extends HttpException {
  constructor() {
    super('Task is already completed', HttpStatus.BAD_REQUEST);
  }
}
