// NepaFit Color Palette - Extracted from logo design
export const Colors = {
  // Primary Colors
  primary: "#4CAF50", // Main green from logo
  primaryDark: "#2E7D32", // Darker green
  primaryLight: "#81C784", // Lighter green
  
  // Secondary Colors
  secondary: "#FF6B35", // Orange from fruits
  secondaryLight: "#FF8A50",
  
  // Accent Colors
  accent: "#FFC107", // Golden yellow
  accentLight: "#FFD54F",
  
  // Neutral Colors
  background: "#F8F9FA", // Light gray background
  surface: "#FFFFFF", // White surface
  surfaceVariant: "#F5F5F5",
  
  // Text Colors
  onPrimary: "#FFFFFF",
  onSecondary: "#FFFFFF",
  onBackground: "#212121",
  onSurface: "#212121",
  
  // Semantic Colors
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",
  
  // Gray Scale
  gray50: "#FAFAFA",
  gray100: "#F5F5F5",
  gray200: "#EEEEEE",
  gray300: "#E0E0E0",
  gray400: "#BDBDBD",
  gray500: "#9E9E9E",
  gray600: "#757575",
  gray700: "#616161",
  gray800: "#424242",
  gray900: "#212121",
  
  // Health-specific colors
  cholesterolGood: "#4CAF50",
  cholesterolModerate: "#FF9800",
  cholesterolHigh: "#F44336",
  
  // Progress bar gradient colors
  progressExcellent: "#4CAF50",    // Green - Excellent
  progressGood: "#8BC34A",         // Light green - Good  
  progressModerate: "#FFC107",     // Yellow - Moderate
  progressCaution: "#FF9800",      // Orange - Caution
  progressHigh: "#F44336",         // Red - High/Concerning
  
  // Gradients
  primaryGradient: ["#4CAF50", "#2E7D32"],
  accentGradient: ["#FF6B35", "#FFC107"],
};

const tintColorLight = Colors.primary;

export default {
  light: {
    text: Colors.onBackground,
    background: Colors.background,
    tint: tintColorLight,
    tabIconDefault: Colors.gray400,
    tabIconSelected: tintColorLight,
  },
};