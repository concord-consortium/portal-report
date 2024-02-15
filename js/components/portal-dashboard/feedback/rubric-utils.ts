export type RubricCriterion = {
  id: string;
  description: string;
  nonApplicableRatings: string[];
  ratingDescriptions: Record<string, string>;
};

export type RubricRating = {
  id: string;
  label: string;
  score: number;
};

export type Rubric = {
  id: string;
  version: string;
  versionNumber: string;
  updatedMsUTC: number;
  originUrl: string;
  referenceURL: string;
  showRatingDescriptions: boolean;
  scoreUsingPoints: boolean;
  criteriaLabel: string;
  criteriaLabelForStudent: string;
  feedbackLabelForStudent: string;
  criteria: RubricCriterion[];
  ratings: RubricRating[];
}

// Utility function to convert hex color to HSL
const hexToHSL = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s: number;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
};

// Utility function to convert HSL to RGB color string
const hslToRGB = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const r = 255 * f(0);
  const g = 255 * f(8);
  const b = 255 * f(4);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};

const startColorHSL = hexToHSL('#316639'); // Dark green
const endColorHSL = hexToHSL('#bddfc2'); // Light green

// Main function to get RGB color based on value within min and max range
export const getFeedbackColor = ({rubric, score}: {rubric: Rubric; score: number}): string => {
  const {min, max} = rubric.ratings.reduce((acc, rating) => {
    acc.min = Math.min(acc.min, rating.score);
    acc.max = Math.max(acc.max, rating.score);
    return acc;
  }, {min: Infinity, max: -Infinity});

  const range = max - min;
  const scale = (score - min) / range;

  // Interpolate HSL values
  const h = startColorHSL[0] + (endColorHSL[0] - startColorHSL[0]) * scale;
  const s = startColorHSL[1] + (endColorHSL[1] - startColorHSL[1]) * scale;
  const l = startColorHSL[2] + (endColorHSL[2] - startColorHSL[2]) * scale;

  // Convert HSL back to RGB
  return hslToRGB(h, s, l);
};


