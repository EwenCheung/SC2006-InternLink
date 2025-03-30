import React from 'react';
import { Slider, Box, Typography } from '@mui/material';
import styles from './RangeSlider.module.css';

const RangeSlider = ({ value, onChange, min, max }) => {
  const formatValue = (value) => {
    return `$${value}`;
  };

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

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
        step={100}
        valueLabelFormat={formatValue}
        className={styles.rangeSlider}
      />
    </Box>
  );
};

export default RangeSlider;
