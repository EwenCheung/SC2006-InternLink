# InternLink

![InternLink Logo](/Lab4/frontend/public/images/Logo1.png)

## Smart Nation Initiative Project
*Building the bridge between students and employers in Singapore*

InternLink is a comprehensive web-based platform developed as part of the SC2006 Smart Nation Competition. The application bridges the gap between employers and job-seeking students by providing a specialized platform for internships and ad-hoc job opportunities in Singapore.

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Demo & Application Features](#system-demo--application-features)
3. [System Architecture & Extensibility](#system-architecture--extensibility)
4. [Software Development Life Cycle & Engineering Principles](#software-development-life-cycle--engineering-principles)
5. [Requirements Traceability](#requirements-traceability)
6. [User Roles and Functionality](#user-roles-and-functionality)
7. [Special Features & Enhanced UX](#special-features--enhanced-ux)
8. [Error Handling & Exception Management](#error-handling--exception-management)
9. [Technology Stack & Implementation](#technology-stack--implementation)
10. [Setup and Installation](#setup-and-installation)
11. [Future Enhancements](#future-enhancements)

## Project Overview & Smart Nation Context

InternLink addresses the lack of specialized platforms for student internships and ad-hoc job opportunities in Singapore. Unlike general professional platforms like LinkedIn, InternLink is specifically tailored for students entering the workforce.

### Problem Statement
Students frequently struggle to find relevant internship and ad-hoc job opportunities that match their skills, education, and availability. Employers also face challenges in connecting specifically with student talent for short-term positions.

### Market Value
InternLink creates value by:
- Saving students time by showing only relevant, entry-level opportunities
- Protecting students from scams with transparent employer profiles
- Providing employers with a curated pool of motivated student candidates
- Streamlining the application process with standardized profiles and skills matching

### Government API Integration
InternLink leverages several government and public APIs to enhance functionality:
- **Skills API (LightCast)**: For standardized skills matching and tagging
- **OneMap API**: For location-based job searching and visualization
- **University API**: For education verification and standardization

## System Demo & Application Features

InternLink provides a comprehensive, stable platform with robust error handling and an intuitive user interface.

### Key Features Overview

#### For Job Seekers:
- **Account Management**: Create profiles, update details, and manage privacy settings
- **Job Search**: Find internships and ad-hoc jobs with powerful filtering options
- **Location-Based Search**: Find jobs near specific locations using OneMap integration
- **Application Management**: Track applications, receive notifications, and manage responses
- **Profile Enhancement**: Build comprehensive profiles with skills, education, and experience

#### For Employers:
- **Account Management**: Create company profiles with detailed information
- **Job Posting**: Create, edit, and manage internship and ad-hoc job postings
- **Applicant Management**: Review, accept, or reject applicants
- **Candidate Search**: Search for candidates based on skills and qualifications
- **Messaging System**: Communicate with potential candidates

### Application Stability
InternLink is built with stability and reliability in mind:
- Comprehensive error handling with user-friendly messages
- Form validation on both client and server side
- Session management and secure authentication
- Responsive design for all device types
- Graceful degradation for older browsers

## System Architecture & Extensibility

InternLink follows a modern, scalable architecture designed for future expansion.

### MERN Stack Implementation
- **MongoDB**: NoSQL database for flexible data storage
- **Express.js**: Node.js framework for backend API development
- **React.js**: Frontend library for building interactive user interfaces
- **Node.js**: JavaScript runtime for server-side operations

### Component-Based Architecture
The application is built using reusable components to maximize code reuse and maintainability:
- Shared UI components across different pages
- Common validation and form handling logic
- Reusable API service modules

### Database Design
- **Users Database**: Stores Job Seeker and Employer profiles
- **Job List Database**: Stores Internship and Ad-Hoc job listings
- **Applications Database**: Manages job applications and their status
- **Messages Database**: Handles communication between users

### API Integration Architecture
- **Skills API**: Integrated for standardized skill tagging and matching
- **OneMap API**: Used for location-based services and mapping
- **University API**: Connected for education verification

### Extensibility Considerations
- Modular codebase allows for easy addition of new features
- Standardized API design supports future integrations
- Separation of concerns enables independent scaling of components

## Software Development Life Cycle & Engineering Principles

InternLink was developed following industry best practices in software engineering, with a strong emphasis on structured design and architecture.

### Development Methodology
The project followed an Agile/Scrum approach with:
- 2-week sprints for iterative development
- Regular stand-up meetings for progress tracking
- Sprint reviews and retrospectives for continuous improvement
- User stories to define feature requirements from job seeker and employer perspectives
- Kanban board for task management and visualization of workflow

### Requirements Engineering Process
1. Elicitation through stakeholder interviews and market research
2. Analysis and specification using use cases and user stories
3. Validation through prototype reviews and user feedback
4. Management using traceability matrices

### Design Approach and Architecture
InternLink implements a sophisticated multi-tiered architecture with clear separation of concerns, following established design patterns and principles:

#### System Architecture
The application uses a **Three-Tier Architecture**:
- **Presentation Tier**: React.js frontend with component-based UI
- **Application Tier**: Node.js/Express backend with REST API endpoints
- **Data Tier**: MongoDB database collections for users, jobs, applications, and messages

This separation provides numerous benefits:
- Independent development and testing of each tier
- Ability to scale components independently
- Improved security by isolating the data tier
- Simplified maintenance and updates

#### Model-View-Controller (MVC) Pattern
We strictly implemented the MVC pattern throughout the system:

- **Model (M)**: 
  - Implemented in the MongoDB schemas (`JobSeeker.model.js`, `Employer.model.js`, `job.model.js`, `application.model.js`)
  - Handles data structure, validation rules, and database interactions
  - Example: The `job.model.js` file defines schemas for both internship and ad-hoc jobs with proper validation rules

- **View (V)**:
  - React components for rendering user interfaces
  - Separated into pages (`JS_FindInternshipPage.jsx`, `EP_PostInternshipPage.jsx`) and reusable components
  - Organized by user role (JobSeeker vs Employer) for clear code organization

- **Controller (C)**:
  - Express.js route handlers (`job.controller.js`, `application.controller.js`, etc.)
  - Process requests, interact with models, and return responses
  - Example: `job.controller.js` handles filtering logic for job searches, leveraging the model's data structure

The MVC pattern helps us maintain a clear separation between data, business logic, and presentation, making the codebase more maintainable and extensible.

#### Component-Based Architecture
The frontend implements a **Component-Based Architecture** where:

- UI elements are broken down into reusable components (buttons, forms, cards)
- Pages are composed of these components
- Components have their own state management and lifecycle
- Props are used for parent-child component communication

This approach provides:
- Better code reuse across the application
- Easier testing of individual components
- Simplified maintenance and updates
- Consistent UI patterns throughout the application

#### Repository Pattern
For data access, we implemented the **Repository Pattern**:

- Abstract data access behind repository interfaces
- Controllers interact with repositories rather than directly with models
- Centralized handling of database operations
- Example: Job listings and applications are managed through dedicated repositories that abstract MongoDB operations

This pattern isolates the data layer, making it easier to change database implementations or add caching without affecting business logic.

#### Factory Pattern
The **Factory Pattern** is used for object creation in several areas:

- Job creation (internship vs ad-hoc jobs)
- User creation (job seeker vs employer accounts)
- Application status updates (pending, accepted, rejected)

This pattern centralizes complex object creation logic and makes it easier to extend with new types in the future.

#### Observer Pattern
The **Observer Pattern** is implemented for real-time updates:

- Used in the messaging system to notify users of new messages
- Implemented for application status updates to notify job seekers
- Applied to job posting views to track engagement metrics

This pattern allows loose coupling between components while maintaining consistent state updates across the system.

#### Facade Pattern
The **Facade Pattern** is used to provide simplified interfaces to complex subsystems:

- API service modules in the frontend that abstract backend API calls
- Authentication facade that handles tokens, login states, and permissions
- Job search facade that combines filtering, sorting, and pagination

This pattern simplifies client code and reduces dependencies between components.

### SOLID Principles Implementation
InternLink strictly adheres to SOLID principles:

#### Single Responsibility Principle (SRP)
- Each component and class has a single responsibility
- Example: Separate controllers for jobs, applications, messages, etc.
- Example: UI components focus on either rendering or behavior, not both

#### Open/Closed Principle (OCP)
- Components are open for extension but closed for modification
- Example: Job filtering system can be extended with new filters without modifying existing code
- Example: Form validation rules can be added without changing validation mechanisms

#### Liskov Substitution Principle (LSP)
- Child classes can be used in place of their parent classes
- Example: Both internship and ad-hoc job types inherit from a base job model
- Example: Authentication works consistently across job seeker and employer accounts

#### Interface Segregation Principle (ISP)
- Clients aren't forced to depend on interfaces they don't use
- Example: API service modules are divided by domain (jobs, users, applications)
- Example: UI components have focused props interfaces

#### Dependency Inversion Principle (DIP)
- High-level modules depend on abstractions, not details
- Example: Controllers depend on model interfaces, not concrete implementations
- Example: React components use service abstractions for API calls

### Implementation Practices
- Code reviews for quality assurance
- Pair programming for complex features
- Version control with Git and GitHub
- Continuous integration for automated testing
- Code style standardization with ESLint and Prettier

### Testing Methodology
InternLink implements a comprehensive testing strategy:

- **Unit Testing**: Testing individual components and functions in isolation
  - Example: Testing job filtering logic in `job.controller.js`
  - Example: Testing form validation in React components

- **Integration Testing**: Testing interactions between components
  - Example: Testing API endpoints with mock databases
  - Example: Testing React component integration using react-testing-library

- **End-to-End Testing**: Testing complete user flows
  - Example: Testing the job application process from search to submission
  - Example: Testing employer job posting workflow

- **User Acceptance Testing**: Testing with real users
  - Example: Job seekers testing the application submission process
  - Example: Employers testing the candidate review process

This comprehensive approach ensures all aspects of the system are thoroughly tested before deployment.

## Requirements Traceability

InternLink maintains strict traceability from requirements through implementation to testing.

### Use Case to Implementation Traceability
Each feature can be traced back to its original use case requirements:
- User authentication maps to UC-01 (User Registration) and UC-02 (User Login)
- Job posting features map to UC-03 (Post Job) and UC-04 (Edit Job)
- Job application features map to UC-05 (Apply for Job) and UC-06 (Track Applications)

### UML Diagrams to Code Implementation
The implementation follows the design specifications in:
- Class diagrams for model structure
- Sequence diagrams for operation flows
- State machine diagrams for application states

### Test Case Coverage
Each requirement has corresponding test cases to ensure complete coverage:
- Form validation tests for input requirements
- Authentication tests for security requirements
- Performance tests for response time requirements

## User Roles and Functionality

InternLink supports two primary user roles with distinct functionalities.

### Job Seeker Features

#### Account Management
- Create and update personal profiles
- Upload profile pictures
- Manage privacy settings
- Add education and experience details

#### Job Search
- Filter jobs by type (internship, ad-hoc)
- Search by location using OneMap integration
- Filter by skills, duration, and compensation
- Save favorite job listings

#### Application Management
- Submit applications with optional resume upload
- Track application status (pending, accepted, rejected)
- View application history
- Receive notifications on application updates

#### Profile Enhancement
- Add standardized skills from Skills API
- Link education credentials with University API
- Build portfolio with work samples
- Track skill development over time

### Employer Features

#### Company Profile Management
- Create and update company profiles
- Upload company logos
- Add company descriptions and details
- Manage contact information

#### Job Posting Management
- Create internship and ad-hoc job listings
- Set requirements, compensation, and deadlines
- Publish, edit, or remove listings
- Track listing views and applications

#### Applicant Management
- Review received applications
- Accept or reject candidates
- Send messages to applicants
- Track hiring progress

#### Candidate Evaluation
- Compare candidates based on skills
- Review applicant profiles
- Access educational background
- View past work experience

## Special Features & Enhanced UX

InternLink includes several special features that enhance user experience and differentiate it from similar platforms.

### Location-Based Services with OneMap
- Interactive map visualization for job locations
- Distance-based job search
- Travel time estimation for commuting
- Area-based filtering for specific neighborhoods

### Skills Matching Algorithm
- Standardized skills taxonomy from Skills API
- Intelligent matching between job requirements and candidate skills
- Skill gap analysis for candidates
- Recommendations for skill development

### University Verification System
- Integration with University API for credential validation
- Standardized educational institution naming
- Course verification and normalization
- Year of study verification

### Draft Saving Functionality
- Auto-save for application forms
- Draft storage for job postings
- Resume from where you left off
- Prevent data loss during interruptions

### Mobile-Responsive Design
- Optimized layouts for all device sizes
- Touch-friendly interface elements
- Native-like experience on mobile
- Consistent functionality across devices

### Messaging System
- Real-time chat between employers and candidates
- Notification system for new messages
- Conversation history tracking
- Attachment support for documents

## Error Handling & Exception Management

InternLink implements comprehensive error handling to ensure a smooth user experience.

### Client-Side Validation
- Real-time form validation feedback
- Input format enforcement
- Required field highlighting
- Helpful error messages

### Server-Side Error Handling
- Robust API error responses
- Graceful exception handling
- Detailed server logs for debugging
- Rate limiting and request throttling

### User Feedback Mechanisms
- Toast notifications for actions
- Modal confirmations for important operations
- Status indicators for ongoing processes
- Clear error explanations with recovery suggestions

### Graceful Degradation
- Fallback mechanisms for API failures
- Offline mode capabilities
- Browser compatibility adjustments
- Alternative flows for feature unavailability

### Error Logging and Monitoring
- Centralized error tracking
- Performance monitoring
- Usage analytics
- Automated alerts for critical issues

## Technology Stack & Implementation

InternLink is built using modern web technologies for optimal performance and scalability.

### Frontend
- **React.js**: For building the user interface
- **React Router**: For client-side routing
- **Tailwind CSS**: For styling and responsive design
- **Axios**: For API requests
- **React Query**: For state management

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Mongoose**: MongoDB object modeling
- **JWT**: For authentication
- **Multer**: For file uploads

### Database
- **MongoDB**: NoSQL database
- **MongoDB Atlas**: Cloud database service

### External APIs
- **LightCast Skills API**: For skills standardization
- **OneMap API**: For location services
- **University API**: For education verification

### DevOps
- **Git**: Version control
- **GitHub**: Repository hosting
- **Jest**: Testing framework
- **ESLint**: Code quality
- **Prettier**: Code formatting

## Setup and Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB account
- API keys for LightCast, OneMap, and University APIs

### Frontend Setup
```bash
# Navigate to frontend directory
cd Lab4/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd Lab4/backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys and database connection

# Start development server
npm run dev
```

### MongoDB Setup
1. Create a MongoDB Atlas account
2. Set up a new cluster
3. Create databases for users, jobs, and applications
4. Add connection string to backend .env file

### API Keys Configuration
1. Obtain API keys from LightCast, OneMap, and University APIs
2. Add keys to the appropriate .env variables
3. Configure API rate limits as needed

## Future Enhancements

InternLink has several planned enhancements for future releases:

### Advanced Features
- AI-powered job matching algorithms
- Resume builder with templates
- Virtual interview scheduling
- Skill assessment tests

### Platform Expansion
- Mobile app development
- Employer verification system
- Educational institution partnerships
- Industry-specific job categories

### Technical Improvements
- GraphQL API implementation
- Real-time notifications with WebSockets
- Enhanced analytics dashboard
- Performance optimization for larger user base

---

© 2025 InternLink - Developed by SC2006 Career Helper Group (FDAD)
