import { useState, useCallback } from 'react';

const useFormValidation = (initialState, validationRules) => {
    const [values, setValues] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validate = useCallback((fieldName, value) => {
        if (!validationRules[fieldName]) return '';

        const rules = validationRules[fieldName];
        let error = '';

        for (const rule of rules) {
            if (rule.required && !value) {
                error = `${fieldName} is required`;
                break;
            }
            if (rule.pattern && !rule.pattern.test(value)) {
                error = rule.message;
                break;
            }
            if (rule.validate && !rule.validate(value)) {
                error = rule.message;
                break;
            }
        }

        return error;
    }, [validationRules]);

    const handleChange = useCallback((fieldName, value) => {
        setValues(prev => ({
            ...prev,
            [fieldName]: value
        }));
        
        setErrors(prev => ({
            ...prev,
            [fieldName]: validate(fieldName, value)
        }));
    }, [validate]);

    const handleBlur = useCallback((fieldName) => {
        setTouched(prev => ({
            ...prev,
            [fieldName]: true
        }));

        setErrors(prev => ({
            ...prev,
            [fieldName]: validate(fieldName, values[fieldName])
        }));
    }, [validate, values]);

    const isValid = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        Object.keys(values).forEach(fieldName => {
            const error = validate(fieldName, values[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [validate, values]);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        isValid,
        setValues
    };
};

export default useFormValidation;
