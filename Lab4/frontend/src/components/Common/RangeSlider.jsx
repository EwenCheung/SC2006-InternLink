import React from 'react';
import { Slider, Box, Typography } from '@mui/material';
import styles from './RangeSlider.module.css';

const RangeSlider = ({ value, onChange, min, max, type = 'money', step = null }) => {
  const formatValue = (value) => {
    if (type === 'money') {
      return `$${value}`;
    } else if (type === 'months') {
      return `${value} ${value === 1 ? 'month' : 'months'}`;
    }
    return value;
  };

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  // Set default step based on range type
  const sliderStep = step || (type === 'money' ? 100 : 1);

  return (
    <Box className={styles.sliderContainer}>
      <Typography className={styles.rangeLabel}>
        {formatValue(value[0])} - {formatValue(value[1])}
      </Typography>
      <Slider
        value={value}
        onChange={handleChange}
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
