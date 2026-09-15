<script setup lang="ts">
import type { WCAParsedData } from './types.js';
import dataJson from './data/regulations.json';
import Header from './components/Header.vue';
import SearchBar from './components/SearchBar.vue';
import ArticleNav from './components/ArticleNav.vue';
import RegulationList from './components/RegulationList.vue';
import Footer from './components/Footer.vue';

const data = dataJson as unknown as WCAParsedData;
</script>

<template>
  <Header />
  <SearchBar />
  <ArticleNav :articles="data.articles" />
  <main class="main-content">
    <RegulationList :articles="data.articles" />
  </main>
  <Footer :version="data.version" />
</template>
