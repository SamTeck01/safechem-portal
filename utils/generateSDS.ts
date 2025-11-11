/**
 * Generate SDS (Safety Data Sheet) from PubChem data
 * Creates a complete 16-section SDS document
 */

import { PubChemSafetyData } from '@/services/pubchemApi';

export interface SDSData {
  productName: string;
  productCode: string;
  manufacturer: string;
  emergencyPhone: string;
  recommendedUse: string;
  signalWord: string;
  hazardStatements: string[];
  precautionaryStatements: string[];
  components: Array<{ name: string; casNumber: string; concentration: string }>;
  inhalation: string;
  skinContact: string;
  eyeContact: string;
  ingestion: string;
  suitableExtinguishingMedia: string[];
  specificHazards: string[];
  personalPrecautions: string;
  environmentalPrecautions: string;
  cleanupMethods: string;
  handlingPrecautions: string;
  storageConditions: string;
  exposureLimits: string;
  engineeringControls: string;
  personalProtectiveEquipment: {
    respiratory: string;
    hands: string;
    eyes: string;
    skin: string;
  };
  appearance: string;
  odor: string;
  ph: string;
  meltingPoint: string;
  boilingPoint: string;
  flashPoint: string;
  density: string;
  solubility: string;
  chemicalStability: string;
  incompatibleMaterials: string[];
  acuteToxicity: string;
  skinCorrosion: string;
  eyeDamage: string;
  carcinogenicity: string;
  ecotoxicity: string;
  persistence: string;
  bioaccumulation: string;
  wasteDisposal: string;
  containerDisposal: string;
  unNumber: string;
  shippingName: string;
  hazardClass: string;
  packingGroup: string;
  safetyHealthEnvironmental: string[];
  preparedBy: string;
  revisionDate: string;
  revisionNumber: string;
}

export function generateSDSFromPubChem(
  cid: number,
  name: string,
  formula: string,
  molecularWeight: number,
  safetyData?: PubChemSafetyData
): SDSData {
  const signalWord = safetyData?.ghsClassification?.signalWord || 'WARNING';
  const hazards = safetyData?.ghsClassification?.hazardStatements || [];
  const precautions = safetyData?.ghsClassification?.precautionaryStatements || [];
  const firstAid = safetyData?.firstAid || [];
  const handling = safetyData?.handling || [];

  return {
    // Section 1: Identification
    productName: name,
    productCode: `PubChem-${cid}`,
    manufacturer: 'PubChem Database',
    emergencyPhone: '+1-800-424-9300 (CHEMTREC)',
    recommendedUse: 'Laboratory chemical, research purposes',

    // Section 2: Hazard Identification
    signalWord: signalWord,
    hazardStatements: hazards.length > 0 ? hazards : [
      'May cause irritation',
      'Handle with appropriate safety precautions',
    ],
    precautionaryStatements: precautions.length > 0 ? precautions : [
      'Wear protective gloves/protective clothing/eye protection/face protection',
      'IF IN EYES: Rinse cautiously with water for several minutes',
      'Store in a well-ventilated place',
    ],

    // Section 3: Composition
    components: [
      {
        name: name,
        casNumber: 'See PubChem',
        concentration: '100%',
      },
    ],

    // Section 4: First Aid
    inhalation: firstAid[0] || 'Remove to fresh air. If not breathing, give artificial respiration. Get medical attention immediately.',
    skinContact: firstAid[1] || 'Wash off immediately with plenty of water. Remove contaminated clothing. Get medical attention if irritation develops.',
    eyeContact: firstAid[2] || 'Rinse immediately with plenty of water for at least 15 minutes. Get medical attention immediately.',
    ingestion: firstAid[3] || 'Do NOT induce vomiting. Rinse mouth with water. Never give anything by mouth to an unconscious person. Get medical attention immediately.',

    // Section 5: Fire Fighting
    suitableExtinguishingMedia: [
      'Water spray',
      'Carbon dioxide (CO2)',
      'Dry chemical',
      'Foam',
    ],
    specificHazards: [
      'May emit toxic fumes when heated',
      'Combustion products may include carbon oxides',
    ],

    // Section 6: Accidental Release
    personalPrecautions: 'Evacuate personnel to safe areas. Ensure adequate ventilation. Wear appropriate personal protective equipment.',
    environmentalPrecautions: 'Prevent further leakage or spillage if safe to do so. Do not let product enter drains. Discharge into the environment must be avoided.',
    cleanupMethods: 'Sweep up and shovel into suitable containers for disposal. Keep in suitable, closed containers for disposal.',

    // Section 7: Handling and Storage
    handlingPrecautions: handling[0] || 'Avoid contact with skin and eyes. Avoid inhalation of vapor or mist. Use only in well-ventilated areas. Wear appropriate personal protective equipment.',
    storageConditions: handling[1] || 'Keep container tightly closed in a dry and well-ventilated place. Store at room temperature. Keep away from incompatible materials.',

    // Section 8: Exposure Controls
    exposureLimits: 'No exposure limits established for this substance',
    engineeringControls: 'Use adequate general or local exhaust ventilation to keep airborne concentrations below the permissible exposure limits. Use process enclosures, local exhaust ventilation, or other engineering controls to control airborne levels.',
    personalProtectiveEquipment: {
      respiratory: 'Use NIOSH-approved respirator if exposure limits are exceeded',
      hands: 'Chemical-resistant gloves (nitrile, neoprene, or equivalent)',
      eyes: 'Safety glasses with side shields or chemical goggles',
      skin: 'Lab coat or protective clothing',
    },

    // Section 9: Physical and Chemical Properties
    appearance: 'See PubChem for details',
    odor: 'Characteristic',
    ph: 'Not available',
    meltingPoint: 'See PubChem',
    boilingPoint: 'See PubChem',
    flashPoint: 'Not available',
    density: `MW: ${molecularWeight.toFixed(2)} g/mol`,
    solubility: 'See PubChem for solubility data',

    // Section 10: Stability and Reactivity
    chemicalStability: 'Stable under recommended storage conditions',
    incompatibleMaterials: [
      'Strong oxidizing agents',
      'Strong acids',
      'Strong bases',
    ],

    // Section 11: Toxicological Information
    acuteToxicity: 'No data available. Handle with appropriate safety precautions.',
    skinCorrosion: 'May cause skin irritation',
    eyeDamage: 'May cause eye irritation',
    carcinogenicity: 'No data available',

    // Section 12: Ecological Information
    ecotoxicity: 'No data available. Avoid release to the environment.',
    persistence: 'No data available',
    bioaccumulation: 'No data available',

    // Section 13: Disposal
    wasteDisposal: 'Dispose of in accordance with local, state, and federal regulations. Contact a licensed professional waste disposal service.',
    containerDisposal: 'Dispose of container and unused contents in accordance with federal, state, and local requirements.',

    // Section 14: Transport
    unNumber: 'Not regulated',
    shippingName: name,
    hazardClass: 'Not classified',
    packingGroup: 'Not applicable',

    // Section 15: Regulatory
    safetyHealthEnvironmental: [
      'This chemical is not listed under TSCA',
      'Consult local regulations for specific requirements',
      'Follow all applicable safety regulations',
    ],

    // Section 16: Other Information
    preparedBy: 'SafeChem Portal - Data from PubChem',
    revisionDate: new Date().toLocaleDateString(),
    revisionNumber: '1.0',
  };
}
