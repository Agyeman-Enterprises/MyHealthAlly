import themeData from './theme.json';

export type Theme = typeof themeData;

export const theme: Theme = themeData;

// Helper functions for accessing theme values
export const getColor = (key: keyof Theme['colors']) => theme.colors[key];
export const getSpacing = (key: keyof Theme['spacing']) => theme.spacing[key];
export const getShadow = (key: keyof Theme['shadows']) => theme.shadows[key];
export const getRadius = (key: keyof Theme['radius']) => theme.radius[key];

// CSS variable generation
export const generateCSSVariables = () => {
  const vars: Record<string, string> = {};
  
  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars[`--color-${key}`] = value;
  });
  
  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    vars[`--spacing-${key}`] = `${value}px`;
  });
  
  // Radius
  Object.entries(theme.radius).forEach(([key, value]) => {
    vars[`--radius-${key}`] = `${value}px`;
  });
  // Default radius (md)
  vars['--radius'] = `${theme.radius.md}px`;
  
  // Typography
  vars['--font-family'] = theme.typography.fontFamily;
  Object.entries(theme.typography).forEach(([key, value]) => {
    if (key !== 'fontFamily' && typeof value === 'object') {
      vars[`--font-${key}-size`] = `${value.size}px`;
      vars[`--font-${key}-weight`] = value.weight.toString();
    }
  });
  
  // Shadows
  vars['--shadow-sm'] = theme.shadows.sm;
  vars['--shadow-md'] = theme.shadows.md;
  
  return vars;
};

export default theme;

