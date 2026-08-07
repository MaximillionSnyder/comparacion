import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHARACTERS_FILE = path.join(root, 'src/data/characters.json');
const API_BASE = 'https://umaapi.vercel.app/api';

const CONCURRENCY = 4;
const RETRIES = 3;

const GRADE_VALUE = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1, G: 0 };
const DISTANCE_ORDER = ['sprint', 'mile', 'medium', 'long'];
const STYLE_ORDER = ['front', 'pace', 'late', 'end'];

const normalize = (value) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const baseName = (name) => name.split('(')[0].trim();

function gradeToValue(grade) {
  return GRADE_VALUE[grade] ?? 0;
}

function pickMax(entries) {
  let best = null;
  for (const [key, value] of entries) {
    if (!best || value > best.value) best = { key, value };
  }
  return best?.key ?? entries[0]?.[0] ?? 'sprint';
}

async function fetchJson(url) {
  let lastError;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'uma-pedigree/1.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES - 1) await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw lastError;
}

function fetchDetail(base) {
  const encoded = encodeURIComponent(base);
  return fetchJson(`${API_BASE}/characters/${encoded}`);
}

async function runPool(items, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function work() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  const workers = Array.from({ length: Math.min(CONCURRENCY, items.length) }, work);
  await Promise.all(workers);
  return results;
}

function extractFromDetail(payload) {
  const matches = Array.isArray(payload.data) ? payload.data : [];
  if (matches.length === 0) return null;

  const canonical = matches.find((m) => {
    const ci = m?.characterInfo;
    return ci && normalize(baseName(ci.name)) === normalize(ci.basicInfo?.name ?? '');
  });
  const characterInfo = (canonical ?? matches[0]).characterInfo;

  const aptitudes = characterInfo?.aptitudes ?? {};
  const track = aptitudes.track ?? {};
  const distance = aptitudes.distance ?? {};
  const pace = aptitudes.pace ?? {};

  const adaptabilidad = {
    turf: gradeToValue(track.turf),
    dirt: gradeToValue(track.dirt),
    sprint: gradeToValue(distance.sprint),
    mile: gradeToValue(distance.mile),
    medium: gradeToValue(distance.med),
    long: gradeToValue(distance.long),
    front: gradeToValue(pace.front),
    pace: gradeToValue(pace.pace),
    late: gradeToValue(pace.late),
    end: gradeToValue(pace.end),
  };

  const distancia = pickMax(DISTANCE_ORDER.map((key) => [key, adaptabilidad[key]]));
  const estilo = pickMax(STYLE_ORDER.map((key) => [key, adaptabilidad[key]]));

  return { adaptabilidad, distancia, estilo };
}

async function refresh() {
  const existing = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));

  const results = await runPool(existing, async (character, index) => {
    const base = baseName(character.nombre.en);
    try {
      const payload = await fetchDetail(base);
      const extracted = extractFromDetail(payload);
      if (!extracted) {
        console.warn(`  [${index + 1}/${existing.length}] Sin datos para ${base}`);
        return { character, detail: null };
      }
      return { character, detail: extracted };
    } catch (error) {
      console.warn(`  [${index + 1}/${existing.length}] Falló ${base}: ${error.message}`);
      return { character, detail: null };
    }
  });

  let updated = 0;
  let failed = 0;
  for (const { character, detail } of results) {
    if (!detail) {
      failed++;
      continue;
    }
    character.adaptabilidad = detail.adaptabilidad;
    character.distancia = detail.distancia;
    character.estilo = detail.estilo;
    updated++;
  }

  const output = `${JSON.stringify(existing, null, 2)}\n`;
  fs.writeFileSync(CHARACTERS_FILE, output);

  console.log(`Actualizados: ${updated}/${existing.length} (fallos: ${failed}).`);
}

refresh().catch((error) => {
  console.error('Error fatal:', error);
  process.exitCode = 1;
});