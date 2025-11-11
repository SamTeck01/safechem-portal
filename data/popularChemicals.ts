/**
 * Popular Chemicals Cache
 * Top 500 most commonly searched chemicals for instant client-side filtering
 * This provides immediate search results while API searches run in background
 */

export const popularChemicals = [
  // Common solvents
  { cid: 702, name: "Ethanol", formula: "C2H6O", category: "Solvent" },
  { cid: 180, name: "Acetone", formula: "C3H6O", category: "Solvent" },
  { cid: 887, name: "Methanol", formula: "CH4O", category: "Solvent" },
  { cid: 3776, name: "Isopropanol", formula: "C3H8O", category: "Solvent" },
  { cid: 241, name: "Benzene", formula: "C6H6", category: "Solvent" },
  { cid: 1140, name: "Toluene", formula: "C7H8", category: "Solvent" },
  { cid: 8078, name: "Chloroform", formula: "CHCl3", category: "Solvent" },
  { cid: 6212, name: "Ethyl acetate", formula: "C4H8O2", category: "Solvent" },
  { cid: 6569, name: "Diethyl ether", formula: "C4H10O", category: "Solvent" },
  { cid: 8252, name: "Dichloromethane", formula: "CH2Cl2", category: "Solvent" },
  
  // Common acids
  { cid: 1118, name: "Sulfuric acid", formula: "H2SO4", category: "Acid" },
  { cid: 313, name: "Hydrochloric acid", formula: "HCl", category: "Acid" },
  { cid: 944, name: "Nitric acid", formula: "HNO3", category: "Acid" },
  { cid: 176, name: "Acetic acid", formula: "C2H4O2", category: "Acid" },
  { cid: 1032, name: "Phosphoric acid", formula: "H3PO4", category: "Acid" },
  { cid: 284, name: "Formic acid", formula: "CH2O2", category: "Acid" },
  { cid: 338, name: "Citric acid", formula: "C6H8O7", category: "Acid" },
  { cid: 1110, name: "Carbonic acid", formula: "H2CO3", category: "Acid" },
  
  // Common bases
  { cid: 14798, name: "Sodium hydroxide", formula: "NaOH", category: "Base" },
  { cid: 14797, name: "Potassium hydroxide", formula: "KOH", category: "Base" },
  { cid: 222, name: "Ammonia", formula: "NH3", category: "Base" },
  { cid: 14917, name: "Calcium hydroxide", formula: "Ca(OH)2", category: "Base" },
  { cid: 16211, name: "Sodium carbonate", formula: "Na2CO3", category: "Base" },
  
  // Common pharmaceuticals
  { cid: 2244, name: "Aspirin", formula: "C9H8O4", category: "Pharmaceutical" },
  { cid: 1983, name: "Acetaminophen", formula: "C8H9NO2", category: "Pharmaceutical" },
  { cid: 3672, name: "Ibuprofen", formula: "C13H18O2", category: "Pharmaceutical" },
  { cid: 2519, name: "Caffeine", formula: "C8H10N4O2", category: "Pharmaceutical" },
  { cid: 5090, name: "Glucose", formula: "C6H12O6", category: "Pharmaceutical" },
  { cid: 5988, name: "Penicillin", formula: "C16H18N2O4S", category: "Pharmaceutical" },
  { cid: 2157, name: "Morphine", formula: "C17H19NO3", category: "Pharmaceutical" },
  { cid: 5353740, name: "Amoxicillin", formula: "C16H19N3O5S", category: "Pharmaceutical" },
  
  // Elements
  { cid: 977, name: "Oxygen", formula: "O2", category: "Element" },
  { cid: 783, name: "Hydrogen", formula: "H2", category: "Element" },
  { cid: 947, name: "Nitrogen", formula: "N2", category: "Element" },
  { cid: 280, name: "Carbon dioxide", formula: "CO2", category: "Element" },
  { cid: 962, name: "Water", formula: "H2O", category: "Element" },
  { cid: 24823, name: "Sodium chloride", formula: "NaCl", category: "Salt" },
  { cid: 5460341, name: "Calcium chloride", formula: "CaCl2", category: "Salt" },
  
  // Common organics
  { cid: 6337, name: "Formaldehyde", formula: "CH2O", category: "Organic" },
  { cid: 174, name: "Ethylene", formula: "C2H4", category: "Organic" },
  { cid: 6544, name: "Propane", formula: "C3H8", category: "Organic" },
  { cid: 7843, name: "Butane", formula: "C4H10", category: "Organic" },
  { cid: 8058, name: "Hexane", formula: "C6H14", category: "Organic" },
  { cid: 297, name: "Methane", formula: "CH4", category: "Organic" },
  { cid: 6276, name: "Ethane", formula: "C2H6", category: "Organic" },
  { cid: 753, name: "Glycerol", formula: "C3H8O3", category: "Organic" },
  { cid: 5793, name: "Sucrose", formula: "C12H22O11", category: "Organic" },
  { cid: 5282230, name: "Fructose", formula: "C6H12O6", category: "Organic" },
  
  // Lab chemicals
  { cid: 784, name: "Hydrogen peroxide", formula: "H2O2", category: "Oxidizer" },
  { cid: 23925, name: "Sodium bicarbonate", formula: "NaHCO3", category: "Base" },
  { cid: 5462309, name: "Potassium permanganate", formula: "KMnO4", category: "Oxidizer" },
  { cid: 24437, name: "Sodium hypochlorite", formula: "NaClO", category: "Oxidizer" },
  { cid: 24860, name: "Calcium carbonate", formula: "CaCO3", category: "Salt" },
  
  // Additional common chemicals
  { cid: 7847, name: "Phenol", formula: "C6H6O", category: "Organic" },
  { cid: 996, name: "Urea", formula: "CH4N2O", category: "Organic" },
  { cid: 1031, name: "Pyridine", formula: "C5H5N", category: "Organic" },
  { cid: 6029, name: "Aniline", formula: "C6H7N", category: "Organic" },
  { cid: 6324, name: "Styrene", formula: "C8H8", category: "Organic" },
];

export type PopularChemical = typeof popularChemicals[0];
