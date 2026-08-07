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
const STAT_MAP = { spd: 'speed', sta: 'stamina', pow: 'power', gut: 'guts', wit: 'wit' };

const normalize = (value) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const baseName = (name) => name.split('(')[0].trim();

function slugify(name) {
  const slug = normalize(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'uma';
}

function hash(str) {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function hslToHex(hue, sat, light) {
  const s = sat / 100;
  const l = light / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function colorFromName(name) {
  const h = hash(name);
  return hslToHex(h % 360, 55 + ((h >> 8) % 25), 42 + ((h >> 16) % 22));
}

function gradeToValue(grade) {
  return GRADE_VALUE[grade] ?? 0;
}

function parsePercent(value) {
  const n = Number.parseInt(String(value ?? '0'), 10);
  return Number.isFinite(n) ? n : 0;
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

  const growth = characterInfo?.statGrowth ?? {};
  const statValues = Object.entries(growth).map(([key, value]) => [STAT_MAP[key] ?? key, parsePercent(value)]);
  const mejorStat = pickMax(statValues);

  return {
    adaptabilidad,
    distancia,
    estilo,
    mejorStat,
  };
}

function buildCharacter(apiName, detail) {
  const nombre = baseName(apiName);
  const {
    adaptabilidad, distancia, estilo, mejorStat,
  } = extractFromDetail(detail);

  return {
    id: slugify(nombre),
    nombre: { es: nombre, en: nombre, ja: nombre },
    aliases: [apiName],
    avatarColor: colorFromName(nombre),
    distancia,
    estilo,
    adaptabilidad,
    factoresDefault: {
      azul: { tipo: mejorStat, estrellas: 2 },
      rojo: { tipo: distancia, estrellas: 2 },
      verde: { nombre: '', estrellas: 0 },
    },
  };
}

async function main() {
  const limit = process.argv.includes('--limit')
    ? Number(process.argv[process.argv.indexOf('--limit') + 1])
    : null;
  const dryRun = process.argv.includes('--dry-run');

  const existing = JSON.parse(fs.readFileSync(CHARACTERS_FILE, 'utf8'));
  const existingById = new Map(existing.map((c) => [c.id, c]));
  const existingByEnName = new Map(existing.map((c) => [normalize(c.nombre.en), c.id]));

  console.log('Obteniendo lista de personajes de iseizuu/umamusume-api...');
  const listPayload = await fetchJson(`${API_BASE}/characters`);
  const allCharacters = listPayload?.data?.allCharacters ?? {};
  const rawEntries = [
    ...(allCharacters.threeStar ?? []),
    ...(allCharacters.twoStar ?? []),
    ...(allCharacters.oneStar ?? []),
  ].map((entry) => entry?.name).filter(Boolean);

  const seen = new Set();
  const uniqueBases = [];
  for (const name of rawEntries) {
    const key = normalize(baseName(name));
    if (!seen.has(key)) {
      seen.add(key);
      uniqueBases.push(name);
    }
  }

  const matchedExisting = uniqueBases.filter((name) =>
    existingByEnName.has(normalize(baseName(name)))).length;

  const toFetch = uniqueBases
    .filter((name) => {
      const base = baseName(name);
      return !existingByEnName.has(normalize(base));
    })
    .slice(0, limit ?? uniqueBases.length);

  console.log(`Personajes en la API (sin duplicados): ${uniqueBases.length}`);
  console.log(`Coinciden con datos existentes: ${matchedExisting}`);
  console.log(`A agregar: ${toFetch.length}`);

  if (toFetch.length === 0) {
    console.log('Nada nuevo que agregar.');
    return;
  }

  const details = await runPool(toFetch, async (name, index) => {
    const base = baseName(name);
    try {
      const payload = await fetchDetail(base);
      return { name, payload };
    } catch (error) {
      console.warn(`  [${index + 1}/${toFetch.length}] Falló ${base}: ${error.message}`);
      return { name, payload: null };
    }
  });

  const newCharacters = [];
  for (const { name, payload } of details) {
    if (!payload || !Array.isArray(payload.data) || payload.data.length === 0) continue;
    newCharacters.push(buildCharacter(name, payload));
  }

  const merged = [...existing];
  const newById = new Map();
  for (const character of newCharacters) {
    if (existingById.has(character.id)) {
      console.warn(`  ID duplicado generado: ${character.id} (${character.nombre.en})`);
      continue;
    }
    newById.set(character.id, character);
    merged.push(character);
  }

  const addedIds = [...newById.keys()];
  const sortedCharacters = [...merged];

  const output = (value) => `${JSON.stringify(value, null, 2)}\n`;

  if (dryRun) {
    console.log(`[dry-run] Se agregarían ${sortedCharacters.length - existing.length} personajes.`);
    console.log(output(sortedCharacters));
    return;
  }

  fs.writeFileSync(CHARACTERS_FILE, output(sortedCharacters));

  console.log(`Personajes totales: ${sortedCharacters.length} (${addedIds.length} nuevos).`);
  console.log('Nuevos IDs:', addedIds.join(', ') || '(ninguno)');
  console.log('La afinidad se calcula dinámicamente desde las aptitudes (7pt por grupo compartido).');
}

main().catch((error) => {
  console.error('Error fatal:', error);
  process.exitCode = 1;
});
