import React, { useEffect, useState } from 'react';
import { Slider, Box, Typography } from '@mui/material';
import styles from './RangeSlider.module.css';

const RangeSlider = ({ value, onChange, min, max, type = 'money', step = null }) => {
  // Keep local state to avoid jittering
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const formatValue = (value) => {
    if (type === 'money') {
      return `$${value}`;
    } else if (type === 'months') {
      return `${value} ${value === 1 ? 'month' : 'months'}`;
    }
    return value;
  };

  const handleChange = (event, newValue) => {
    setLocalValue(newValue);
  };

  // Only trigger parent onChange when the user finishes dragging
  const handleChangeCommitted = (event, newValue) => {
    onChange(newValue);
    console.log(`Range changed: ${newValue[0]} - ${newValue[1]}`);
  };

  // Set default step based on range type if not explicitly provided
  const sliderStep = step !== null ? step : (type === 'money' ? 100 : 1);
  
  console.log(`Slider for ${type} using step: ${sliderStep}`);

  return (
    <Box className={styles.sliderContainer}>
      <div className={styles.rangeDisplay}>
        <Typography className={styles.rangeLabel}>
          {formatValue(localValue[0])}
        </Typography>
        <Typography className={styles.rangeLabel}>
          {formatValue(localValue[1])}
        </Typography>
      </div>
      <Slider
        value={localValue}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay="auto"
        min={min}
        max={max}
        step={sliderStep}
        valueLabelFormat={formatValue}
        className={styles.rangeSlider}
      />
    </Box>
  );
};

export default RangeSlider;
