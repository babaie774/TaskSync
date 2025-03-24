import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Complete project documentation' })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ example: 'Write detailed documentation for the API endpoints' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-03-25T15:00:00Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiProperty({ example: '2024-03-25T14:00:00Z' })
  @IsDateString()
  @IsOptional()
  reminderDate?: Date;
} 