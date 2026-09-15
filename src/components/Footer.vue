<script setup lang="ts">
defineProps<{
  version: string;
}>();
</script>

<template>
  <footer class="site-footer">
    <div class="footer-meta">
      <span>WCA Regulations</span>
      <span>{{ version }}</span>
    </div>
    <p class="footer-disclaimer">
      This site is an unofficial reference and is not an official source of truth.
      Always refer to the official WCA Regulations.
    </p>
    <div class="footer-links">
      <a
        href="https://www.worldcubeassociation.org/regulations/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Official Regulations
      </a>
      <a
        href="https://github.com/fabianstaber/delegate-tool"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub Repository
      </a>
    </div>
  </footer>
</template>
