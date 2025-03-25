document.addEventListener("DOMContentLoaded", async function () {
    const schoolSelect = document.getElementById("school");
    const courseSelect = document.getElementById("dropdownMenu");
    const datasetId = "d_3c55210de27fcccda2ed0c63fdd2b352";
    const apiUrl = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}&limit=1000`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.result && data.result.records) {
            const uniqueUniversities = new Set();
            const universityCourses = {};

            data.result.records.forEach(record => {
                uniqueUniversities.add(record.university);
                if (!universityCourses[record.university]) {
                    universityCourses[record.university] = new Set();
                }
                universityCourses[record.university].add(record.degree);
            });

            uniqueUniversities.forEach(university => {
                let option = document.createElement("option");
                option.value = university;
                option.textContent = university;
                schoolSelect.appendChild(option);
            });

            schoolSelect.addEventListener("change", function () {
                const selectedUniversity = schoolSelect.value;
                courseSelect.innerHTML = '<option value="">Select your course</option>'; // Clear previous options

                if (universityCourses[selectedUniversity]) {
                    universityCourses[selectedUniversity].forEach(course => {
                        let option = document.createElement("option");
                        option.value = course;
                        option.textContent = course;
                        courseSelect.appendChild(option);
                    });
                }
            });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});
