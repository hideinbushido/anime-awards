// Script pour ajouter des nominés dans la catégorie "Meilleur Action"
// Usage: node scripts/add-action-nominees.mjs

const PROJECT_ID = 'animeaward-e584b';
const API_KEY = 'AIzaSyA3rskxXB7flGQ4UsDJagwAh64P-VEdHTE';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const NOMINEES_TO_ADD = [
  {
    name: 'Blue Exorcist: The Blue Night Saga',
    anime: 'Blue Exorcist: The Blue Night Saga',
    descriptionFr: '',
    descriptionEn: '',
    description: '',
    imageUrl: '',
    active: true,
  },
  {
    name: 'Kaiju N°8 Saison 2',
    anime: 'Kaiju N°8',
    descriptionFr: '',
    descriptionEn: '',
    description: '',
    imageUrl: '',
    active: true,
  },
  {
    name: 'Wind Breaker Saison 2',
    anime: 'Wind Breaker',
    descriptionFr: '',
    descriptionEn: '',
    description: '',
    imageUrl: '',
    active: true,
  },
  {
    name: 'Yaiba',
    anime: 'Yaiba',
    descriptionFr: '',
    descriptionEn: '',
    description: '',
    imageUrl: '',
    active: true,
  },
];

function toFirestoreValue(val) {
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return { integerValue: val };
  return { nullValue: null };
}

function toFirestoreDoc(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = toFirestoreValue(value);
  }
  return { fields };
}

async function listCategories() {
  const url = `${BASE_URL}/categories?key=${API_KEY}&pageSize=50`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error listing categories: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.documents || [];
}

async function listNomineesForCategory(categoryId) {
  // Use structured query to filter by categoryId
  const url = `${BASE_URL}:runQuery?key=${API_KEY}`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'nominees' }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: 'categoryId' },
                op: 'EQUAL',
                value: { stringValue: categoryId },
              },
            },
          ],
        },
      },
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Error querying nominees: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.filter(r => r.document).map(r => r.document);
}

async function createNominee(nomineeData) {
  const url = `${BASE_URL}/nominees?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toFirestoreDoc(nomineeData)),
  });
  if (!res.ok) throw new Error(`Error creating nominee: ${res.status} ${await res.text()}`);
  return await res.json();
}

async function updateNominee(docName, fields) {
  const url = `https://firestore.googleapis.com/v1/${docName}?key=${API_KEY}&updateMask.fieldPaths=active`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { active: { booleanValue: true } } }),
  });
  if (!res.ok) throw new Error(`Error updating nominee: ${res.status} ${await res.text()}`);
  return await res.json();
}

function getField(doc, fieldName) {
  const f = doc.fields?.[fieldName];
  if (!f) return undefined;
  return f.stringValue ?? f.booleanValue ?? f.integerValue ?? null;
}

async function main() {
  console.log('Recherche de la catégorie "Meilleur Action"...\n');

  const categories = await listCategories();
  if (categories.length === 0) {
    console.error('Aucune catégorie trouvée. Vérifiez la connexion Firebase.');
    process.exit(1);
  }

  console.log('Catégories disponibles:');
  categories.forEach(cat => {
    const titleFr = getField(cat, 'titleFr') || getField(cat, 'title') || '(sans titre)';
    const id = cat.name.split('/').pop();
    console.log(`  - [${id}] ${titleFr}`);
  });

  // Find "meilleur action" category
  const actionCat = categories.find(cat => {
    const titleFr = (getField(cat, 'titleFr') || getField(cat, 'title') || '').toLowerCase();
    return titleFr.includes('action');
  });

  if (!actionCat) {
    console.error('\nCatégorie "Meilleur Action" introuvable!');
    process.exit(1);
  }

  const categoryId = actionCat.name.split('/').pop();
  const categoryTitle = getField(actionCat, 'titleFr') || getField(actionCat, 'title');
  console.log(`\nCatégorie trouvée: "${categoryTitle}" (ID: ${categoryId})\n`);

  // Get existing nominees in this category
  const existingNominees = await listNomineesForCategory(categoryId);
  const existingNames = existingNominees.map(n => (getField(n, 'name') || '').toLowerCase());

  console.log(`Nominés existants dans cette catégorie: ${existingNominees.length}`);
  existingNominees.forEach(n => {
    const name = getField(n, 'name') || '(sans nom)';
    const active = getField(n, 'active');
    console.log(`  - ${name} (active: ${active})`);
  });
  console.log('');

  // Add or reactivate nominees
  for (const nominee of NOMINEES_TO_ADD) {
    const existingDoc = existingNominees.find(
      n => (getField(n, 'name') || '').toLowerCase() === nominee.name.toLowerCase()
    );

    if (existingDoc) {
      const isActive = getField(existingDoc, 'active');
      if (isActive) {
        console.log(`✓ Déjà présent et actif: ${nominee.name}`);
      } else {
        await updateNominee(existingDoc.name, { active: true });
        console.log(`✓ Réactivé: ${nominee.name}`);
      }
    } else {
      await createNominee({ ...nominee, categoryId });
      console.log(`✓ Ajouté: ${nominee.name}`);
    }
  }

  console.log('\nTerminé!');
}

main().catch(err => {
  console.error('Erreur:', err.message);
  process.exit(1);
});
