import React from 'react';
import {
  Grid, TextField, FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';

// Predefined options for spare parts - can be imported from a shared constants file
const sparePartOptions = [
  'Combo', 'Battery', 'Switch', 'Inner', 'Outer', 'Software', 'Hardware', 'IC', 'Custom'
];

const SparePartRow = ({ part, index, onPartChange, onRemovePart, canRemove }) => {
  // Handler to pass changes up to the parent component
  const handleChange = (e) => {
    onPartChange(index, e);
  };

  return (
    <Grid container item spacing={2} alignItems="center">
      {/* --- Part Name Dropdown --- */}
      <Grid item xs={12} sm={part.name === 'Custom' ? 4 : 7}>
        <FormControl fullWidth>
          <InputLabel>Part Name</InputLabel>
          <Select
            name="name"
            value={part.name}
            label="Part Name"
            onChange={handleChange}
          >
            {sparePartOptions.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* --- Custom Part Name Input (Conditional) --- */}
      {part.name === 'Custom' && (
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Custom Part"
            name="customName"
            value={part.customName}
            onChange={handleChange}
            required // Custom name should be required if 'Custom' is selected
          />
        </Grid>
      )}

      {/* --- Price Input --- */}
      <Grid item xs={9} sm={3}>
        <TextField
          fullWidth
          label="Price"
          name="price"
          type="number"
          value={part.price}
          onChange={handleChange}
          required
        />
      </Grid>

      {/* --- Remove Button --- */}
      <Grid item xs={3} sm={2}>
        <IconButton onClick={() => onRemovePart(index)} disabled={!canRemove}>
          <RemoveIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default SparePartRow;
