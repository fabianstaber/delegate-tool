import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { WCAParsedData, WCAArticle, WCARegulation } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.resolve(__dirname, '../wca-regulations.md');
const outputPath = path.resolve(__dirname, '../src/data/regulations.json');

function parseRegulations(sourceFile = inputPath, targetFile = outputPath): void {
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`input file not found: ${sourceFile}`);
  }

  const raw = fs.readFileSync(sourceFile, 'utf-8');
  const lines = raw.split(/\r?\n/);

  let version = 'Unknown';
  const notes: string[] = [];
  const articles: WCAArticle[] = [];
  let currentArticle: WCAArticle | null = null;
  let currentRegulation: WCARegulation | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (version === 'Unknown') {
      const vMatch = line.match(/(?:<version>)?Version:\s*(.+)/i);
      if (vMatch) {
        version = vMatch[1].replace(/<\/version>/i, '').trim();
        continue;
      }
    }

    if (line.startsWith('##')) {
      const artMatch = line.match(/Article\s+([A-Za-z0-9]+):\s*(.+)$/i);
      if (artMatch) {
        const id = artMatch[1];
        const title = `Article ${id}: ${artMatch[2].trim()}`;
        currentArticle = { id, title, regulations: [] };
        articles.push(currentArticle);
        currentRegulation = null;
        continue;
      }
    }

    const regMatch = line.match(/^(\s*)-\s+([A-Za-z0-9+]+)\)\s*(.*)$/);
    if (regMatch && currentArticle) {
      const indentSpaces = regMatch[1].replace(/\t/g, '    ').length;
      const indentationLevel = Math.floor(indentSpaces / 4);
      const regId = regMatch[2];
      const regBody = regMatch[3];

      const labelMatch = regBody.match(/^\[([A-Z]+)\]/);
      const label = labelMatch ? labelMatch[1] : undefined;

      currentRegulation = {
        id: regId,
        articleId: currentArticle.id,
        articleTitle: currentArticle.title,
        content: regBody,
        ...(label ? { label } : {}),
        indentationLevel,
        crossReferences: [],
      };
      currentArticle.regulations.push(currentRegulation);
      continue;
    }

    if (currentRegulation && line.trim().length > 0 && !line.startsWith('##')) {
      currentRegulation.content += '\n' + line.trim();
    }
  }

  for (const article of articles) {
    for (const reg of article.regulations) {
      const refs: string[] = [];
      const refMatches = reg.content.matchAll(/\(regulations:(?:regulation|article):([^)]+)\)/g);
      for (const match of refMatches) {
        if (!refs.includes(match[1])) {
          refs.push(match[1]);
        }
      }
      reg.crossReferences = refs;
    }
  }

  const parsedData: WCAParsedData = {
    version,
    notes,
    articles,
  };

  const outputDir = path.dirname(targetFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(targetFile, JSON.stringify(parsedData, null, 2), 'utf-8');
  const totalRegs = articles.reduce((sum, a) => sum + a.regulations.length, 0);
  console.log(`Parsed ${totalRegs} regulations across ${articles.length} articles. Version: ${version}`);
}

parseRegulations();
