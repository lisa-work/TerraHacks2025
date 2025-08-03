import InsuranceProvider from '../models/InsuranceProvider';

const sampleInsuranceProviders = [
  {
    name: 'Blue Cross Blue Shield',
    type: 'health',
    networks: ['Blue Network', 'BlueCard', 'Federal Employee Program'],
    states: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
    planTypes: ['HMO', 'PPO', 'EPO', 'POS'],
    contactInfo: {
      phone: '1-800-810-BLUE',
      website: 'https://www.bcbs.com',
      customerService: '1-800-810-2583'
    },
    coverage: {
      inNetwork: {
        primaryCare: 20,
        specialist: 40,
        emergency: 150,
        urgentCare: 50,
        prescription: 10
      },
      outOfNetwork: {
        primaryCare: 60,
        specialist: 100,
        emergency: 300,
        urgentCare: 100,
        prescription: 30
      },
      deductible: {
        individual: 1500,
        family: 3000
      },
      outOfPocketMax: {
        individual: 8000,
        family: 16000
      }
    },
    searchKeywords: ['blue cross', 'blue shield', 'bcbs', 'anthem', 'wellmark', 'independence blue cross'],
    isActive: true,
    addedBy: 'system'
  },
  {
    name: 'Aetna',
    type: 'health',
    networks: ['Aetna Better Health', 'Aetna Choice', 'Innovation Health'],
    states: ['CA', 'CT', 'DE', 'FL', 'GA', 'IL', 'KY', 'LA', 'MD', 'MO', 'NV', 'NJ', 'NY', 'OH', 'PA', 'TX', 'VA', 'WV'],
    planTypes: ['HMO', 'PPO', 'EPO', 'HDHP'],
    contactInfo: {
      phone: '1-800-872-3862',
      website: 'https://www.aetna.com',
      customerService: '1-800-872-3862'
    },
    coverage: {
      inNetwork: {
        primaryCare: 25,
        specialist: 45,
        emergency: 175,
        urgentCare: 60,
        prescription: 15
      },
      outOfNetwork: {
        primaryCare: 75,
        specialist: 120,
        emergency: 350,
        urgentCare: 120,
        prescription: 40
      },
      deductible: {
        individual: 1800,
        family: 3600
      },
      outOfPocketMax: {
        individual: 8500,
        family: 17000
      }
    },
    searchKeywords: ['aetna', 'cvs health', 'aetna better health'],
    isActive: true,
    addedBy: 'system'
  },
  {
    name: 'Cigna',
    type: 'health',
    networks: ['Cigna HealthCare', 'Cigna LocalPlus', 'Cigna Total Care'],
    states: ['AZ', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'IL', 'IN', 'KS', 'KY', 'LA', 'MD', 'MO', 'MT', 'NC', 'NV', 'NH', 'NJ', 'NY', 'OH', 'OK', 'OR', 'PA', 'SC', 'TN', 'TX', 'UT', 'VA', 'WA'],
    planTypes: ['HMO', 'PPO', 'EPO', 'Open Access Plus'],
    contactInfo: {
      phone: '1-800-244-6224',
      website: 'https://www.cigna.com',
      customerService: '1-800-244-6224'
    },
    coverage: {
      inNetwork: {
        primaryCare: 30,
        specialist: 50,
        emergency: 200,
        urgentCare: 75,
        prescription: 20
      },
      outOfNetwork: {
        primaryCare: 80,
        specialist: 130,
        emergency: 400,
        urgentCare: 130,
        prescription: 50
      },
      deductible: {
        individual: 2000,
        family: 4000
      },
      outOfPocketMax: {
        individual: 9000,
        family: 18000
      }
    },
    searchKeywords: ['cigna', 'cigna healthcare', 'cigna total care'],
    isActive: true,
    addedBy: 'system'
  },
  {
    name: 'UnitedHealthcare',
    type: 'health',
    networks: ['UnitedHealth Premium', 'UnitedHealth Choice Plus', 'UnitedHealth Options'],
    states: ['AL', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
    planTypes: ['HMO', 'PPO', 'EPO', 'POS'],
    contactInfo: {
      phone: '1-888-815-3129',
      website: 'https://www.uhc.com',
      customerService: '1-888-815-3129'
    },
    coverage: {
      inNetwork: {
        primaryCare: 25,
        specialist: 45,
        emergency: 180,
        urgentCare: 65,
        prescription: 12
      },
      outOfNetwork: {
        primaryCare: 70,
        specialist: 115,
        emergency: 360,
        urgentCare: 115,
        prescription: 35
      },
      deductible: {
        individual: 1600,
        family: 3200
      },
      outOfPocketMax: {
        individual: 8200,
        family: 16400
      }
    },
    searchKeywords: ['united healthcare', 'united health', 'uhc', 'optum'],
    isActive: true,
    addedBy: 'system'
  },
  {
    name: 'Humana',
    type: 'health',
    networks: ['Humana Choice Care', 'Humana HMO', 'Humana Gold Plus'],
    states: ['AL', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
    planTypes: ['HMO', 'PPO', 'Medicare Advantage'],
    contactInfo: {
      phone: '1-800-448-6262',
      website: 'https://www.humana.com',
      customerService: '1-800-448-6262'
    },
    coverage: {
      inNetwork: {
        primaryCare: 20,
        specialist: 40,
        emergency: 160,
        urgentCare: 55,
        prescription: 8
      },
      outOfNetwork: {
        primaryCare: 65,
        specialist: 105,
        emergency: 320,
        urgentCare: 105,
        prescription: 25
      },
      deductible: {
        individual: 1400,
        family: 2800
      },
      outOfPocketMax: {
        individual: 7500,
        family: 15000
      }
    },
    searchKeywords: ['humana', 'humana choice', 'humana gold'],
    isActive: true,
    addedBy: 'system'
  },
  {
    name: 'Kaiser Permanente',
    type: 'health',
    networks: ['Kaiser Foundation', 'Kaiser HMO'],
    states: ['CA', 'CO', 'GA', 'HI', 'MD', 'OR', 'VA', 'WA'],
    planTypes: ['HMO', 'Kaiser HMO'],
    contactInfo: {
      phone: '1-800-464-4000',
      website: 'https://www.kp.org',
      customerService: '1-800-464-4000'
    },
    coverage: {
      inNetwork: {
        primaryCare: 15,
        specialist: 35,
        emergency: 100,
        urgentCare: 40,
        prescription: 5
      },
      outOfNetwork: {
        primaryCare: 0,
        specialist: 0,
        emergency: 100,
        urgentCare: 0,
        prescription: 0
      },
      deductible: {
        individual: 1000,
        family: 2000
      },
      outOfPocketMax: {
        individual: 6500,
        family: 13000
      }
    },
    searchKeywords: ['kaiser', 'kaiser permanente', 'kp'],
    isActive: true,
    addedBy: 'system'
  }
];

export const seedInsuranceProviders = async () => {
  try {
    const existingCount = await InsuranceProvider.countDocuments();
    
    if (existingCount === 0) {
      console.log('Seeding insurance providers...');
      await InsuranceProvider.insertMany(sampleInsuranceProviders);
      console.log(`✅ Seeded ${sampleInsuranceProviders.length} insurance providers`);
    } else {
      console.log(`ℹ️  Insurance providers already exist (${existingCount} found)`);
    }
  } catch (error) {
    console.error('❌ Error seeding insurance providers:', error);
  }
};