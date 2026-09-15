<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue';
import type { WCAArticle, WCARegulation } from '../types.js';
import {
  searchQuery,
  selectedArticleId,
  filterView,
  favorites,
  collapsedRegs,
  toggleFavorite,
  toggleCollapse,
} from '../state.js';
import { icons } from '../icons.js';
import { formatContent } from '../utils.js';

interface RegulationWithMeta {
  regulation: WCARegulation;
  hasChildren: boolean;
  descendantCount: number;
  isCollapsed: boolean;
  isHiddenByAncestor: boolean;
}

const props = defineProps<{
  articles: WCAArticle[];
}>();

const containerRef = ref<HTMLElement | null>(null);

const filteredArticles = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const articleFilter = selectedArticleId.value;
  const isFavoritesView = filterView.value === 'favorites';

  const result: { article: WCAArticle; items: RegulationWithMeta[] }[] = [];

  for (const article of props.articles) {
    if (articleFilter !== 'all' && article.id !== articleFilter) {
      continue;
    }

    const regs = article.regulations;
    const n = regs.length;
    const descendantCounts: number[] = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      const level = regs[i].indentationLevel;
      let count = 0;
      for (let j = i + 1; j < n; j++) {
        if (regs[j].indentationLevel <= level) break;
        count++;
      }
      descendantCounts[i] = count;
    }

    const collapsedLevels: number[] = [];
    const items: RegulationWithMeta[] = [];

    for (let i = 0; i < n; i++) {
      const reg = regs[i];
      const level = reg.indentationLevel;
      const hasChildren = descendantCounts[i] > 0;
      const isCollapsed = collapsedRegs.value.has(reg.id);

      while (collapsedLevels.length > 0 && collapsedLevels[collapsedLevels.length - 1] >= level) {
        collapsedLevels.pop();
      }

      const isHiddenByAncestor = query === '' && collapsedLevels.length > 0;

      if (isCollapsed && hasChildren && query === '') {
        collapsedLevels.push(level);
      }

      if (isFavoritesView && !favorites.value.has(reg.id)) {
        continue;
      }

      if (query) {
        const matchId = reg.id.toLowerCase().includes(query);
        const matchContent = reg.content.toLowerCase().includes(query);
        const matchLabel = reg.label ? reg.label.toLowerCase().includes(query) : false;
        if (!matchId && !matchContent && !matchLabel) {
          continue;
        }
      }

      if (!isHiddenByAncestor) {
        items.push({
          regulation: reg,
          hasChildren,
          descendantCount: descendantCounts[i],
          isCollapsed,
          isHiddenByAncestor,
        });
      }
    }

    if (items.length > 0) {
      result.push({ article, items });
    }
  }

  return result;
});

function updateHighlights(): void {
  if (!('highlights' in CSS)) return;
  const q = searchQuery.value.trim().toLowerCase();
  if (!q || !containerRef.value) {
    CSS.highlights.delete('search-results');
    return;
  }

  const ranges: Range[] = [];
  const walker = document.createTreeWalker(containerRef.value, NodeFilter.SHOW_TEXT);
  let node: Node | null;

  while ((node = walker.nextNode())) {
    const text = node.textContent?.toLowerCase() || '';
    let idx = text.indexOf(q);
    while (idx !== -1) {
      const range = new Range();
      range.setStart(node, idx);
      range.setEnd(node, idx + q.length);
      ranges.push(range);
      idx = text.indexOf(q, idx + q.length);
    }
  }

  CSS.highlights.set('search-results', new Highlight(...ranges));
}

watch([searchQuery, filteredArticles], () => {
  nextTick(updateHighlights);
});

onMounted(() => {
  updateHighlights();
});

function onContentClick(e: MouseEvent): void {
  const target = (e.target as HTMLElement).closest<HTMLElement>('.reg-link');
  if (!target) return;
  const targetId = target.dataset.targetId;
  const refType = target.dataset.refType;
  if (!targetId) return;

  e.preventDefault();
  const isArticle = refType === 'article';

  if (isArticle) {
    if (selectedArticleId.value !== 'all' && selectedArticleId.value !== targetId) {
      selectedArticleId.value = 'all';
    }
  } else {
    let parentArticle: WCAArticle | undefined;
    for (const art of props.articles) {
      if (art.regulations.some((r) => r.id === targetId)) {
        parentArticle = art;
        break;
      }
    }
    if (parentArticle && selectedArticleId.value !== 'all' && selectedArticleId.value !== parentArticle.id) {
      selectedArticleId.value = 'all';
    }
    if (filterView.value === 'favorites' && !favorites.value.has(targetId)) {
      filterView.value = 'all';
    }
    if (parentArticle) {
      const idx = parentArticle.regulations.findIndex((r) => r.id === targetId);
      if (idx !== -1) {
        const lvl = parentArticle.regulations[idx].indentationLevel;
        for (let k = idx - 1; k >= 0; k--) {
          const prev = parentArticle.regulations[k];
          if (prev.indentationLevel < lvl && collapsedRegs.value.has(prev.id)) {
            toggleCollapse(prev.id);
          }
        }
      }
    }
  }

  if (searchQuery.value) {
    searchQuery.value = '';
  }

  nextTick(() => {
    setTimeout(() => {
      const el = document.getElementById(isArticle ? `article-${targetId}` : `reg-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('highlighted');
        setTimeout(() => el.classList.remove('highlighted'), 2000);
      }
    }, 50);
  });
}
</script>

<template>
  <div ref="containerRef">
    <div v-if="filteredArticles.length === 0" class="empty-state">
      <p>
        {{
          filterView === 'favorites' && favorites.size === 0
            ? 'No favorite regulations added yet. Tap the star icon on any regulation to save it here.'
            : 'No matching regulations found.'
        }}
      </p>
    </div>

    <template v-else>
      <section
        v-for="group in filteredArticles"
        :key="group.article.id"
        :id="`article-${group.article.id}`"
        class="article-section"
      >
        <h2 class="article-header">{{ group.article.title }}</h2>
        <div class="regulations-container">
          <article
            v-for="meta in group.items"
            :key="meta.regulation.id"
            :id="`reg-${meta.regulation.id}`"
            class="regulation-card"
            :class="`indent-${meta.regulation.indentationLevel}`"
            :data-indent="meta.regulation.indentationLevel"
          >
            <div class="card-header">
              <div class="reg-tags">
                <button
                  v-if="meta.hasChildren"
                  type="button"
                  class="btn-collapse"
                  :class="{ collapsed: meta.isCollapsed }"
                  :title="meta.isCollapsed ? 'Expand sub-rules' : 'Collapse sub-rules'"
                  @click="toggleCollapse(meta.regulation.id)"
                  v-html="meta.isCollapsed ? icons.chevronRight : icons.chevronDown"
                />
                <span class="reg-id">{{ meta.regulation.id }}</span>
                <span
                  v-if="meta.regulation.label"
                  class="label-badge"
                  :class="`label-${meta.regulation.label}`"
                >
                  {{ meta.regulation.label }}
                </span>
              </div>
              <button
                type="button"
                class="btn-fav"
                :class="{ active: favorites.has(meta.regulation.id) }"
                :title="favorites.has(meta.regulation.id) ? 'Remove from favorites' : 'Add to favorites'"
                @click="toggleFavorite(meta.regulation.id)"
                v-html="favorites.has(meta.regulation.id) ? icons.star : icons.starOutline"
              />
            </div>
            <div
              class="card-body"
              @click="onContentClick"
              v-html="formatContent(meta.regulation.content)"
            />
          </article>
        </div>
      </section>
    </template>
  </div>
</template>
