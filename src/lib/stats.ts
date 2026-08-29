import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

function currentIsoWeekStart(): string {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
}

type StatField = 'totalViews' | 'totalSaves' | 'totalApplied';

export async function incrementCompanyStat(companyId: string, field: StatField) {
  const weekKey = currentIsoWeekStart();
  const weeklyField = field.replace('total', '').toLowerCase();
  await setDoc(
    doc(db, 'companyStats', companyId),
    {
      [field]: increment(1),
      weekly: {
        [weekKey]: {
          [weeklyField]: increment(1),
        },
      },
    },
    { merge: true },
  );
}

// Mirror for university stats if you need it later
export async function incrementUniversityStat(universityId: string, field: StatField) {
  const weekKey = currentIsoWeekStart();
  const weeklyField = field.replace('total', '').toLowerCase();
  await setDoc(
    doc(db, 'universityStats', universityId),
    {
      [field]: increment(1),
      weekly: {
        [weekKey]: {
          [weeklyField]: increment(1),
        },
      },
    },
    { merge: true },
  );
}