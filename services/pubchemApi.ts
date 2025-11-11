// PubChem API Service for SafeChem Portal
// Documentation: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest

const PUBCHEM_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
const PUBCHEM_VIEW_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug_view';

export interface PubChemCompound {
  cid: number;
  name: string;
  molecularFormula: string;
  molecularWeight: number;
  iupacName?: string;
  canonicalSmiles?: string;
}

export interface PubChemSafetyData {
  ghsClassification?: {
    pictograms: string[];
    signalWord: string;
    hazardStatements: string[];
    precautionaryStatements: string[];
  };
  hazards?: string[];
  firstAid?: string[];
  fireFighting?: string[];
  handling?: string[];
  storage?: string[];
  disposal?: string[];
  physicalHazards?: string[];
  healthHazards?: string[];
  environmentalHazards?: string[];
}

/**
 * Search for chemicals by name (exact match)
 */
export async function searchChemicalByName(name: string): Promise<PubChemCompound[]> {
  try {
    const response = await fetch(
      `${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(name)}/JSON`
    );
    
    if (!response.ok) {
      throw new Error(`PubChem API error: ${response.status}`);
    }

    const data = await response.json();
    const compounds = data.PC_Compounds || [];

    return compounds.map((compound: any) => ({
      cid: compound.id.id.cid,
      name: name,
      molecularFormula: compound.props.find((p: any) => p.urn.label === 'Molecular Formula')?.value?.sval || '',
      molecularWeight: compound.props.find((p: any) => p.urn.label === 'Molecular Weight')?.value?.fval || 0,
      iupacName: compound.props.find((p: any) => p.urn.label === 'IUPAC Name')?.value?.sval,
      canonicalSmiles: compound.props.find((p: any) => p.urn.label === 'SMILES')?.value?.sval,
    }));
  } catch (error) {
    console.error('Error searching chemical:', error);
    return [];
  }
}

/**
 * Autocomplete search - returns multiple chemicals matching the query
 * This uses PubChem's autocomplete API for broader results
 */
export async function searchChemicalsAutocomplete(query: string, limit: number = 50): Promise<PubChemCompound[]> {
  try {
    // For very short queries (1-2 chars), use a different approach
    if (query.length <= 2) {
      // Try common chemicals starting with that letter
      const commonChemicals: Record<string, string[]> = {
        'a': ['acetone', 'ammonia', 'aspirin', 'acetic acid', 'acetaminophen', 'argon', 'arsenic'],
        'b': ['benzene', 'butanol', 'bromine', 'barium', 'boron'],
        'c': ['caffeine', 'chlorine', 'carbon', 'calcium', 'copper', 'chromium'],
        'd': ['dextrose', 'dimethyl', 'dopamine'],
        'e': ['ethanol', 'ethane', 'ether', 'epinephrine'],
        'f': ['formaldehyde', 'fluorine', 'fructose'],
        'g': ['glucose', 'glycerol', 'gold'],
        'h': ['hydrogen', 'helium', 'hydrochloric acid'],
        'i': ['iodine', 'iron', 'isopropanol', 'ibuprofen'],
        'm': ['methanol', 'methane', 'mercury', 'magnesium'],
        'n': ['nitrogen', 'neon', 'nickel', 'nitric acid'],
        'o': ['oxygen', 'ozone'],
        'p': ['propanol', 'propane', 'phosphorus', 'potassium'],
        's': ['sulfuric acid', 'sodium', 'silver', 'sucrose'],
        't': ['toluene', 'titanium'],
        'w': ['water'],
      };
      
      const firstChar = query.toLowerCase()[0];
      const suggestions = commonChemicals[firstChar] || [];
      
      // Filter by query if 2 chars
      const filtered = query.length === 2 
        ? suggestions.filter(s => s.toLowerCase().startsWith(query.toLowerCase()))
        : suggestions;
      
      if (filtered.length > 0) {
        // Fetch these common chemicals
        const searchPromises = filtered.slice(0, 10).map(async (name) => {
          try {
            const results = await searchChemicalByName(name);
            return results[0] || null;
          } catch {
            return null;
          }
        });
        
        const results = await Promise.all(searchPromises);
        return results.filter((r): r is PubChemCompound => r !== null);
      }
    }
    
    // Step 1: Get CIDs from autocomplete
    const autocompleteResponse = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query)}/json?limit=${limit}`
    );

    if (!autocompleteResponse.ok) {
      return [];
    }

    const autocompleteData = await autocompleteResponse.json();
    const suggestions = autocompleteData.dictionary_terms?.compound || [];

    if (suggestions.length === 0) {
      return [];
    }

    // Step 2: For each suggestion, get the CID
    const cidPromises = suggestions.slice(0, 20).map(async (name: string) => {
      try {
        const cidResponse = await fetch(
          `${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(name)}/cids/JSON`
        );
        
        if (!cidResponse.ok) return null;
        
        const cidData = await cidResponse.json();
        return { name, cid: cidData.IdentifierList?.CID?.[0] };
      } catch {
        return null;
      }
    });

    const cidResults = await Promise.all(cidPromises);
    const validCids = cidResults.filter((r): r is { name: string; cid: number } => r !== null && r.cid);

    if (validCids.length === 0) {
      return [];
    }

    // Step 3: Batch fetch compound details
    const cids = validCids.map(r => r.cid).join(',');
    const detailsResponse = await fetch(
      `${PUBCHEM_BASE_URL}/compound/cid/${cids}/JSON`
    );

    if (!detailsResponse.ok) {
      return [];
    }

    const detailsData = await detailsResponse.json();
    const compounds = detailsData.PC_Compounds || [];

    // Map compounds with their names
    return compounds.map((compound: any) => {
      const cid = compound.id.id.cid;
      const matchedName = validCids.find(v => v.cid === cid)?.name || `Compound ${cid}`;
      
      return {
        cid,
        name: matchedName,
        molecularFormula: compound.props.find((p: any) => p.urn.label === 'Molecular Formula')?.value?.sval || '',
        molecularWeight: compound.props.find((p: any) => p.urn.label === 'Molecular Weight')?.value?.fval || 0,
        iupacName: compound.props.find((p: any) => p.urn.label === 'IUPAC Name')?.value?.sval,
        canonicalSmiles: compound.props.find((p: any) => p.urn.label === 'SMILES')?.value?.sval,
      };
    });
  } catch (error) {
    console.error('Error in autocomplete search:', error);
    return [];
  }
}

/**
 * Get chemical by CAS number
 */
export async function searchChemicalByCAS(casNumber: string): Promise<PubChemCompound | null> {
  try {
    const response = await fetch(
      `${PUBCHEM_BASE_URL}/compound/name/${encodeURIComponent(casNumber)}/JSON`
    );
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const compound = data.PC_Compounds?.[0];

    if (!compound) return null;

    return {
      cid: compound.id.id.cid,
      name: casNumber,
      molecularFormula: compound.props.find((p: any) => p.urn.label === 'Molecular Formula')?.value?.sval || '',
      molecularWeight: compound.props.find((p: any) => p.urn.label === 'Molecular Weight')?.value?.fval || 0,
      iupacName: compound.props.find((p: any) => p.urn.label === 'IUPAC Name')?.value?.sval,
      canonicalSmiles: compound.props.find((p: any) => p.urn.label === 'SMILES')?.value?.sval,
    };
  } catch (error) {
    console.error('Error searching by CAS:', error);
    return null;
  }
}

/**
 * Get GHS Classification and Safety Data
 */
export async function getChemicalSafetyData(cid: number): Promise<PubChemSafetyData> {
  try {
    const response = await fetch(
      `${PUBCHEM_VIEW_URL}/data/compound/${cid}/JSON/?heading=GHS+Classification,Hazards+Identification,First+Aid+Measures,Fire+Fighting+Measures,Handling+and+Storage,Disposal+Methods`
    );

    if (!response.ok) {
      throw new Error(`PubChem API error: ${response.status}`);
    }

    const data = await response.json();
    const sections = data.Record?.Section || [];

    const safetyData: PubChemSafetyData = {};

    // Parse GHS Classification
    const ghsSection = findSection(sections, 'GHS Classification');
    if (ghsSection) {
      safetyData.ghsClassification = parseGHSClassification(ghsSection);
    }

    // Parse Hazards
    const hazardsSection = findSection(sections, 'Hazards Identification');
    if (hazardsSection) {
      safetyData.hazards = extractTextArray(hazardsSection);
    }

    // Parse First Aid
    const firstAidSection = findSection(sections, 'First Aid Measures');
    if (firstAidSection) {
      safetyData.firstAid = extractTextArray(firstAidSection);
    }

    // Parse Fire Fighting
    const fireSection = findSection(sections, 'Fire Fighting Measures');
    if (fireSection) {
      safetyData.fireFighting = extractTextArray(fireSection);
    }

    // Parse Handling and Storage
    const handlingSection = findSection(sections, 'Handling and Storage');
    if (handlingSection) {
      const texts = extractTextArray(handlingSection);
      safetyData.handling = texts.filter(t => t.toLowerCase().includes('handling'));
      safetyData.storage = texts.filter(t => t.toLowerCase().includes('storage'));
    }

    // Parse Disposal
    const disposalSection = findSection(sections, 'Disposal Methods');
    if (disposalSection) {
      safetyData.disposal = extractTextArray(disposalSection);
    }

    return safetyData;
  } catch (error) {
    console.error('Error fetching safety data:', error);
    return {};
  }
}

/**
 * Get chemical properties (formula, weight, etc.)
 */
export async function getChemicalProperties(cid: number) {
  try {
    const url = `${PUBCHEM_BASE_URL}/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES,InChI,InChIKey/JSON`;
    console.log('Fetching properties for CID:', cid);
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`PubChem API error for CID ${cid}:`, response.status);
      throw new Error(`PubChem API error: ${response.status}`);
    }

    const data = await response.json();
    const properties = data.PropertyTable?.Properties?.[0];
    
    if (!properties) {
      console.error(`No properties found for CID ${cid}`);
      return null;
    }
    
    console.log('Properties loaded for CID:', cid, properties);
    return properties;
  } catch (error) {
    console.error('Error fetching properties for CID', cid, ':', error);
    return null;
  }
}

/**
 * Get compounds by CID range for feed (batch request)
 */
export async function getCompoundsByCIDRange(startCid: number, count: number): Promise<PubChemCompound[]> {
  try {
    // Create comma-separated list of CIDs
    const cids = Array.from({ length: count }, (_, i) => startCid + i).join(',');
    
    const response = await fetch(
      `${PUBCHEM_BASE_URL}/compound/cid/${cids}/JSON`
    );

    if (!response.ok) {
      throw new Error(`PubChem API error: ${response.status}`);
    }

    const data = await response.json();
    const compounds = data.PC_Compounds || [];

    return compounds.map((compound: any) => ({
      cid: compound.id.id.cid,
      name: compound.props.find((p: any) => p.urn.label === 'IUPAC Name')?.value?.sval || `Compound ${compound.id.id.cid}`,
      molecularFormula: compound.props.find((p: any) => p.urn.label === 'Molecular Formula')?.value?.sval || '',
      molecularWeight: compound.props.find((p: any) => p.urn.label === 'Molecular Weight')?.value?.fval || 0,
      iupacName: compound.props.find((p: any) => p.urn.label === 'IUPAC Name')?.value?.sval,
      canonicalSmiles: compound.props.find((p: any) => p.urn.label === 'SMILES')?.value?.sval,
    }));
  } catch (error) {
    console.error('Error fetching compounds by CID range:', error);
    return [];
  }
}

/**
 * Get random compounds by array of CIDs (for random feed)
 */
export async function getCompoundsByCIDs(cids: number[]): Promise<PubChemCompound[]> {
  try {
    // Create comma-separated list of CIDs
    const cidList = cids.join(',');
    
    const response = await fetch(
      `${PUBCHEM_BASE_URL}/compound/cid/${cidList}/JSON`
    );

    if (!response.ok) {
      // Some CIDs might not exist, that's okay
      return [];
    }

    const data = await response.json();
    const compounds = data.PC_Compounds || [];

    return compounds.map((compound: any) => ({
      cid: compound.id.id.cid,
      name: compound.props.find((p: any) => p.urn.label === 'IUPAC Name')?.value?.sval || `Compound ${compound.id.id.cid}`,
      molecularFormula: compound.props.find((p: any) => p.urn.label === 'Molecular Formula')?.value?.sval || '',
      molecularWeight: compound.props.find((p: any) => p.urn.label === 'Molecular Weight')?.value?.fval || 0,
      iupacName: compound.props.find((p: any) => p.urn.label === 'IUPAC Name')?.value?.sval,
      canonicalSmiles: compound.props.find((p: any) => p.urn.label === 'SMILES')?.value?.sval,
    }));
  } catch (error) {
    console.error('Error fetching compounds by CIDs:', error);
    return [];
  }
}

/**
 * Get 2D chemical structure image URL
 */
export function getChemicalImageURL(cid: number, size: number = 300): string {
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_size=${size}x${size}`;
}

// Helper functions

function findSection(sections: any[], heading: string): any {
  for (const section of sections) {
    if (section.TOCHeading === heading) {
      return section;
    }
    if (section.Section) {
      const found = findSection(section.Section, heading);
      if (found) return found;
    }
  }
  return null;
}

function parseGHSClassification(section: any) {
  const info = section.Information || [];
  const classification: any = {
    pictograms: [],
    signalWord: '',
    hazardStatements: [],
    precautionaryStatements: [],
  };

  for (const item of info) {
    if (item.Name === 'Pictogram(s)') {
      const markup = item.Value?.StringWithMarkup?.[0]?.Markup || [];
      classification.pictograms = markup.map((m: any) => m.Extra);
    } else if (item.Name === 'Signal') {
      classification.signalWord = item.Value?.StringWithMarkup?.[0]?.String || '';
    } else if (item.Name === 'GHS Hazard Statements') {
      const statements = item.Value?.StringWithMarkup || [];
      classification.hazardStatements = statements.map((s: any) => s.String);
    } else if (item.Name === 'Precautionary Statement Codes') {
      const statements = item.Value?.StringWithMarkup || [];
      classification.precautionaryStatements = statements.map((s: any) => s.String);
    }
  }

  return classification;
}

function extractTextArray(section: any): string[] {
  const texts: string[] = [];
  
  if (section.Information) {
    for (const info of section.Information) {
      if (info.Value?.StringWithMarkup) {
        for (const markup of info.Value.StringWithMarkup) {
          if (markup.String) {
            texts.push(markup.String);
          }
        }
      } else if (info.Value?.String) {
        texts.push(info.Value.String);
      }
    }
  }

  if (section.Section) {
    for (const subsection of section.Section) {
      texts.push(...extractTextArray(subsection));
    }
  }

  return texts;
}
