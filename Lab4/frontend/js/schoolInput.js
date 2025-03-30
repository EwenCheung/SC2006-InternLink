import { useEffect, useState } from "react";
import { fetchUniversities } from "./fetchUniversities";

export default function SchoolInput({ optionalData, handleOptionalChange, styles }) {
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    fetchUniversities().then(setUniversities);
  }, []);

  return (
    <div className={styles.inputGroup}>
      <label htmlFor="school" className={styles.label}>
        Institution Name <span className={styles.optional}>(optional)</span>
      </label>
      <select
        id="school"
        name="school"
        value={optionalData.school}
        onChange={handleOptionalChange}
        className={styles.input}
      >
        <option value="">Select your institution</option>
        {universities.map((uni, index) => (
          <option key={index} value={uni}>
            {uni}
          </option>
        ))}
      </select>
    </div>
  );
}
