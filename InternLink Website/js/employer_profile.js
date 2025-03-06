let isEditMode = false;

// Example company profile data (replace with actual data from backend)
const companyProfile = {
    companyName: "Tech Solutions Pte Ltd",
    profileImage: "../../Images/Logo2.png",
    hrName: "John Smith",
    hrContact: "+65 9123 4567",
    yearStarted: "2010",
    country: "Singapore",
    employeeSize: "100-500"
};

// Function to load profile information
function loadProfileInfo() {
    document.getElementById('companyName').textContent = companyProfile.companyName;
    document.getElementById('profileImage').src = companyProfile.profileImage;
    document.getElementById('hrName').textContent = companyProfile.hrName;
    document.getElementById('hrContact').textContent = companyProfile.hrContact;
    document.getElementById('yearStarted').textContent = companyProfile.yearStarted;
    document.getElementById('country').textContent = companyProfile.country;
    document.getElementById('employeeSize').textContent = companyProfile.employeeSize;
    
    // Set input values
    document.getElementById('hrNameInput').value = companyProfile.hrName;
    document.getElementById('hrContactInput').value = companyProfile.hrContact;
    document.getElementById('yearStartedInput').value = companyProfile.yearStarted;
    document.getElementById('countryInput').value = companyProfile.country;
    document.getElementById('employeeSizeInput').value = companyProfile.employeeSize;
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
        hrName: document.getElementById('hrNameInput').value,
        hrContact: document.getElementById('hrContactInput').value,
        yearStarted: document.getElementById('yearStartedInput').value,
        country: document.getElementById('countryInput').value,
        employeeSize: document.getElementById('employeeSizeInput').value
    };

    // Update the display
    document.getElementById('hrName').textContent = updatedProfile.hrName;
    document.getElementById('hrContact').textContent = updatedProfile.hrContact;
    document.getElementById('yearStarted').textContent = updatedProfile.yearStarted;
    document.getElementById('country').textContent = updatedProfile.country;
    document.getElementById('employeeSize').textContent = updatedProfile.employeeSize;

    // TODO: Send updated profile to server
    Object.assign(companyProfile, updatedProfile);
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

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadProfileInfo();

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
