import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

const characters = readJson('src/data/characters.json');
const errors = [];
const locales = ['es', 'en', 'ja'];
const distances = new Set(['sprint', 'mile', 'medium', 'long']);
const styles = new Set(['front', 'pace', 'late', 'end']);
const redTypes = new Set(['turf', 'dirt', 'sprint', 'mile', 'medium', 'long', 'front', 'pace', 'late', 'end']);
const blueTypes = new Set(['speed', 'stamina', 'power', 'guts', 'wit']);
const adaptationKeys = ['turf', 'dirt', 'sprint', 'mile', 'medium', 'long', 'front', 'pace', 'late', 'end'];

const isStars = (value) => Number.isInteger(value) && value >= 0 && value <= 3;
const isAdaptability = (value) => Number.isInteger(value) && value >= 0 && value <= 7;

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

if (errors.length > 0) {
  console.error(`Validación de datos fallida (${errors.length} errores):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Datos válidos: ${characters.length} personajes.`);
}
