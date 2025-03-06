/*
MongoDB Schema for Jobs Collection:
{
    _id: ObjectId,
    type: String,           // "internship" or "adhoc"
    title: String,          // Job title
    company: String,        // Company name
    companyId: ObjectId,    // Reference to employer's company profile
    location: String,       // Job location
    category: String,       // Job category/field
    description: String,    // Detailed job description
    requirements: [String], // Array of requirements/skills
    salary: {              // Salary information
        type: String,      // "fixed", "range", or "negotiable"
        min: Number,       // Minimum salary (if range)
        max: Number,       // Maximum salary (if range)
        amount: Number,    // Fixed amount (if fixed)
        period: String     // "hour", "day", "month", "year"
    },
    // Internship specific fields
    duration: {            // For internships
        months: Number,    // Duration in months
        startDate: Date,   // Expected start date
        endDate: Date      // Expected end date
    },
    // Ad hoc specific fields
    adHocDuration: {       // For ad hoc jobs
        days: Number,      // Duration in days
        startDate: Date,   // Start date
        flexible: Boolean  // If timing is flexible
    },
    status: String,        // "active", "closed", "draft"
    postedDate: Date,      // When the job was posted
    deadline: Date,        // Application deadline
    applicants: [{         // Array of applicants
        userId: ObjectId,  // Reference to user profile
        status: String,    // "pending", "reviewed", "accepted", "rejected"
        appliedDate: Date
    }]
}
*/

// Current company information (for development)
const currentCompany = {
    name: "Tech Solutions Pte Ltd",
    id: "1"
};

// Example job data (all from the current company for development)
const exampleJobs = [
    // Internship Posts
    {
        _id: "1",
        type: "internship",
        title: "Software Development Intern",
        company: currentCompany.name,
        location: "Central",
        category: "IT",
        description: "Join our dynamic team to develop cutting-edge web applications using modern technologies.",
        requirements: ["JavaScript", "React", "Node.js"],
        duration: {
            months: 3,
            startDate: "2024-05-01",
            endDate: "2024-07-31"
        },
        salary: {
            type: "fixed",
            amount: 1000,
            period: "month"
        }
    },
    {
        _id: "2",
        type: "internship",
        title: "Marketing Intern",
        company: currentCompany.name,
        location: "East",
        category: "Business",
        description: "Assist in planning and executing digital marketing campaigns.",
        requirements: ["Social Media", "Content Creation", "Analytics"],
        duration: {
            months: 6,
            startDate: "2024-06-01",
            endDate: "2024-11-30"
        },
        salary: {
            type: "range",
            min: 800,
            max: 1200,
            period: "month"
        }
    },
    {
        _id: "3",
        type: "internship",
        title: "Data Analytics Intern",
        company: currentCompany.name,
        location: "North",
        category: "IT",
        description: "Work with big data sets and create meaningful insights using modern analytics tools.",
        requirements: ["Python", "SQL", "Data Visualization"],
        duration: {
            months: 4,
            startDate: "2024-05-15",
            endDate: "2024-09-15"
        },
        salary: {
            type: "fixed",
            amount: 1200,
            period: "month"
        }
    },
    {
        _id: "4",
        type: "internship",
        title: "UI/UX Design Intern",
        company: currentCompany.name,
        location: "Central",
        category: "Design",
        description: "Create engaging user interfaces and improve user experiences for web and mobile applications.",
        requirements: ["Figma", "Adobe XD", "User Research"],
        duration: {
            months: 3,
            startDate: "2024-06-15",
            endDate: "2024-09-15"
        },
        salary: {
            type: "fixed",
            amount: 900,
            period: "month"
        }
    },
    {
        _id: "5",
        type: "internship",
        title: "Business Development Intern",
        company: currentCompany.name,
        location: "South",
        category: "Business",
        description: "Support business expansion initiatives and market research projects.",
        requirements: ["Market Research", "Business Strategy", "Communication"],
        duration: {
            months: 5,
            startDate: "2024-07-01",
            endDate: "2024-11-30"
        },
        salary: {
            type: "range",
            min: 900,
            max: 1300,
            period: "month"
        }
    },
    {
        _id: "6",
        type: "internship",
        title: "Engineering Intern",
        company: currentCompany.name,
        location: "West",
        category: "Engineering",
        description: "Work on mechanical design projects and product development initiatives.",
        requirements: ["CAD", "3D Modeling", "Product Design"],
        duration: {
            months: 4,
            startDate: "2024-05-01",
            endDate: "2024-08-31"
        },
        salary: {
            type: "fixed",
            amount: 1100,
            period: "month"
        }
    },
    // Ad Hoc Posts
    {
        _id: "7",
        type: "adhoc",
        title: "Event Assistant",
        company: currentCompany.name,
        location: "Central",
        category: "Events",
        description: "Support event setup and coordination for a major tech conference.",
        requirements: ["Customer Service", "Physical Setup", "Event Experience"],
        adHocDuration: {
            days: 3,
            startDate: "2024-04-15",
            flexible: false
        },
        salary: {
            type: "fixed",
            amount: 120,
            period: "day"
        }
    },
    {
        _id: "8",
        type: "adhoc",
        title: "Photography Assistant",
        company: currentCompany.name,
        location: "East",
        category: "Media",
        description: "Assist in professional photo shoots and equipment management.",
        requirements: ["Photography Basics", "Equipment Handling", "Teamwork"],
        adHocDuration: {
            days: 2,
            startDate: "2024-04-20",
            flexible: true
        },
        salary: {
            type: "fixed",
            amount: 150,
            period: "day"
        }
    },
    {
        _id: "9",
        type: "adhoc",
        title: "Market Research Survey",
        company: currentCompany.name,
        location: "North",
        category: "Research",
        description: "Conduct street surveys and data collection for market research.",
        requirements: ["Communication", "Data Collection", "People Skills"],
        adHocDuration: {
            days: 5,
            startDate: "2024-04-22",
            flexible: true
        },
        salary: {
            type: "fixed",
            amount: 90,
            period: "day"
        }
    },
    {
        _id: "10",
        type: "adhoc",
        title: "Warehouse Assistant",
        company: currentCompany.name,
        location: "West",
        category: "Logistics",
        description: "Help with inventory counting and warehouse organization.",
        requirements: ["Physical Fitness", "Attention to Detail", "Basic Math"],
        adHocDuration: {
            days: 4,
            startDate: "2024-04-25",
            flexible: false
        },
        salary: {
            type: "fixed",
            amount: 100,
            period: "day"
        }
    },
    {
        _id: "11",
        type: "adhoc",
        title: "Food Festival Helper",
        company: currentCompany.name,
        location: "Central",
        category: "F&B",
        description: "Assist in food stall operations during a weekend food festival.",
        requirements: ["F&B Experience", "Customer Service", "Cash Handling"],
        adHocDuration: {
            days: 2,
            startDate: "2024-05-01",
            flexible: false
        },
        salary: {
            type: "fixed",
            amount: 110,
            period: "day"
        }
    },
    {
        _id: "12",
        type: "adhoc",
        title: "Exhibition Guide",
        company: currentCompany.name,
        location: "South",
        category: "Arts",
        description: "Guide visitors and provide information at an art exhibition.",
        requirements: ["Art Knowledge", "Communication", "Languages"],
        adHocDuration: {
            days: 3,
            startDate: "2024-05-05",
            flexible: false
        },
        salary: {
            type: "fixed",
            amount: 130,
            period: "day"
        }
    }
];

// Function to fetch jobs from MongoDB (currently using example data)
async function fetchEmployerJobs() {
    try {
        // TODO: Replace with actual MongoDB fetch call
        // const response = await fetch('/api/employer/jobs');
        // const jobs = await response.json();
        
        // Using example data for development
        const jobs = exampleJobs;
        displayEmployerJobs(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
    }
}

function createJobElement(job) {
    const jobBox = document.createElement('div');
    jobBox.className = 'job-box';
    
    // Common elements
    let jobInfo = `
        <h3 class="job-title">${job.title}</h3>
        <p class="job-company">${job.company}</p>
        <p class="job-description">${job.description}</p>
        <div class="job-requirements">
    `;

    // Add specific information based on job type
    if (job.type === 'internship') {
        jobInfo += `
            <span>📍 ${job.location}</span>
            <span>⏱️ ${job.duration.months} months</span>
            <span>🎓 ${job.salary.amount}/${job.salary.period}</span>
            <span>📅 ${new Date(job.duration.startDate).toLocaleDateString()} - ${new Date(job.duration.endDate).toLocaleDateString()}</span>
        `;
    } else {
        jobInfo += `
            <span>📍 ${job.location}</span>
            <span>⏱️ ${job.adHocDuration.days} days</span>
            <span>💰 $${job.salary.amount}/${job.salary.period}</span>
            <span>📅 ${new Date(job.adHocDuration.startDate).toLocaleDateString()}</span>
        `;
    }

    jobInfo += `
        </div>
        <div class="button-container">
            <button onclick="window.location.href='EP_JobDetails_Page.html?id=${job._id}'" class="see-details-btn">See Details</button>
            <button onclick="deleteJob('${job._id}')" class="delete-btn">Delete</button>
        </div>
    `;

    jobBox.innerHTML = jobInfo;
    return jobBox;
}

// Function to display jobs in a specified container
function displayEmployerJobs(jobs, containerId = 'jobListings') {
    const jobListings = document.getElementById(containerId);
    if (!jobListings) return;
    jobListings.innerHTML = '';

    // Filter jobs based on current page
    const currentPage = window.location.pathname;
    const filteredJobs = jobs.filter(job => {
        if (currentPage.includes('Post_Internship_Page.html')) {
            return job.type === 'internship';
        } else if (currentPage.includes('Post_AdHoc_Page.html')) {
            return job.type === 'adhoc';
        }
        return true;
    });

    filteredJobs.forEach(job => {
        jobListings.appendChild(createJobElement(job));
    });
}

// Function to toggle filter dropdown
function toggleFilter(event) {
    event.stopPropagation();
    const filterDropdown = document.getElementById('filterDropdown');
    filterDropdown.classList.toggle('show');
}

// Function to handle search and filtering
function handleSearch(event) {
    if (event) {
        event.stopPropagation();
        const filterDropdown = document.getElementById('filterDropdown');
        filterDropdown.classList.remove('show');
    }

    const searchInput = document.querySelector('.search-box input').value.toLowerCase();
    const locationSelect = document.querySelector('.filter-section select');
    const locationFilter = locationSelect ? locationSelect.value.toLowerCase() : '';

    // Re-fetch and filter jobs
    const currentJobs = exampleJobs;
    const filtered = currentJobs.filter(job => {
        const matchesSearch = 
            job.title.toLowerCase().includes(searchInput) ||
            job.description.toLowerCase().includes(searchInput) ||
            job.company.toLowerCase().includes(searchInput);
        
        const matchesLocation = !locationFilter || 
            job.location.toLowerCase() === locationFilter;

        return matchesSearch && matchesLocation;
    });

    displayEmployerJobs(filtered);
}

// Function to delete job
async function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job post?')) {
        try {
            // Replace with actual MongoDB delete call
            await fetch(`/api/employer/jobs/${jobId}`, {
                method: 'DELETE'
            });
            // Refresh jobs list
            fetchEmployerJobs();
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the profile page
    const isProfilePage = window.location.pathname.includes('EP_Profile_Page.html');
    if (isProfilePage) {
        // On profile page, show all jobs from the company without filters
        displayEmployerJobs(exampleJobs, 'companyJobListings');
    } else {
        // On job listing pages, show filtered jobs with search functionality
        fetchEmployerJobs();
        
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const locationFilter = document.getElementById('locationFilter');
        
        if (searchInput) searchInput.addEventListener('input', handleSearch);
        if (categoryFilter) categoryFilter.addEventListener('change', handleSearch);
        if (locationFilter) locationFilter.addEventListener('change', handleSearch);
    }
});
