# TaskSync - Task Management System

A production-ready NestJS application for managing tasks with features like authentication, caching, message queues, and background job processing.

## Features

- User authentication and authorization using JWT
- CRUD operations for tasks
- Redis caching for frequently accessed data
- RabbitMQ for event-driven architecture
- Bull queue for background job processing
- Swagger API documentation
- Rate limiting
- Graceful shutdown handling

## Project Structure

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL
- Redis
- RabbitMQ

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/task-sync.git
cd task-sync
```

2. Install dependencies:

```bash
npm install
```

3. Create a PostgreSQL database:

```sql
CREATE DATABASE task_sync;
```

4. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running the Application

1. Start the development server:

```bash
npm run start:dev
```

2. Access the API documentation:

```
http://localhost:3000/api
```

## API Endpoints

### Authentication

- POST /auth/register - Register a new user
- POST /auth/login - Login user

### Tasks

- GET /tasks - Get all tasks
- GET /tasks/:id - Get a specific task
- POST /tasks - Create a new task
- PATCH /tasks/:id - Update a task
- DELETE /tasks/:id - Delete a task
- PATCH /tasks/:id/complete - Mark a task as completed

## Docker Support

To run the application using Docker:

1. Build the Docker image:

```bash
docker build -t task-sync .
```

2. Run the container:

```bash
docker run -p 3000:3000 task-sync
```

## Testing

Run the test suite:

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
