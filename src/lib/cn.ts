import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the custom scales from globals.css. Without this it reads `text-body` as a
// colour and drops the real colour class (e.g. `text-primary-foreground`) when both are present.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['figure', 'title', 'section', 'body', 'caption'],
      radius: ['control', 'card'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
