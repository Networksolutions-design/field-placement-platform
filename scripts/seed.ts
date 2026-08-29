import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as serviceAccount from './serviceAccountKey.json';

initializeApp({
  credential: cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  }),
});

const db = getFirestore();
const auth = getAuth();

async function seed() {
  // 1. Categories
  const categories = [
    'Valuation',
    'Land Surveying',
    'GIS & Mapping',
    'Real Estate',
    'Construction',
    'Accounting',
    'IT',
    'Engineering',
  ];
  for (let i = 0; i < categories.length; i++) {
    await db.collection('categories').add({
      name: categories[i],
      active: true,
      order: i,
    });
  }

  // 2. Universities master list
  const unis = [
    'Ardhi University',
    'University of Dar es Salaam',
    'Sokoine University of Agriculture',
    'Nelson Mandela African Institution of Science and Technology',
    'Mzumbe University',
  ];
  for (const name of unis) {
    await db.collection('universitiesMasterList').add({
      name,
      active: true,
    });
  }

  // 3. Letter template
  await db.collection('settings').doc('letterTemplate').set({
    template: `Dear Hiring Manager,\n\nMy name is {studentName}, a {course} student at {university}. I am writing to express my interest in a field placement opportunity at {companyName}, located at {companyAddress}.\n\n[...]\n\nSincerely,\n{studentName}`,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: 'seed-script',
  });

  // 4. Approval checklist
  await db.collection('settings').doc('approvalChecklist').set({
    items: [
      { id: '1', label: 'Physical address is verifiable' },
      { id: '2', label: 'Contact phone/WhatsApp number is valid' },
      { id: '3', label: 'Company description is clear and complete' },
      { id: '4', label: 'At least one placement year is specified' },
      { id: '5', label: 'Logo and cover image are uploaded' },
    ],
  });

  // 5. Admin user
  const adminUser = await auth.createUser({
    email: 'admin@theplatform.co.tz',
    password: 'ChangeMeImmediately123!',
  });
  await db.collection('admins').doc(adminUser.uid).set({
    uid: adminUser.uid,
    email: adminUser.email,
    role: 'superadmin',
  });

  console.log('Seed complete.');
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });