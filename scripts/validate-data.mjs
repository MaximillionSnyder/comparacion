import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

const characters = readJson('src/data/characters.json');
const affinityMatrix = readJson('src/data/affinityMatrix.json');
const errors = [];
const locales = ['es', 'en', 'ja'];
const distances = new Set(['sprint', 'mile', 'medium', 'long']);
const styles = new Set(['front', 'pace', 'late', 'end']);
const redTypes = new Set(['turf', 'dirt', 'sprint', 'mile', 'medium', 'long', 'front', 'pace', 'late', 'end']);
const blueTypes = new Set(['speed', 'stamina', 'power', 'guts', 'wit']);
const adaptationKeys = ['turf', 'dirt', 'sprint', 'mile', 'medium', 'long', 'front', 'pace', 'late', 'end'];

const isStars = (value) => Number.isInteger(value) && value >= 0 && value <= 3;
const isAdaptability = (value) => Number.isInteger(value) && value >= 0 && value <= 3;

if (!Array.isArray(characters) || characters.length === 0) {
  errors.push('characters.json debe ser un array no vacío.');
}

const ids = new Set();
for (const [index, character] of characters.entries()) {
  const prefix = `characters[${index}]`;
  if (!character || typeof character !== 'object') {
    errors.push(`${prefix} no es un objeto.`);
    continue;
  }
  if (typeof character.id !== 'string' || !character.id.trim()) {
    errors.push(`${prefix}.id debe ser un texto no vacío.`);
  } else if (ids.has(character.id)) {
    errors.push(`ID duplicado: ${character.id}.`);
  } else {
    ids.add(character.id);
  }

  for (const locale of locales) {
    if (typeof character.nombre?.[locale] !== 'string' || !character.nombre[locale].trim()) {
      errors.push(`${prefix}.nombre.${locale} debe ser un texto no vacío.`);
    }
  }

  if (!distances.has(character.distancia)) errors.push(`${prefix}.distancia inválida: ${character.distancia}.`);
  if (!styles.has(character.estilo)) errors.push(`${prefix}.estilo inválido: ${character.estilo}.`);

  for (const key of adaptationKeys) {
    if (!isAdaptability(character.adaptabilidad?.[key])) {
      errors.push(`${prefix}.adaptabilidad.${key} debe estar entre 0 y 3.`);
    }
  }

  const azul = character.factoresDefault?.azul;
  const rojo = character.factoresDefault?.rojo;
  const verde = character.factoresDefault?.verde;
  if (!blueTypes.has(azul?.tipo) || !isStars(azul?.estrellas)) errors.push(`${prefix}.factoresDefault.azul inválido.`);
  if (!redTypes.has(rojo?.tipo) || !isStars(rojo?.estrellas)) errors.push(`${prefix}.factoresDefault.rojo inválido.`);
  if (typeof verde?.nombre !== 'string' || !isStars(verde?.estrellas)) errors.push(`${prefix}.factoresDefault.verde inválido.`);
}

const matrixIds = Object.keys(affinityMatrix);
if (matrixIds.length !== ids.size || matrixIds.some((id) => !ids.has(id))) {
  errors.push('La matriz debe tener exactamente una fila por cada personaje.');
}
for (const id of ids) {
  const row = affinityMatrix[id];
  if (!row || Object.keys(row).length !== ids.size || Object.keys(row).some((columnId) => !ids.has(columnId))) {
    errors.push(`La fila de matriz de ${id} debe contener todos los personajes y ningún ID desconocido.`);
    continue;
  }
  for (const [columnId, value] of Object.entries(row)) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      errors.push(`Afinidad inválida ${id} -> ${columnId}: ${value}.`);
    }
  }
  if (row[id] !== 100) errors.push(`La diagonal de afinidad de ${id} debe ser 100.`);
}

if (errors.length > 0) {
  console.error(`Validación de datos fallida (${errors.length} errores):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Datos válidos: ${characters.length} personajes y matriz ${characters.length}x${characters.length}.`);
}
