import fs from 'fs';
import https from 'https';

const fightersPath = './src/data/fighters.json';
const fighters = JSON.parse(fs.readFileSync(fightersPath, 'utf-8'));

async function fetchImage(name) {
  return new Promise((resolve) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');
      
    const url = `https://www.ufc.com/athlete/${slug}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const match = data.match(/<meta property="og:image" content="https:\/\/.*ufc\.com\/images\/(.*?\.(?:png|jpg))"/i);
        if (match && match[1]) {
          const originalPath = match[1];
          // E.g., 2025-07/POIRIER_DUSTIN_07-19.png
          // The user wants: https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/{path}
          const finalUrl = `https://www.ufc.com/images/styles/event_results_athlete_headshot/s3/${originalPath}`;
          resolve(finalUrl);
        } else {
          resolve(null);
        }
      });
    }).on('error', (err) => {
      resolve(null);
    });
  });
}

async function processAll() {
  console.log('Starting image scrape for ' + fighters.length + ' fighters...');
  
  // We process in batches of 10 to avoid hammering the server too hard or hanging
  const batchSize = 10;
  for (let i = 0; i < fighters.length; i += batchSize) {
    const batch = fighters.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (f) => {
      if (f.image) return; // Skip if already has image
      
      const imgUrl = await fetchImage(f.name);
      if (imgUrl) {
        f.image = imgUrl;
        console.log(`[Success] ${f.name}`);
      } else {
        console.log(`[Failed]  ${f.name}`);
      }
    }));
    
    // Write incrementally in case it crashes
    fs.writeFileSync(fightersPath, JSON.stringify(fighters, null, 2));
  }
  
  console.log('Finished scraping!');
}

processAll();
