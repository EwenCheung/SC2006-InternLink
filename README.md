# InternLink

![InternLink Logo](/Lab4/frontend/public/images/Logo1.png)

## Smart Nation Initiative Project
*Building the bridge between students and employers in Singapore*

InternLink is a comprehensive web-based platform developed as part of the SC2006 Smart Nation Competition. The application bridges the gap between employers and job-seeking students by providing a specialized platform for internships and ad-hoc job opportunities in Singapore.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Documentation](#project-documentation)
3. [System Demo & Application Features](#system-demo--application-features)
4. [System Architecture & Extensibility](#system-architecture--extensibility)
5. [Directory Structure](#directory-structure)
6. [Software Development Life Cycle & Engineering Principles](#software-development-life-cycle--engineering-principles)
7. [Requirements Traceability](#requirements-traceability)
8. [User Roles and Functionality](#user-roles-and-functionality)
9. [Special Features & Enhanced UX](#special-features--enhanced-ux)
10. [Error Handling & Exception Management](#error-handling--exception-management)
11. [Technology Stack & Implementation](#technology-stack--implementation)
12. [Setup and Installation](#setup-and-installation)
13. [Future Enhancements](#future-enhancements)

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

## Project Documentation

InternLink was developed following a systematic software engineering approach with comprehensive documentation at each phase:

### Lab 1: Requirements & Analysis
- Use Case Diagrams
- Functional & Non-functional Requirements
- UI Prototypes
- Data Dictionary

### Lab 2: System Design
- Boundary & Control Classes
- Class Diagrams of Entity Classes
- Sequence Diagrams
- State Machine Diagrams
- UI Design

### Lab 3: Detailed Design
- System Architecture
- Enhanced Boundary & Control Classes
- Updated Sequence Diagrams
- Dialog Map State Machine

### Lab 4: Implementation
- Functional Backend & Frontend Code
- API Integration
- Testing and Deployment

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
The frontend implements a **Component-Based Architecture** with reusable UI components:

```javascript
// Button component example
const Button = ({ children, onClick, variant }) => {
  // Add styling classes based on variant
  // ...existing code...
  
  return (
    <button onClick={onClick} className={styles}>
      {children}
    </button>
  );
};

// Form input component
const FormField = ({ label, name, error, children }) => {
  // Create form field with label and error handling
  // ...existing code...
};

// Domain-specific component example
const JobCard = ({ job }) => {
  // Display job information in a card format
  // ...existing code...
};

// Page component using multiple components
const JS_FindInternshipPage = () => {
  // State and data fetching
  // ...existing code...
  
  return (
    <div>
      <SearchBar />
      <FilterPanel />
      {jobs.map(job => <JobCard key={job._id} job={job} />)}
    </div>
  );
};
```

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

## Directory Structure

The InternLink project follows a structured organization that clearly separates frontend and backend responsibilities.

### Project Structure Overview

```
SC2006-InternLink/
├── Lab1/           # Requirements & analysis documentation
├── Lab2/           # System design documentation
├── Lab3/           # Detailed design documentation
├── Lab4/           # Implementation code
│   ├── backend/    # Node.js/Express backend
│   └── frontend/   # React.js frontend
└── README.md       # Project documentation
```

### Backend Structure (`/Lab4/backend/`)

```
backend/
├── config/             # Configuration files for database and environments
├── controllers/        # Business logic for handling requests
├── errors/             # Custom error classes and error handling
├── middleware/         # Request processing middleware
├── models/             # Data models and schemas
├── routes/             # API endpoint definitions
├── utils/              # Utility functions
└── server.js           # Main application entry point
```

#### `/config`
Contains database connection settings and environment configurations.
- `db.js` - Handles MongoDB connection setup and error handling

#### `/controllers`
Contains the business logic that processes API requests, interacts with models, and returns responses.
- `authUser.controller.js` - User authentication, registration, and profile management
- `job.controller.js` - Job listing creation, retrieval, updating, and filtering
- `application.controller.js` - Job application submission and processing
- `message.controller.js` - Messaging between users (future implementation)
- `areaname.contoller.js` - Integration with OneMap API for location services
- `skillsdata.controller.js` - Integration with Skills API for standardized skills
- `universitiesdata.controller.js` - Integration with University API for education verification
- `schoolInput.controller.js` - School data validation and formatting

#### `/errors`
Defines custom error classes and error handling middleware for consistent API responses.
- `bad-request.js` - Custom error for invalid requests
- `unauthenticated.js` - Custom error for authentication failures
- `index.js` - Exports all error classes
- `errorMiddleware.js` - Centralized error handling middleware

#### `/middleware`
Contains functions that process requests before they reach route handlers.
- `authentication.js` - JWT token verification and user authentication
- `error-handler.js` - Global error handling middleware
- `fileUpload.js` - Multipart form processing for file uploads

#### `/models`
Defines MongoDB schemas and models for data structure and validation.
- `JobSeeker.model.js` - Schema for student user profiles
- `Employer.model.js` - Schema for employer user profiles
- `job.model.js` - Schemas for internship and ad-hoc job listings
- `draftJob.model.js` - Schema for saved job drafts
- `application.model.js` - Schema for job applications
- `message.model.js` - Schema for user-to-user messages
- `User.js` - Common user authentication methods

#### `/routes`
Defines API endpoints and connects them to controller functions.
- `authUser.route.js` - User authentication and profile endpoints
- `job.route.js` - Job listing endpoints
- `application.route.js` - Job application endpoints
- `message.route.js` - Messaging endpoints (placeholder for future implementation)

#### `/utils`
Utility functions used throughout the application.
- `portSync.js` - Utility for synchronizing port between frontend and backend

#### `server.js`
The main application entry point which:
- Configures Express and middleware
- Connects to MongoDB
- Sets up API routes
- Initializes external API tokens (OneMap, Skills API)
- Starts the server

### Frontend Structure (`/Lab4/frontend/`)

```
frontend/
├── public/             # Static assets and public files
│   └── images/         # Application images and icons
├── src/                # Source code
│   ├── assets/         # Images, fonts, and other assets
│   ├── components/     # Reusable UI components
│   │   ├── Common/     # Shared components
│   │   ├── Employer/   # Employer-specific components
│   │   ├── JobSeeker/  # JobSeeker-specific components
│   │   └── Layout/     # Layout components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   │   ├── Employer/   # Employer pages
│   │   └── JobSeeker/  # JobSeeker pages
│   ├── services/       # API service functions
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main component and routing
│   ├── main.jsx        # Application entry point
│   ├── index.css       # Global styles
│   └── App.css         # App-specific styles
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies and scripts
```

#### `/src/components`
Reusable UI components organized by functionality and user role:

- **Common/** - Shared components used throughout the application
  - `Button.jsx` - Customizable button component with different variants and states
  - `FormField.jsx` - Input component with built-in label and error handling
  - `LoadingSpinner.jsx` - Animation shown during data loading
  - `Modal.jsx` - Popup dialog for confirmations and forms
  - `NotFound.jsx` - 404 error page
  - `ProtectedRoute.jsx` - Route wrapper that handles authentication redirects
  - `SearchBar.jsx` - Search input with filtering capabilities

- **Layout/** - Page structure components
  - `Layout.jsx` - Main page wrapper with navigation and footer
  - `NavBar.jsx` - Navigation header with role-specific menus
  - `Footer.jsx` - Page footer with links and copyright
  - `SideBar.jsx` - Side navigation for filtering options

- **JobSeeker/** - Components for job seeker interfaces
  - `JobCard.jsx` - Card displaying job listing summary
  - `ApplicationForm.jsx` - Form for submitting job applications
  - `FilterPanel.jsx` - Job search filtering options
  - `ProfileCard.jsx` - User profile summary display

- **Employer/** - Components for employer interfaces
  - `JobForm.jsx` - Form for creating and editing job listings
  - `ApplicationList.jsx` - List of received applications
  - `CandidateCard.jsx` - Card displaying applicant information
  - `CompanyProfileForm.jsx` - Form for company profile management

#### `/src/pages`
Complete page components that use the smaller components:

- **JobSeeker/** - Job seeker user interfaces
  - `JS_FindInternshipPage.jsx` - Search and browse internship listings
  - `JS_FindAdHocPage.jsx` - Search and browse ad-hoc job listings
  - `JS_InternshipDetailsPage.jsx` - Detailed view of an internship listing
  - `JS_AdHocDetailsPage.jsx` - Detailed view of an ad-hoc job listing
  - `JS_InternshipApplicationPage.jsx` - Application form for internships
  - `JS_AdHocApplicationPage.jsx` - Application form for ad-hoc jobs
  - `JS_ProfilePage.jsx` - User profile editing and management
  - `JS_ViewApplicationPage.jsx` - View submitted application status
  - `JS_MessagesPage.jsx` - Messaging interface (placeholder for future)
  - `JS_PrivacySettings.jsx` - User privacy and security settings

- **Employer/** - Employer user interfaces
  - `EP_PostInternshipPage.jsx` - Manage posted internship listings
  - `EP_PostAdHocPage.jsx` - Manage posted ad-hoc job listings
  - `EP_AddInternshipPage.jsx` - Create new internship listings
  - `EP_AddAdHocPage.jsx` - Create new ad-hoc job listings
  - `EP_ViewCandidatesPage.jsx` - View and evaluate applicants
  - `EP_ProfilePage.jsx` - Company profile management
  - `EP_MessagesPage.jsx` - Messaging interface (placeholder for future)
  - `EP_PrivacySettings.jsx` - Company privacy and security settings
  - `EP_ViewApplicantProfilePage.jsx` - Detailed view of applicant profiles

- `ChooseRolePage.jsx` - Initial role selection (job seeker or employer)
- `LogOutConfirmation.jsx` - Logout confirmation screen

#### `/src/services`
API client functions that communicate with the backend:

- `api.js` - Core Axios configuration with interceptors for authentication
- `auth.service.js` - Authentication services (login, signup, token management)
- `job.service.js` - Job listing CRUD operations and search functionality
- `application.service.js` - Job application submission and tracking
- `file.service.js` - File upload and management for resumes and images
- `onemap.service.js` - Integration with OneMap API for location services
- `skills.service.js` - Integration with Skills API for standardized skills
- `university.service.js` - Integration with University API for education validation

#### `/src/hooks`
Custom React hooks for reusable logic:

- `useAuth.js` - Authentication state and operations
- `useForm.js` - Form state management and validation
- `useApi.js` - API request handling with loading and error states
- `useJobFilters.js` - Job search filter state management
- `useLocalStorage.js` - Persistent client-side storage wrapper

#### `/src/utils`
Helper functions used throughout the application:

- `dateUtils.js` - Date formatting and manipulation
- `formatters.js` - Text formatting for display (currency, location, etc.)
- `validators.js` - Input validation functions for forms
- `errorHandlers.js` - Client-side error handling utilities

#### `/src/assets`
Static resources used in the application:

- `images/` - Icons, illustrations, and other image assets
- `fonts/` - Custom font files
- `placeholders/` - Placeholder images for testing

#### Key Root Files

- `App.jsx` - Application entry point with route configuration
  - Defines all application routes and their corresponding components
  - Handles authentication state and protected routes
  - Manages global application state

- `main.jsx` - React application initialization
  - Renders the App component to the DOM
  - Sets up provider components for global state
  - Configures global styles and themes

- `index.css` - Global CSS styles
  - Contains Tailwind CSS directives
  - Defines global variables and base styles
  - Sets up responsive breakpoints

- `vite.config.js` - Build configuration
  - Configures development server
  - Sets up build optimization
  - Defines environment variables and plugins

### Database Implementation

InternLink uses MongoDB with multiple database connections to organize data by domain:

```javascript
// From models/application.model.js
const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  // Schema definition
  // ...existing code...
});

// Creating database connection for applications
const applicationsDb = mongoose.connection.useDb('applications', { useCache: true });
const Application = applicationsDb.model('Application', ApplicationSchema);

export default Application;
```

This architecture provides clean separation between different data domains (users, jobs, applications) while maintaining relationships through referenced IDs.

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
Our controllers implement repository-like functionality by abstracting data access:

```javascript
// Example from job.controller.js
export const getInternshipJobById = async (req, res) => {
  try {
    // Repository-like abstraction of data access
    const job = await InternshipJob.findById(req.params.id);
    
    // ...existing code...
  } catch (error) {
    // ...existing code...
  }
};
```

**Why it's the Repository Pattern**: This approach hides the database implementation details from the rest of the application. Controllers don't need to know how data is stored or retrieved - they just work with a simple interface to access data, making it easier to change the database implementation later without affecting business logic.

#### Factory Pattern
Our application implements the Factory Pattern in our controller logic where we create different types of jobs:

```javascript
// From job.controller.js - Factory pattern implementation for job creation
export const createJob = async (req, res) => {
  try {
    const jobData = {
      title: req.body.title,
      company: req.body.company,
      // ...existing code...
    };
    
    // Factory pattern: creating different job types based on condition
    let job;
    if (req.params.type === 'internship') {
      // Create an internship job with specific fields
      job = await InternshipJob.create({
        ...jobData,
        stipend: req.body.stipend,
        duration: req.body.duration
        // ...existing code...
      });
    } else if (req.params.type === 'adhoc') {
      // Create an ad-hoc job with specific fields
      job = await AdHocJob.create({
        ...jobData,
        payPerHour: req.body.payPerHour
        // ...existing code...
      });
    }
    
    // ...existing code...
  } catch (error) {
    // ...existing code...
  }
};
```

**Why it's the Factory Pattern**: This code centralizes the creation logic for different types of job objects. The route handler doesn't need to know the details of creating each job type - it just calls this function and gets back the right kind of job. It's like a factory that takes in raw materials (job data) and produces different products (internship or ad-hoc jobs) based on specifications.

#### Observer Pattern
Event handling for UI updates is implemented using React hooks:

```javascript
// Example from React components
const [notifications, setNotifications] = useState([]);

// Observer-like pattern for UI updates
useEffect(() => {
  // Update UI when data changes
  // ...existing code...
}, [dependencies]);
```

**Why it's the Observer Pattern**: This pattern allows components to "observe" changes in state and react accordingly. The `useEffect` hook acts as an observer that watches for changes in the dependency array. When those dependencies change, the effect runs - just like how subscribers get notified when the subject they're observing changes. This creates a loosely coupled system where state changes automatically trigger UI updates.

#### Facade Pattern
API services abstract complex backend interactions:

```javascript
// Example from our service files
export const jobService = {
  getJobs: async (filters) => {
    // Complex API interaction hidden behind simple interface
    // ...existing code...
  },
  
  applyForJob: async (jobId, applicationData) => {
    // Multiple operations abstracted behind single method
    // ...existing code...
  }
};
```

**Why it's the Facade Pattern**: This pattern simplifies complex systems by providing a user-friendly interface. Our service layer hides all the complexity of API calls, error handling, data transformation, and state management behind simple methods. Components don't need to worry about HTTP requests, headers, or response parsing - they just call these simple methods and get back exactly what they need. It's like having a concierge who handles all the complicated details for you.

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

© 2025 InternLink – Developed by Ewen and Yong Xuen from SC2006 Group 2 (FDAD)