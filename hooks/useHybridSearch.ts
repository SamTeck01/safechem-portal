/**
 * Professional Hybrid Search Hook
 * Combines instant cached results with comprehensive API search
 * Like PubChem.ncbi.nlm.nih.gov
 */

import { popularChemicals } from '@/data/popularChemicals';
import { searchChemicalsAutocomplete, PubChemCompound } from '@/services/pubchemApi';
import { Chemical } from '@/types/chemical';
import { useState, useEffect } from 'react';

// Convert popular chemical to Chemical type
const convertPopularToChemical = (popular: typeof popularChemicals[0]): Chemical => ({
  id: popular.cid.toString(),
  name: popular.name,
  formula: popular.formula,
  casNumber: '',
  category: popular.category as any,
  hazardLevel: 'Moderate',
  description: `Common ${popular.category.toLowerCase()}`,
});

// Convert PubChem compound to Chemical type
const convertPubChemToChemical = (compound: PubChemCompound): Chemical => ({
  id: compound.cid.toString(),
  name: compound.name,
  formula: compound.molecularFormula,
  casNumber: '',
  category: 'Organic',
  hazardLevel: 'Moderate',
  description: `MW: ${compound.molecularWeight.toFixed(2)} g/mol`,
});

export function useHybridSearch(query: string) {
  const [cachedResults, setCachedResults] = useState<Chemical[]>([]);
  const [apiResults, setApiResults] = useState<Chemical[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<'cache' | 'api' | 'both'>('cache');

  useEffect(() => {
    if (!query || query.length < 1) {
      setCachedResults([]);
      setApiResults([]);
      setSearchSource('cache');
      return;
    }

    // Phase 1: Instant cached search
    const searchCached = () => {
      const lowerQuery = query.toLowerCase();
      const cached = popularChemicals
        .filter(chem => 
          chem.name.toLowerCase().includes(lowerQuery) ||
          chem.formula.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 10)
        .map(convertPopularToChemical);
      
      setCachedResults(cached);
      
      if (cached.length > 0) {
        setSearchSource('cache');
      }
    };

    // Phase 2: Comprehensive API search
    const searchAPI = async () => {
      setLoading(true);
      try {
        const compounds = await searchChemicalsAutocomplete(query, 50);
        const apiChemicals = compounds.map(convertPubChemToChemical);
        
        // Remove duplicates (chemicals already in cache)
        const cachedIds = new Set(cachedResults.map(c => c.id));
        const uniqueApiResults = apiChemicals.filter(c => !cachedIds.has(c.id));
        
        setApiResults(uniqueApiResults);
        setSearchSource(cachedResults.length > 0 ? 'both' : 'api');
      } catch (error) {
        console.error('API search error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Execute both searches
    searchCached(); // Instant
    
    const apiTimer = setTimeout(() => {
      searchAPI(); // After 200ms
    }, 200);

    return () => clearTimeout(apiTimer);
  }, [query]);

  // Merge results: cached first (instant), then API results
  const allResults = [...cachedResults, ...apiResults];

  return {
    results: allResults,
    cachedResults,
    apiResults,
    loading,
    searchSource,
    hasCachedResults: cachedResults.length > 0,
    hasApiResults: apiResults.length > 0,
  };
}
