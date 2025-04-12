import mongoose from 'mongoose';

// Valid options for dropdown fields
const VALID_DURATIONS = [
  '1 month',
  '2 months',
  '3 months',
  '4 months',
  '5 months',
  '6 months',
  '8 months',
  '12 months'
];

const VALID_YEARS = [
  'Year 1',
  'Year 2',
  'Year 3',
  'Year 4',
  'Any Year'
];

// Enhanced structure for fields and courses
const FIELDS_AND_COURSES = {
  "Computer Science & IT": [
    "Computer Science",
    "Information Technology",
    "Software Engineering",
    "Information Systems",
    "Cybersecurity",
    "Artificial Intelligence",
    "Data Science",
    "Computer Graphics",
    "Computer Networking",
    "Human-Computer Interaction",
    "Machine Learning",
    "Computer Vision",
    "Natural Language Processing",
    "Robotics",
    "Quantum Computing",
    "Cloud Computing",
    "Internet of Things (IoT)",
    "Blockchain Technology",
    "Augmented Reality",
    "Virtual Reality"
  ],
  "Business & Analytics": [
    "Business Administration",
    "Business Analytics",
    "Marketing Analytics",
    "Financial Analytics",
    "Business Intelligence",
    "Operations Management",
    "Management Information Systems",
    "Supply Chain Analytics",
    "Accounting",
    "Finance",
    "Marketing",
    "Human Resource Management",
    "International Business",
    "Entrepreneurship",
    "Economics",
    "E-commerce",
    "Organizational Behavior",
    "Strategic Management",
    "Project Management"
  ],
  "Engineering": [
    "Computer Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Biomedical Engineering",
    "Environmental Engineering",
    "Aerospace Engineering",
    "Materials Engineering",
    "Industrial Engineering",
    "Nuclear Engineering",
    "Petroleum Engineering",
    "Automotive Engineering",
    "Marine Engineering",
    "Mechatronics Engineering",
    "Structural Engineering",
    "Telecommunications Engineering",
    "Systems Engineering",
    "Geotechnical Engineering"
  ],
  "Natural Sciences": [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "Statistics",
    "Environmental Science",
    "Biotechnology",
    "Neuroscience",
    "Geology",
    "Astronomy",
    "Oceanography",
    "Meteorology",
    "Ecology",
    "Zoology",
    "Botany",
    "Genetics",
    "Microbiology",
    "Paleontology",
    "Astrophysics"
  ],
  "Social Sciences & Humanities": [
    "Psychology",
    "Economics",
    "Sociology",
    "Political Science",
    "Communication Studies",
    "Linguistics",
    "History",
    "Philosophy",
    "International Relations",
    "Anthropology",
    "Archaeology",
    "Religious Studies",
    "Cultural Studies",
    "Gender Studies",
    "Human Geography",
    "Education",
    "Law",
    "Social Work",
    "Criminology"
  ],
  "Design & Media": [
    "Digital Media",
    "Graphic Design",
    "User Experience Design",
    "Animation",
    "Game Design",
    "Music Technology",
    "Film Studies",
    "Fashion Design",
    "Interior Design",
    "Industrial Design",
    "Photography",
    "Visual Arts",
    "Performing Arts",
    "Theatre Studies",
    "Sound Design",
    "Media Production",
    "Advertising",
    "Public Relations",
    "Journalism"
  ],
  "Health & Medical Sciences": [
    "Medicine",
    "Nursing",
    "Pharmacy",
    "Dentistry",
    "Public Health",
    "Physiotherapy",
    "Occupational Therapy",
    "Nutrition and Dietetics",
    "Biomedical Science",
    "Veterinary Medicine",
    "Radiography",
    "Speech and Language Therapy",
    "Optometry",
    "Midwifery",
    "Medical Laboratory Science",
    "Health Informatics",
    "Clinical Psychology",
    "Epidemiology",
    "Genetic Counseling"
  ],
  "Education": [
    "Early Childhood Education",
    "Primary Education",
    "Secondary Education",
    "Special Education",
    "Educational Leadership",
    "Curriculum and Instruction",
    "Educational Technology",
    "Adult Education",
    "Higher Education",
    "Educational Psychology",
    "Counselor Education",
    "Language Education",
    "Mathematics Education",
    "Science Education",
    "Physical Education",
    "Art Education",
    "Music Education",
    "Vocational Education",
    "Instructional Design"
  ],
  "Agriculture & Environmental Studies": [
    "Agricultural Science",
    "Horticulture",
    "Animal Science",
    "Soil Science",
    "Agribusiness",
    "Forestry",
    "Fisheries Science",
    "Wildlife Management",
    "Environmental Management",
    "Sustainable Agriculture",
    "Food Science and Technology",
    "Plant Pathology",
    "Entomology",
    "Agricultural Engineering",
    "Agroecology",
    "Climate Science",
    "Natural Resource Management",
    "Water Resources Management",
    "Rural Development"
  ],
  "Architecture & Built Environment": [
    "Architecture",
    "Urban Planning",
    "Landscape Architecture",
    "Interior Architecture",
    "Construction Management",
    "Quantity Surveying",
    "Building Services Engineering",
    "Real Estate",
    "Sustainable Design",
    "Historic Preservation",
    "Urban Design",
    "Environmental Design",
    "Structural Engineering",
    "Building Information Modeling (BIM)",
    "Housing Studies",
    "Transportation Planning",
    "Regional Planning",
    "Urban Studies",
    "Facility Management"
  ]
};

// Flatten the FIELDS_AND_COURSES structure for validation
const VALID_COURSES = Object.values(FIELDS_AND_COURSES).flat();

const VALID_FIELDS = Object.keys(FIELDS_AND_COURSES);

// Ad Hoc Job Schema
const adHocJobSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'adhoc_job',
    required: true
  },
  title: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  description: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  jobScope: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  company: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  location: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  tags: {
    type: [String],
    default: [],
  },
  payPerHour: {
    type: Number,
    required: function() { return this.status !== 'draft'; },
    min: [0, 'Pay per hour cannot be negative']
  },
  jobType: {
    type: String,
    default: 'adhoc',
    required: true,
  },
  employerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['draft', 'posted'],
    default: 'posted'
  },
  applicationDeadline: {
    type: Date,
    required: function() { return this.status !== 'draft'; },
    validate: {
      validator: function(value) {
        return this.status === 'draft' || value > new Date();
      },
      message: 'Application deadline must be a future date'
    }
  }
});

// Internship Job Schema
const internshipJobSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'internship_job',
    required: true
  },
  title: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  description: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  company: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  location: {
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  area:{
    type: String,
    required: function() { return this.status !== 'draft'; }
  },
  tags: {
    type: [String],
    default: [],
  },
  stipend: {
    type: Number,
    required: function() { return this.status !== 'draft'; },
    min: [0, 'Stipend cannot be negative']
  },
  duration: {
    type: String,
    required: function() { return this.status !== 'draft'; },
    enum: {
      values: VALID_DURATIONS,
      message: 'Invalid duration selected'
    }
  },
  jobType: {
    type: String,
    default: 'internship',
    required: true,
  },
  fieldOfStudy: {
    type: String,
    enum: {
      values: VALID_FIELDS,
      message: 'Invalid field selected'
    }
  },
  courseStudy: {
    type: String,
    required: function() { return this.status !== 'draft'; },
    enum: {
      values: VALID_COURSES,
      message: 'Invalid course selected'
    }
  },
  yearOfStudy: {
    type: String,
    required: function() { return this.status !== 'draft'; },
    enum: {
      values: VALID_YEARS,
      message: 'Invalid year of study selected'
    }
  },
  views: {
    type: Number,
    default: 0
  },
  employerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['draft', 'posted'],
    default: 'draft' // Changed default to draft
  },
  applicationDeadline: {
    type: Date,
    required: function() { return this.status !== 'draft'; },
    validate: {
      validator: function(value) {
        return this.status === 'draft' || value > new Date();
      },
      message: 'Application deadline must be a future date'
    }
  }
});

// Add pre-save middleware to validate posted jobs
const validatePostedJob = function(next) {
  if (this.status === 'posted') {
    const requiredFields = [
      'title', 'description', 'company', 'location', 'applicationDeadline'
    ];

    if (this.jobType === 'internship') {
      requiredFields.push('stipend', 'duration', 'courseStudy', 'yearOfStudy');
    } else {
      requiredFields.push('payPerHour');
    }

    const missingFields = requiredFields.filter(field => {
      const value = this[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      next(new Error(`Missing required fields for posted job: ${missingFields.join(', ')}`));
      return;
    }

    // Validate numeric fields
    if (this.jobType === 'internship') {
      if (typeof this.stipend !== 'number' || this.stipend < 0) {
        next(new Error('Stipend must be a non-negative number'));
        return;
      }
    } else {
      if (typeof this.payPerHour !== 'number' || this.payPerHour < 0) {
        next(new Error('Pay per hour must be a non-negative number'));
        return;
      }
    }

    // Validate application deadline
    if (this.applicationDeadline && this.applicationDeadline <= new Date()) {
      next(new Error('Application deadline must be a future date'));
      return;
    }
  }
  next();
};

internshipJobSchema.pre('save', validatePostedJob);
adHocJobSchema.pre('save', validatePostedJob);

// Export valid options for use in frontend dropdowns
export const INTERNSHIP_OPTIONS = {
  DURATIONS: VALID_DURATIONS,
  YEARS: VALID_YEARS,
  COURSES: VALID_COURSES,
  FIELDS: VALID_FIELDS,
  FIELDS_AND_COURSES: FIELDS_AND_COURSES
};

// Add default deadline values (30 days from current date)
export const DEFAULT_DEADLINE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

// Get job_list database connection
const jobListDb = mongoose.connection.useDb('job_list', { useCache: true });

// Create and export models
const InternshipJob = jobListDb.model('InternshipJob', internshipJobSchema);
const AdHocJob = jobListDb.model('AdHocJob', adHocJobSchema);


export { InternshipJob, AdHocJob };
