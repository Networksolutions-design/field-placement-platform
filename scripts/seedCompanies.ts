import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as serviceAccount from './serviceAccountKey.json';

initializeApp({
  credential: cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  }),
});

const db = getFirestore();

type ApplicationMethod = 'office_visit' | 'email_whatsapp';

interface SeedCategoryConfig {
  category: string;
  names: string[];
  city: string;
  addressPrefix: string;
  poBoxPrefix: string;
  phonePrefix: string;
  whatsappPrefix: string;
  websiteDomain: string;
  socialPlatform: 'linkedin' | 'instagram' | 'x' | 'facebook';
  preferredProgrammes: string[];
  extraRequirementsPool: Array<string | null>;
}

const YEARS = ['Year 2', 'Year 3', 'Year 4', 'Year 5', 'Postgraduate'];

const categoryConfigs: SeedCategoryConfig[] = [
  {
    category: 'Valuation',
    names: [
      'Mali Valuers & Associates',
      'Coastal Property Valuers',
      'Precision Valuation Co.',
      'Ufanisi Valuers Ltd',
      'Tanzania Asset Valuers',
      'Mlima Valuation Consult',
      'Huduma Valuers Group',
      'Sera Property Valuers',
      'Jenga Valuation Experts',
      'Dhahabu Valuers & Advisors',
    ],
    city: 'Dar es Salaam',
    addressPrefix: 'Plot 21',
    poBoxPrefix: 'P.O. Box 1120',
    phonePrefix: '+255 22 277',
    whatsappPrefix: '25575411',
    websiteDomain: 'valuers.co.tz',
    socialPlatform: 'linkedin',
    preferredProgrammes: ['Valuation', 'Land Management', 'Real Estate'],
    extraRequirementsPool: [
      'Basic knowledge of property valuation methods preferred.',
      null,
      'Familiarity with Microsoft Excel is a plus.',
      null,
      'Ability to conduct site visits within Dar es Salaam.',
    ],
  },
  {
    category: 'Land Surveying',
    names: [
      'Sera Land Surveyors',
      'Uchunguzi Survey Ltd',
      'Mizani Land Surveys',
      'Pima Survey Solutions',
      'Dodoma Land Survey Co.',
      'Kijiwe Survey Consult',
      'Mkoa Land Surveyors',
      'Tanzania Cadastral Surveys',
      'Bara Survey & Mapping',
      'Reli Land Survey Experts',
    ],
    city: 'Mwanza',
    addressPrefix: 'Nyerere Road',
    poBoxPrefix: 'P.O. Box 880',
    phonePrefix: '+255 28 250',
    whatsappPrefix: '25576522',
    websiteDomain: 'surveys.co.tz',
    socialPlatform: 'instagram',
    preferredProgrammes: ['Land Surveying', 'GIS & Mapping'],
    extraRequirementsPool: [
      'Willingness to travel to rural field sites.',
      null,
      'Basic use of GPS and total station is an advantage.',
      null,
      'Good physical fitness for field work.',
    ],
  },
  {
    category: 'GIS & Mapping',
    names: [
      'Mkanda GIS Lab',
      'Ramani Technologies',
      'Spatial Insights Ltd',
      'Ardhi Data Maps',
      'GeoPoint Tanzania',
      'Kanda Mapping Co.',
      'Ramani Analytics',
      'Mfumo GIS Consultants',
      'Tarafa Spatial Solutions',
      'Safari Maps Studio',
    ],
    city: 'Arusha',
    addressPrefix: 'Sokoine Road',
    poBoxPrefix: 'P.O. Box 665',
    phonePrefix: '+255 27 250',
    whatsappPrefix: '25568733',
    websiteDomain: 'gis.co.tz',
    socialPlatform: 'x',
    preferredProgrammes: ['GIS & Mapping', 'Information Technology', 'Environmental Science'],
    extraRequirementsPool: [
      'Basic GIS software experience preferred.',
      null,
      'Familiarity with QGIS or ArcGIS is an advantage.',
      null,
      'Data entry accuracy is important.',
    ],
  },
  {
    category: 'Real Estate',
    names: [
      'Nyumba Property Group',
      'Dhamana Real Estate Ltd',
      'Mji Homes & Estates',
      'Pwani Property Brokers',
      'Kitalu Realty Co.',
      'Ujenzi Housing Ltd',
      'Mlima Property Managers',
      'Sokoni Estates',
      'Bahari Realty Services',
      'Kaya Property Advisors',
    ],
    city: 'Zanzibar',
    addressPrefix: 'Vuga Road',
    poBoxPrefix: 'P.O. Box 210',
    phonePrefix: '+255 24 223',
    whatsappPrefix: '25577844',
    websiteDomain: 'realestate.co.tz',
    socialPlatform: 'facebook',
    preferredProgrammes: ['Real Estate', 'Business Administration', 'Valuation'],
    extraRequirementsPool: [
      'Customer service skills preferred.',
      null,
      'Basic knowledge of property marketing is helpful.',
      null,
      'Willingness to work weekends during property viewings.',
    ],
  },
  {
    category: 'Construction',
    names: [
      'Ngome Construction Co.',
      'Ujenzi Bora Contractors',
      'Mvua Building Works',
      'Simba Construction Ltd',
      'Mkoa Builders & Engineers',
      'Kifaru Construction Group',
      'Msingi Contractors',
      'Pima Jengo Ltd',
      'Rukwa Civil Works',
      'Bondeni Construction Ltd',
    ],
    city: 'Dodoma',
    addressPrefix: 'Kikuyu Avenue',
    poBoxPrefix: 'P.O. Box 990',
    phonePrefix: '+255 26 232',
    whatsappPrefix: '25578955',
    websiteDomain: 'construction.co.tz',
    socialPlatform: 'linkedin',
    preferredProgrammes: ['Civil Engineering', 'Construction', 'Architecture'],
    extraRequirementsPool: [
      'Safety induction required before site visits.',
      null,
      'Willingness to work at active construction sites.',
      null,
      'Basic use of site measurement tools preferred.',
    ],
  },
  {
    category: 'Accounting',
    names: [
      'Hesabu Accounting Ltd',
      'Uwazi Audit & Tax',
      'Mizani Accountants Co.',
      'Dodoma Tax Advisors',
      'Pwani Bookkeeping Services',
      'Namba Accounting Group',
      'Sahihi Financial Consultants',
      'Ushuru Tax Solutions',
      'Bajeti Audit Co.',
      'Kodi Accounting & Advisory',
    ],
    city: 'Mbeya',
    addressPrefix: 'Lupa Way',
    poBoxPrefix: 'P.O. Box 770',
    phonePrefix: '+255 25 250',
    whatsappPrefix: '25571266',
    websiteDomain: 'accounting.co.tz',
    socialPlatform: 'instagram',
    preferredProgrammes: ['Accounting', 'Finance', 'Business Administration'],
    extraRequirementsPool: [
      'Basic bookkeeping knowledge preferred.',
      null,
      'Good numerical accuracy is important.',
      null,
      'Familiarity with spreadsheets is an advantage.',
    ],
  },
  {
    category: 'IT',
    names: [
      'Kiota Software Ltd',
      'Mfumo Technologies',
      'DataPoint Systems',
      'Wavuti Web Studio',
      'Simu Mobile Apps Co.',
      'Mkoba Digital Ltd',
      'Tandika IT Solutions',
      'Nuru Technologies',
      'Ubongo Software House',
      'Fikra Tech Ltd',
    ],
    city: 'Dar es Salaam',
    addressPrefix: 'Masaki',
    poBoxPrefix: 'P.O. Box 7712',
    phonePrefix: '+255 22 260',
    whatsappPrefix: '25571377',
    websiteDomain: 'tech.co.tz',
    socialPlatform: 'x',
    preferredProgrammes: ['Information Technology', 'Computer Science'],
    extraRequirementsPool: [
      'Basic Git/GitHub familiarity is a plus.',
      null,
      'Knowledge of HTML, CSS, or JavaScript is helpful.',
      null,
      'Willingness to learn new tools quickly.',
    ],
  },
  {
    category: 'Engineering',
    names: [
      'Mhandisi Engineering Ltd',
      'Nishati Power Consultants',
      'Uhandisi Water Works',
      'Maji Engineering Co.',
      'Barabara Civil Engineers',
      'Umeme Electrical Engineers',
      'Chuma Mechanical Works',
      'Kiwanda Engineering Ltd',
      'Mlima Structural Engineers',
      'Tanzania Infrastructure Consultants',
    ],
    city: 'Morogoro',
    addressPrefix: 'Old Dar Road',
    poBoxPrefix: 'P.O. Box 540',
    phonePrefix: '+255 23 260',
    whatsappPrefix: '25578988',
    websiteDomain: 'engineering.co.tz',
    socialPlatform: 'linkedin',
    preferredProgrammes: ['Engineering', 'Civil Engineering', 'Environmental Science'],
    extraRequirementsPool: [
      'Basic engineering drawing reading preferred.',
      null,
      'Willingness to conduct site inspections.',
      null,
      'Good technical report writing is an advantage.',
    ],
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getEligibleYears(index: number): string[] {
  if (index % 4 === 0) return ['Year 3', 'Year 4'];
  if (index % 4 === 1) return ['Year 2', 'Year 3', 'Year 4'];
  if (index % 4 === 2) return ['Year 4', 'Year 5', 'Postgraduate'];
  return ['Year 2', 'Year 3', 'Year 4', 'Year 5', 'Postgraduate'];
}

function getSocials(
  platform: SeedCategoryConfig['socialPlatform'],
  companyName: string,
): Record<string, string | null> {
  const base = `https://${platform}.com/${slugify(companyName)}`;

  return {
    linkedin: platform === 'linkedin' ? base : null,
    instagram: platform === 'instagram' ? base : null,
    x: platform === 'x' ? base : null,
    facebook: platform === 'facebook' ? base : null,
  };
}

async function seed() {
  let totalSeeded = 0;

  for (const config of categoryConfigs) {
    for (let i = 0; i < config.names.length; i++) {
      const companyName = config.names[i];
      const docId = slugify(companyName);
      const email = `info@${docId}.co.tz`;
      const contactEmail = `careers@${docId}.co.tz`;
      const whatsappNumber = `${config.whatsappPrefix}${String(1000 + i * 7).slice(0, 4)}`;
      const phoneNumber = `${config.phonePrefix}${String(1000 + i * 13).slice(0, 4)}`;

      const extraRequirement =
        config.extraRequirementsPool[i % config.extraRequirementsPool.length];

      const socials = getSocials(config.socialPlatform, companyName);

      const data: Record<string, unknown> = {
        companyName,
        companyEmail: email,
        contactEmail,
        tagline: `${config.category} services you can trust`,
        categories: [config.category],
        description:
          `${companyName} is a registered Tanzanian firm providing ${config.category.toLowerCase()} services to private and public sector clients. ` +
          `We welcome university students for field and industrial training placements.`,
        address: `${config.addressPrefix}, ${config.city}`,
        poBox: `${config.poBoxPrefix}, ${config.city}`,
        phone: phoneNumber,
        whatsapp: whatsappNumber,
        website: `https://${docId}.${config.websiteDomain}`,
        socials,
        coordinates: null,
        eligibleYears: getEligibleYears(i),
        preferredProgrammes: config.preferredProgrammes,
        extraRequirements: extraRequirement,
        applicationMethod: i % 2 === 0 ? 'office_visit' : 'email_whatsapp',
        availableSlots: (i % 9) + 1,
        logoUrl: '',
        coverUrl: '',
        status: 'approved',
        rejectionReason: null,
        authorisedRepConfirmed: true,
        registeredByAdmin: true,
        adminViewed: true,
        emailVerified: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        approvedAt: FieldValue.serverTimestamp(),
      };

      await db.collection('companies').doc(docId).set(data, { merge: true });
      totalSeeded += 1;
    }
  }

  console.log(`Seed complete. Total companies seeded: ${totalSeeded}`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });