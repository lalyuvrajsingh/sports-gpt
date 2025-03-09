/**
 * Utility functions for parsing and formatting chart data from Markdown content
 */

interface PlayerStat {
  name: string;
  matches?: number;
  runs?: number;
  average?: number;
  strikeRate?: number;
  centuries?: number;
  wickets?: number;
  economy?: number;
  [key: string]: string | number | undefined;
}

interface MatchStat {
  period: string;
  runs?: number;
  average?: number;
  strikeRate?: number;
  wickets?: number;
  economy?: number;
  [key: string]: string | number | undefined;
}

interface TeamStat {
  category: string;
  value: number;
  [key: string]: string | number | undefined;
}

/**
 * Extracts player comparison data from a markdown table
 * @param tableText - The markdown table text
 * @returns Object with metrics and data for radar chart
 */
export function extractPlayerComparisonFromTable(tableText: string): { 
  metrics: string[]; 
  players: string[]; 
  data: PlayerStat[] 
} {
  try {
    // Split the table into rows
    const rows = tableText.trim().split('\n');
    
    // Extract headers (skip the separator row)
    const headers = rows[0].split('|')
      .map(h => h.trim())
      .filter(h => h.length > 0);
    
    // Extract data rows (skip the header and separator rows)
    const dataRows = rows.slice(2).filter(row => row.trim().length > 0);
    
    // Process data rows
    const playerStats: PlayerStat[] = [];
    const players: string[] = [];
    
    dataRows.forEach(row => {
      const cells = row.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      if (cells.length === headers.length) {
        const playerStat: PlayerStat = { name: cells[0] };
        players.push(cells[0]);
        
        // Map other metrics
        for (let i = 1; i < headers.length; i++) {
          const key = headers[i].toLowerCase().replace(/\s+/g, '');
          const value = parseFloat(cells[i]);
          
          if (!isNaN(value)) {
            playerStat[key] = value;
          } else {
            playerStat[key] = cells[i];
          }
        }
        
        playerStats.push(playerStat);
      }
    });
    
    // Extract metrics for radar chart (excluding the player name)
    const metrics = headers.slice(1);
    
    // For radar charts, normalize values to 0-100 scale
    const normalizedStats = playerStats.map(player => {
      const normalized: PlayerStat = { name: player.name };
      
      metrics.forEach(metric => {
        const key = metric.toLowerCase().replace(/\s+/g, '');
        if (typeof player[key] === 'number') {
          normalized[key] = normalizeValue(metric, player[key] as number);
        }
      });
      
      return normalized;
    });
    
    return {
      metrics,
      players,
      data: normalizedStats
    };
  } catch (error) {
    console.error('Error parsing player comparison table:', error);
    return { metrics: [], players: [], data: [] };
  }
}

/**
 * Extracts career progression data from a markdown table
 * @param tableText - The markdown table text
 * @returns Object with metrics and data for line chart
 */
export function extractCareerProgressionFromTable(tableText: string): {
  periods: string[];
  metrics: string[];
  data: MatchStat[];
} {
  try {
    // Split the table into rows
    const rows = tableText.trim().split('\n');
    
    // Extract headers (skip the separator row)
    const headers = rows[0].split('|')
      .map(h => h.trim())
      .filter(h => h.length > 0);
    
    // Extract data rows (skip the header and separator rows)
    const dataRows = rows.slice(2).filter(row => row.trim().length > 0);
    
    // Process data rows
    const matchStats: MatchStat[] = [];
    const periods: string[] = [];
    
    dataRows.forEach(row => {
      const cells = row.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      if (cells.length === headers.length) {
        const matchStat: MatchStat = { period: cells[0] };
        periods.push(cells[0]);
        
        // Map other metrics
        for (let i = 1; i < headers.length; i++) {
          const key = headers[i].toLowerCase().replace(/\s+/g, '');
          const value = parseFloat(cells[i]);
          
          if (!isNaN(value)) {
            matchStat[key] = value;
          } else {
            matchStat[key] = cells[i];
          }
        }
        
        matchStats.push(matchStat);
      }
    });
    
    // Extract metrics for line chart (excluding the period)
    const metrics = headers.slice(1);
    
    return {
      periods,
      metrics,
      data: matchStats
    };
  } catch (error) {
    console.error('Error parsing career progression table:', error);
    return { periods: [], metrics: [], data: [] };
  }
}

/**
 * Extracts distribution data from a markdown table
 * @param tableText - The markdown table text
 * @returns Object with categories and values for pie chart
 */
export function extractDistributionFromTable(tableText: string): {
  categories: string[];
  values: number[];
  data: TeamStat[];
} {
  try {
    // Split the table into rows
    const rows = tableText.trim().split('\n');
    
    // Extract headers (skip the separator row)
    const headers = rows[0].split('|')
      .map(h => h.trim())
      .filter(h => h.length > 0);
    
    // Extract data rows (skip the header and separator rows)
    const dataRows = rows.slice(2).filter(row => row.trim().length > 0);
    
    // Process data rows
    const teamStats: TeamStat[] = [];
    const categories: string[] = [];
    const values: number[] = [];
    
    dataRows.forEach(row => {
      const cells = row.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      if (cells.length === headers.length) {
        const category = cells[0];
        const value = parseFloat(cells[1]);
        
        categories.push(category);
        
        if (!isNaN(value)) {
          values.push(value);
          
          const teamStat: TeamStat = { 
            category: category,
            value: value
          };
          
          teamStats.push(teamStat);
        }
      }
    });
    
    return {
      categories,
      values,
      data: teamStats
    };
  } catch (error) {
    console.error('Error parsing distribution table:', error);
    return { categories: [], values: [], data: [] };
  }
}

/**
 * Normalize values to a 0-100 scale for radar charts
 * @param metric - The metric name
 * @param value - The value to normalize
 * @returns Normalized value between 0-100
 */
function normalizeValue(metric: string, value: number): number {
  // Base normalization based on cricket metrics
  const metricLower = metric.toLowerCase();
  
  if (metricLower.includes('average')) {
    // Batting average: 0-60 scale
    return Math.min(100, (value / 60) * 100);
  } else if (metricLower.includes('strike rate')) {
    // Strike rate: 0-200 scale
    return Math.min(100, (value / 200) * 100);
  } else if (metricLower.includes('economy')) {
    // Economy rate: inversely proportional (lower is better)
    // 0-12 scale, inverted
    return Math.max(0, 100 - ((value / 12) * 100));
  } else if (metricLower.includes('centuries') || metricLower.includes('wickets')) {
    // Cap at 30 for centuries or wickets
    return Math.min(100, (value / 30) * 100);
  } else if (metricLower.includes('runs')) {
    // Cap at 10000 for runs
    return Math.min(100, (value / 10000) * 100);
  } else if (metricLower.includes('matches')) {
    // Cap at 200 for matches
    return Math.min(100, (value / 200) * 100);
  }
  
  // Default normalization
  return value;
}

/**
 * Finds and extracts chart data from markdown content
 * @param content - The markdown content with chart markers
 * @returns Object with parsed chart data
 */
export function findAndParseChartData(content: string): {
  playerComparisons: Array<{ metrics: string[]; players: string[]; data: PlayerStat[] }>;
  careerProgressions: Array<{ periods: string[]; metrics: string[]; data: MatchStat[] }>;
  distributions: Array<{ categories: string[]; values: number[]; data: TeamStat[] }>;
} {
  const playerComparisons: Array<{ metrics: string[]; players: string[]; data: PlayerStat[] }> = [];
  const careerProgressions: Array<{ periods: string[]; metrics: string[]; data: MatchStat[] }> = [];
  const distributions: Array<{ categories: string[]; values: number[]; data: TeamStat[] }> = [];
  
  try {
    // Find player comparison charts
    const playerComparisonRegex = /```chart:player-comparison\s+([\s\S]+?)```/g;
    let match = playerComparisonRegex.exec(content);
    while (match) {
      const tableText = match[1].trim();
      const chartData = extractPlayerComparisonFromTable(tableText);
      if (chartData.players.length > 0) {
        playerComparisons.push(chartData);
      }
      match = playerComparisonRegex.exec(content);
    }
    
    // Find career progression charts
    const careerProgressionRegex = /```chart:career-progression\s+([\s\S]+?)```/g;
    match = careerProgressionRegex.exec(content);
    while (match) {
      const tableText = match[1].trim();
      const chartData = extractCareerProgressionFromTable(tableText);
      if (chartData.periods.length > 0) {
        careerProgressions.push(chartData);
      }
      match = careerProgressionRegex.exec(content);
    }
    
    // Find distribution charts
    const distributionRegex = /```chart:distribution\s+([\s\S]+?)```/g;
    match = distributionRegex.exec(content);
    while (match) {
      const tableText = match[1].trim();
      const chartData = extractDistributionFromTable(tableText);
      if (chartData.categories.length > 0) {
        distributions.push(chartData);
      }
      match = distributionRegex.exec(content);
    }
  } catch (error) {
    console.error('Error parsing chart data from content:', error);
  }
  
  return {
    playerComparisons,
    careerProgressions,
    distributions
  };
} 