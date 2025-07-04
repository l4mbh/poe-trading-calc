export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract query parameters
  const { league, type = 'Currency' } = req.query;

  if (!league) {
    return res.status(400).json({ error: 'League parameter is required' });
  }

  try {
    // Make request to POE.ninja API
    const poeNinjaUrl = `https://poe.ninja/api/data/currencyoverview?league=${encodeURIComponent(league)}&type=${encodeURIComponent(type)}`;
    
    console.log('Proxying request to:', poeNinjaUrl);
    
    const response = await fetch(poeNinjaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'POE-Trading-Calculator/1.0',
      },
    });

    if (!response.ok) {
      console.error('POE.ninja API error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `POE.ninja API error: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    
    // Return the data
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data from POE.ninja',
      details: error.message 
    });
  }
} 