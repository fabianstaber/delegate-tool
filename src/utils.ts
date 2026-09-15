export function formatContent(content: string): string {
  return content
    .replace(/^\[[A-Z]+\]\s*/i, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
      if (url.startsWith('regulations:')) {
        const [, type, id] = url.split(':');
        const prefix = type === 'article' ? 'article' : 'reg';
        return `<a href="#${prefix}-${id}" class="reg-link" data-target-id="${id}" data-ref-type="${type}">${text}</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="reg-link">${text}</a>`;
    });
}
