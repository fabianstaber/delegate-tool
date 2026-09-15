<script setup lang="ts">
import { isDarkMode, toggleTheme, isTocOpen } from '../state.js';
import { icons } from '../icons.js';

</script>

<template>
  <header class="site-header">
    <div class="header-brand">
      <button
        type="button"
        id="btn-toc"
        class="btn-icon"
        title="Table of Contents"
        @click="isTocOpen = !isTocOpen"
        v-html="icons.menu"
      />
      <span class="brand-title"><span class="brand-accent">WCA</span> Regulations</span>
    </div>
    <div class="header-actions">
      <button
        type="button"
        id="btn-theme"
        class="btn-icon"
        title="Toggle Theme"
        @click="toggleTheme"
        v-html="isDarkMode ? icons.sun : icons.moon"
      />
    </div>
  </header>
</template>
