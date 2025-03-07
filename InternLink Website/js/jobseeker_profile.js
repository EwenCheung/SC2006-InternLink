// Example profile data (replace with actual data from backend)
const userProfile = {
    userName: "John Doe",
    profileImage: "../../Images/Logo2.png",
    school: "Nanyang Technological University",
    course: "Computer Science",
    yearOfStudy: "Year 2",
    email: "johndoe@email.com",
    contact: "+65 9123 4567"
};

// Example job applications (replace with actual data from backend)
const jobApplications = [
    {
        id: "1",
        title: "Software Development Intern",
        company: "Tech Solutions Pte Ltd",
        location: "Central",
        description: "Working on web application development using modern technologies.",
        requirements: ["JavaScript", "React", "Node.js"],
        status: "pending",
        appliedDate: "2024-03-01"
    },
    {
        id: "2",
        title: "Data Analytics Intern",
        company: "DataTech Solutions",
        location: "East",
        description: "Analyzing large datasets and creating meaningful insights.",
        requirements: ["Python", "SQL", "Data Visualization"],
        status: "accepted",
        appliedDate: "2024-02-15"
    },
    {
        id: "3",
        title: "Marketing Intern",
        company: "Global Marketing SG",
        location: "West",
        description: "Assisting in digital marketing campaigns and social media management.",
        requirements: ["Social Media", "Content Creation", "Analytics"],
        status: "rejected",
        appliedDate: "2024-02-01"
    }
];

let isEditMode = false;

// Function to load profile information
function loadProfileInfo() {
    document.getElementById('userName').textContent = userProfile.userName;
    document.getElementById('profileImage').src = userProfile.profileImage;
    document.getElementById('school').textContent = userProfile.school;
    document.getElementById('course').textContent = userProfile.course;
    document.getElementById('yearOfStudy').textContent = userProfile.yearOfStudy;
    document.getElementById('email').textContent = userProfile.email;
    document.getElementById('contact').textContent = userProfile.contact;

    // Set input values
    document.getElementById('schoolInput').value = userProfile.school;
    document.getElementById('courseInput').value = userProfile.course;
    document.getElementById('yearOfStudyInput').value = userProfile.yearOfStudy;
    document.getElementById('emailInput').value = userProfile.email;
    document.getElementById('contactInput').value = userProfile.contact;
}

// Function to toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    const editBtn = document.querySelector('.edit-profile-btn');
    const editableFields = document.querySelectorAll('.editable');
    const editInputs = document.querySelectorAll('.edit-input');

    if (isEditMode) {
        editBtn.textContent = 'Save Changes';
        editBtn.style.backgroundColor = '#dc3545';
        editableFields.forEach(field => field.style.display = 'none');
        editInputs.forEach(input => input.style.display = 'block');
    } else {
        // Save changes
        saveProfileChanges();
        editBtn.textContent = 'Edit Profile';
        editBtn.style.backgroundColor = '#28a745';
        editableFields.forEach(field => field.style.display = 'block');
        editInputs.forEach(input => input.style.display = 'none');
    }
}

// Function to save profile changes
function saveProfileChanges() {
    const updatedProfile = {
        school: document.getElementById('schoolInput').value,
        course: document.getElementById('courseInput').value,
        yearOfStudy: document.getElementById('yearOfStudyInput').value,
        email: document.getElementById('emailInput').value,
        contact: document.getElementById('contactInput').value
    };

    // Update the display
    document.getElementById('school').textContent = updatedProfile.school;
    document.getElementById('course').textContent = updatedProfile.course;
    document.getElementById('yearOfStudy').textContent = updatedProfile.yearOfStudy;
    document.getElementById('email').textContent = updatedProfile.email;
    document.getElementById('contact').textContent = updatedProfile.contact;

    // TODO: Send updated profile to server
    Object.assign(userProfile, updatedProfile);
}

// Function to handle profile image change
function handleImageChange(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        // Create an image element for checking dimensions
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function(e) {
            img.src = e.target.result;
            img.onload = function() {
                // Create a canvas to maintain aspect ratio
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size to desired dimensions (1:1 aspect ratio)
                const size = Math.min(img.width, img.height);
                canvas.width = size;
                canvas.height = size;

                // Calculate crop position
                const x = (img.width - size) / 2;
                const y = (img.height - size) / 2;

                // Draw the image on canvas with cropping
                ctx.drawImage(img, x, y, size, size, 0, 0, size, size);

                // Update profile image with cropped version
                document.getElementById('profileImage').src = canvas.toDataURL('image/jpeg');
                
                // TODO: Upload image to server
            };
        };
        reader.readAsDataURL(file);
    }
}

// Function to display job applications
function displayApplications() {
    const applicationListings = document.getElementById('applicationListings');
    applicationListings.innerHTML = '';

    jobApplications.forEach(job => {
        const jobBox = document.createElement('div');
        jobBox.className = 'job-box';

        jobBox.innerHTML = `
            <h3 class="job-title">${job.title}</h3>
            <p class="job-company">${job.company}</p>
            <p class="job-description">${job.description}</p>
            <div class="job-requirements">
                <span class="location">📍 ${job.location}</span>
                ${job.requirements.map(req => `<span>${req}</span>`).join('')}
            </div>
            <div class="application-info">
                <div class="application-status status-${job.status}">
                    ${job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </div>
                <button class="see-details-btn" onclick="window.location.href='JS_JobDetails_Page.html?id=${job.id}'">
                    See Details
                </button>
            </div>
        `;

        applicationListings.appendChild(jobBox);
    });
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProfileInfo();
    displayApplications();

    // Handle photo change button
    const changePhotoBtn = document.querySelector('.change-photo-btn');
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', () => {
            // Create a hidden file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            
            fileInput.addEventListener('change', handleImageChange);
            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        });
    }
});
