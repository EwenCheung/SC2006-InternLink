import React, { useState, useCallback } from 'react';

const useProfileValidation = (initialValues = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validationRules = {
        userName: [
            { required: true, message: 'Name is required' },
            { pattern: /^[a-zA-Z\s]{2,}$/, message: 'Name must contain only letters and spaces' }
        ],
        email: [
            { required: true, message: 'Email is required' }
        ],
        phoneNumber: [
            { pattern: /^\+?[\d\s-]{8,}$/, message: 'Please enter a valid contact number' }
        ],
        yearOfStudy: [
            { oneOf: ['Year 1', 'Year 2', 'Year 3', 'Year 4'], message: 'Please select a valid year' }
        ]
    };

    const validateField = (field, value) => {
        if (!validationRules[field]) return null;
        if (!value) return null; // Skip validation if field is empty and not required

        for (const rule of validationRules[field]) {
            if (rule.required && !value) {
                return rule.message;
            }
            if (value && rule.pattern && !rule.pattern.test(value)) {
                return rule.message;
            }
            if (value && rule.oneOf && !rule.oneOf.includes(value)) {
                return rule.message;
            }
            if (value && rule.minLength && value.length < rule.minLength) {
                return rule.message;
            }
            if (value && rule.custom && !rule.custom(value)) {
                return rule.message;
            }
        }

        return null;
    };

    const handleChange = useCallback((field, value) => {
        // Immediate synchronous state update
        setValues(prev => {
            const newValues = {
                ...prev,
                [field]: value
            };
            // Clear error when user starts typing
            setErrors(prev => ({ ...prev, [field]: null }));
            return newValues;
        });
    }, []);


    const handleBlur = (field) => {
        // Validate and mark as touched only on blur
        setTouched(prev => ({ ...prev, [field]: true }));
        if (validationRules[field]) {
            const error = validateField(field, values[field]);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    };

    const validateAll = () => {
        const newErrors = {};
        let isValid = true;

        // Only validate userName as required
        if (!values.userName) {
            newErrors.userName = 'Name cannot be empty';
            isValid = false;
        } else if (!/^[a-zA-Z\s]{2,}$/.test(values.userName)) {
            newErrors.userName = 'Name must contain only letters and spaces';
            isValid = false;
        }

        // Only validate other fields if they have values
        Object.entries(values).forEach(([field, value]) => {
            if (field === 'email' || field === 'userName') return;

            // Skip validation for empty optional fields
            if (!value || (typeof value === 'string' && value.trim() === '')) return;

            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
            }
        });

        setErrors(newErrors);
        return {
            isValid,
            errors: newErrors
        };
    };

    const resetForm = (newValues = initialValues) => {
        const processedValues = {};
        // Ensure all fields from initialValues are preserved
        Object.keys(initialValues).forEach(key => {
            processedValues[key] = newValues[key] || initialValues[key] || '';
        });
        setValues(processedValues);
        setErrors({});
        setTouched({});
    };

    const hasUnsavedChanges = () => {
        return Object.keys(touched).some(key => touched[key]);
    };

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        resetForm,
        hasUnsavedChanges,
        setValues
    };
};

export default useProfileValidation;
