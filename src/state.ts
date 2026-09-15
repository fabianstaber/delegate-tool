import { ref } from 'vue';
import type { FilterView } from './types.js';

export const searchQuery = ref('');
export const selectedArticleId = ref('all');
export const filterView = ref<FilterView>('all');
export const isTocOpen = ref(false);

const storedFavs = localStorage.getItem('wca_regs_favorites');
export const favorites = ref<Set<string>>(new Set(storedFavs ? JSON.parse(storedFavs) : []));

export function toggleFavorite(id: string): void {
  if (favorites.value.has(id)) {
    favorites.value.delete(id);
  } else {
    favorites.value.add(id);
  }
  favorites.value = new Set(favorites.value);
  try {
    localStorage.setItem('wca_regs_favorites', JSON.stringify([...favorites.value]));
  } catch {
    // ignore storage error
  }
}

export const collapsedRegs = ref<Set<string>>(new Set());

export function toggleCollapse(id: string): void {
  if (collapsedRegs.value.has(id)) {
    collapsedRegs.value.delete(id);
  } else {
    collapsedRegs.value.add(id);
  }
  collapsedRegs.value = new Set(collapsedRegs.value);
}

const savedTheme = localStorage.getItem('wca_regs_theme');
export const isDarkMode = ref(
  savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
);

export function toggleTheme(): void {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('wca_regs_theme', isDarkMode.value ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', isDarkMode.value);
}

document.documentElement.classList.toggle('dark', isDarkMode.value);
