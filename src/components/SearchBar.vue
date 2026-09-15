<script setup lang="ts">
import { ref } from 'vue';
import { searchQuery, filterView, favorites } from '../state.js';
import { icons } from '../icons.js';

const inputRef = ref<HTMLInputElement | null>(null);

function clearSearch(): void {
  searchQuery.value = '';
  inputRef.value?.focus();
}
</script>

<template>
  <div class="controls-container">
    <div class="search-box">
      <span class="search-icon" v-html="icons.search" />
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="search"
        id="search-input"
        class="search-input"
        placeholder="Search regulation ID, term, or keyword..."
        autocomplete="off"
        autocapitalize="none"
        autocorrect="off"
        spellcheck="false"
        inputmode="search"
        enterkeyhint="search"
        @keydown.esc="searchQuery = ''"
      />
      <button
        v-show="searchQuery"
        type="button"
        id="search-clear"
        class="search-clear"
        title="Clear"
        @click="clearSearch"
      >
        &times;
      </button>
    </div>
    <div class="filter-row">
      <button
        type="button"
        class="chip"
        :class="{ active: filterView !== 'favorites' }"
        @click="filterView = 'all'"
      >
        All
      </button>
      <button
        type="button"
        class="chip"
        :class="{ active: filterView === 'favorites' }"
        @click="filterView = 'favorites'"
      >
        <span v-html="icons.starOutline" />
        <span class="fav-count-text">Favorites ({{ favorites.size }})</span>
      </button>
    </div>
  </div>
</template>
