
# Project Management Dashboard Backend

## Table of Contents
- [Introduction](#introduction)
- [Database Schema Design](#database-schema-design)
- [System Design](#system-design)
- [Setup and Running Locally](#setup-and-running-locally)
- [API Documentation](#api-documentation)

## Introduction
This backend application serves a Project Management Dashboard, which provides an overview of projects, tasks, deadlines, etc. Users can see the projects they are a member of, categorized by their roles (admin or member). The application is built using Node.js and Express.js with MongoDB as the database.

## Database Schema Design
### User Schema
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
});
```

### Board Schema
```javascript
const boardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Board creator
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['Admin', 'Member'], required: true },
    }
  ],
  deadline: { type: Date, required: true },
});
```

### Task Schema
```javascript
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  deadline: { type: Date, required: true },
});
```

### Section Schema
```javascript
const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});
```

## System Design
### Architecture
The backend follows a typical MVC (Model-View-Controller) pattern:
- **Models**: Define the structure of the data (schemas for User, Board, Task, Section).
- **Views**: Not applicable as this is a backend service.
- **Controllers**: Handle the logic and interact with the database.

### Key Components
- **Authentication Middleware**: Ensures that routes are accessed by authenticated users.
- **Board Controller**: Manages operations related to boards.
- **Task Controller**: Manages operations related to tasks.
- **Section Controller**: Manages operations related to sections.
- **Dashboard Controller**: Fetches and processes data for the dashboard overview.

## Setup and Running Locally
### Prerequisites
- Node.js and npm installed
- MongoDB installed and running

### Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/project-management-dashboard.git
   cd project-management-dashboard/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root directory with the following content:
   ```plaintext
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/projectManagement
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the Application**
   ```bash
   npm start
   ```

5. **API is now running at** `http://localhost:5000`

## API Documentation
### Authentication
#### Login
- **URL**: `/api/auth/login`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "username": "user",
    "password": "pass"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token"
  }
  ```

#### Register
- **URL**: `/api/auth/register`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "username": "user",
    "password": "pass",
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully"
  }
  ```

### Dashboard Overview
#### Get Dashboard Overview
- **URL**: `/api/dashboard-overview`
- **Method**: GET
- **Headers**: 
  ```plaintext
  Authorization: Bearer jwt_token
  ```
- **Response**:
  ```json
  {
    "adminBoards": 5,
    "memberBoards": 10,
    "tasks": 50,
    "deadlines": [
      {
        "date": "2023-07-20T00:00:00.000Z",
        "project": "Project A",
        "task": "Task 1"
      },
      {
        "date": "2023-07-25T00:00:00.000Z",
        "project": "Project B",
        "task": "Task 2"
      }
    ]
  }
  ```

### Boards
#### Get All Boards
- **URL**: `/api/boards`
- **Method**: GET
- **Headers**: 
  ```plaintext
  Authorization: Bearer jwt_token
  ```
- **Response**:
  ```json
  [
    {
      "_id": "board_id",
      "name": "Board Name",
      "user": {
        "_id": "user_id",
        "username": "username"
      },
      "members": [
        {
          "user": {
            "_id": "user_id",
            "username": "username"
          },
          "role": "Admin"
        }
      ],
      "deadline": "2023-07-20T00:00:00.000Z"
    }
  ]
  ```

#### Create Board
- **URL**: `/api/boards`
- **Method**: POST
- **Headers**: 
  ```plaintext
  Authorization: Bearer jwt_token
  ```
- **Request Body**:
  ```json
  {
    "name": "New Board",
    "deadline": "2023-08-01T00:00:00.000Z"
  }
  ```
- **Response**:
  ```json
  {
    "_id": "new_board_id",
    "name": "New Board",
    "user": "user_id",
    "members": [],
    "deadline": "2023-08-01T00:00:00.000Z"
  }
  ```

### Tasks
#### Get All Tasks for a Board
- **URL**: `/api/boards/:boardId/tasks`
- **Method**: GET
- **Headers**: 
  ```plaintext
  Authorization: Bearer jwt_token
  ```
- **Response**:
  ```json
  [
    {
      "_id": "task_id",
      "title": "Task Title",
      "content": "Task Content",
      "section": "section_id",
      "board": "board_id",
      "assignedTo": "user_id",
      "createdAt": "2023-07-20T00:00:00.000Z",
      "deadline": "2023-08-01T00:00:00.000Z"
    }
  ]
  ```

#### Create Task
- **URL**: `/api/boards/:boardId/tasks`
- **Method**: POST
- **Headers**: 
  ```plaintext
  Authorization: Bearer jwt_token
  ```
- **Request Body**:
  ```json
  {
    "title": "New Task",
    "content": "Task Content",
    "sectionId": "section_id",
    "deadline": "2023-08-01T00:00:00.000Z"
  }
  ```
- **Response**:
  ```json
  {
    "_id": "new_task_id",
    "title": "New Task",
    "content": "Task Content",
    "section": "section_id",
    "board": "board_id",
    "assignedTo": null,
    "createdAt": "2023-07-20T00:00:00.000Z",
    "deadline": "2023-08-01T00:00:00.000Z"
  }
  ```

### Sections
#### Create Section
- **URL**: `/api/boards/:boardId/sections`
- **Method**: POST
- **Headers**: 
  ```plaintext
  Authorization: Bearer jwt_token
  ```
- **Response**:
  ```json
  {
    "_id": "new_section_id",
    "title": "Untitled",
    "board": "board_id",
    "tasks": []
  }
  ```

#### Update Section Title
- **URL**: `/api/boards/:boardId/sections/:sectionId`
- **Method**: PATCH
- **Headers**: 
  ```plaintext
  Authorization: Bearer jwt_token
  ```
- **Request Body**:


  ```json
  {
    "title": "Updated Section Title"
  }
  ```
- **Response**:
  ```json
  {
    "_id": "section_id",
    "title": "Updated Section Title",
    "board": "board_id",
    "tasks": []
  }
  ```

### Authentication Mechanisms
- **JWT (JSON Web Tokens)**: Each API request should include an Authorization header with a Bearer token.
- **Example**:
  ```plaintext
  Authorization: Bearer jwt_token
  ```

## Conclusion
This documentation provides an overview of the backend setup, including the database schema design, system architecture, steps to run the project locally, and detailed API documentation. Follow the provided instructions to set up and run the project, and refer to the API documentation for interacting with the backend endpoints.

