import { cn } from '@/lib/utils';

// Brand color classes for consistent usage across components
export const brandStyles = {
  // Gradient backgrounds
  gradients: {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600',
    primaryHover: 'hover:from-purple-700 hover:to-pink-700',
    primaryLight: 'bg-gradient-to-r from-purple-50 to-pink-50',
    primaryDark: 'bg-gradient-to-r from-purple-900/20 to-pink-900/20',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    successHover: 'hover:from-emerald-700 hover:to-teal-700',
    page: 'bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800',
  },

  // Text gradients
  text: {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
    heading: 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
  },

  // Button styles
  buttons: {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105',
    secondary: 'border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/20 font-semibold rounded-xl transition-all duration-200',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105',
    outline: 'border-2 border-gray-200 hover:border-gray-300 font-semibold rounded-xl transition-all duration-200',
  },

  // Card styles
  cards: {
    primary: 'border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80',
    highlighted: 'border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg',
    interactive: 'border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
    pricing: 'shadow-lg hover:shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80',
  },

  // Icon containers
  icons: {
    primary: 'p-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900',
    brand: 'p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600',
    success: 'p-2 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900',
    warning: 'p-2 rounded-lg bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900',
  },

  // Input styles
  inputs: {
    primary: 'h-12 border-2 focus:border-purple-500 transition-colors',
    textarea: 'border-2 focus:border-purple-500 transition-colors resize-none',
  },

  // Badge styles
  badges: {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    popular: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/50 dark:to-pink-900/50 dark:text-purple-300',
  },

  // Layout styles
  layouts: {
    container: 'max-w-4xl mx-auto p-6 space-y-8',
    section: 'space-y-6',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    center: 'flex justify-center',
  },

  // Animation styles
  animations: {
    fadeIn: 'fade-in-up',
    hover: 'transition-all duration-200 transform hover:scale-105',
    button: 'transition-all duration-200 transform hover:scale-105',
    card: 'transition-all duration-300',
  },
};

// Helper functions for common brand styling patterns
export const getBrandButton = (variant: 'primary' | 'secondary' | 'success' | 'outline' = 'primary') => {
  return brandStyles.buttons[variant];
};

export const getBrandCard = (variant: 'primary' | 'highlighted' | 'interactive' | 'pricing' = 'primary') => {
  return brandStyles.cards[variant];
};

export const getBrandGradient = (variant: 'primary' | 'primaryLight' | 'success' | 'page' = 'primary') => {
  return brandStyles.gradients[variant];
};

export const getBrandIcon = (variant: 'primary' | 'brand' | 'success' | 'warning' = 'primary') => {
  return brandStyles.icons[variant];
};

// Utility to combine brand styles with custom classes
export const withBrandStyles = (brandClass: string, customClasses?: string) => {
  return cn(brandClass, customClasses);
};

// Common component style presets
export const componentPresets = {
  pageHeader: {
    container: 'text-center space-y-4',
    iconContainer: brandStyles.icons.brand,
    title: `text-4xl font-bold ${brandStyles.text.primary}`,
    subtitle: 'text-lg text-muted-foreground max-w-2xl mx-auto',
  },
  
  formSection: {
    container: brandStyles.layouts.section,
    card: brandStyles.cards.primary,
    input: brandStyles.inputs.primary,
    textarea: brandStyles.inputs.textarea,
    button: brandStyles.buttons.primary,
  },

  progressIndicator: {
    container: 'flex items-center justify-center space-x-4 mb-8',
    stepActive: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg',
    stepCompleted: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    stepInactive: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    connector: 'w-8 h-0.5 mx-2',
    connectorCompleted: 'bg-green-300',
    connectorInactive: 'bg-gray-200 dark:bg-gray-700',
  },
};

export default brandStyles;
