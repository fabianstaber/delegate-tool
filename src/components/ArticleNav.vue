<script setup lang="ts">
import { nextTick } from 'vue';
import type { WCAArticle } from '../types.js';
import { isTocOpen, selectedArticleId } from '../state.js';
import { icons } from '../icons.js';

defineProps<{
  articles: WCAArticle[];
}>();

function selectArticle(id: string): void {
  selectedArticleId.value = id;
  isTocOpen.value = false;
  if (id !== 'all') {
    nextTick(() => {
      document.getElementById(`article-${id}`)?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}
</script>

<template>
  <div>
    <div
      v-show="isTocOpen"
      id="toc-overlay"
      class="toc-overlay"
      @click="isTocOpen = false"
    />
    <aside class="toc-drawer" :class="{ open: isTocOpen }">
      <div class="toc-header">
        <span>Table of Contents</span>
        <button
          type="button"
          id="btn-close-toc"
          class="btn-icon"
          title="Close"
          @click="isTocOpen = false"
          v-html="icons.close"
        />
      </div>
      <ul class="toc-list">
        <li
          class="toc-item"
          :class="{ active: selectedArticleId === 'all' }"
          @click="selectArticle('all')"
        >
          <span>All Articles</span>
        </li>
        <li
          v-for="art in articles"
          :key="art.id"
          class="toc-item"
          :class="{ active: selectedArticleId === art.id }"
          @click="selectArticle(art.id)"
        >
          <span>{{ art.title }}</span>
          <span class="toc-count">{{ art.regulations.length }}</span>
        </li>
      </ul>
    </aside>
  </div>
</template>
