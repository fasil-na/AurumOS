export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const STONE_SHAPE_CONFIG = {
  'Round': { dimensions: 1, labels: ['Size (mm)'], fields: ['size'] },
  'Oval': { dimensions: 2, labels: ['Length (mm)', 'Width (mm)'], fields: ['length', 'width'] },
  'Cushion': { dimensions: 2, labels: ['Length (mm)', 'Width (mm)'], fields: ['length', 'width'] },
  'Princess': { dimensions: 1, labels: ['Size (mm)'], fields: ['size'] },
  'Radiant': { dimensions: 2, labels: ['Length (mm)', 'Width (mm)'], fields: ['length', 'width'] },
  'Asscher': { dimensions: 1, labels: ['Size (mm)'], fields: ['size'] },
  'Heart': { dimensions: 1, labels: ['Size (mm)'], fields: ['size'] },
  'Emerald': { dimensions: 2, labels: ['Length (mm)', 'Width (mm)'], fields: ['length', 'width'] },
  'Pear': { dimensions: 2, labels: ['Length (mm)', 'Width (mm)'], fields: ['length', 'width'] },
  'Marquise': { dimensions: 2, labels: ['Length (mm)', 'Width (mm)'], fields: ['length', 'width'] },
  'Trillion': { dimensions: 2, labels: ['Length (mm)', 'Width (mm)'], fields: ['length', 'width'] },
  'Baguette': { dimensions: 2, labels: ['Length (mm)', 'Width (mm)'], fields: ['length', 'width'] },
  'Party Stone': { dimensions: 0, labels: [], fields: [] }
};

export const STONE_SHAPES = Object.keys(STONE_SHAPE_CONFIG);
