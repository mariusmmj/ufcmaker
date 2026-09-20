import fs from 'fs';
import https from 'https';

const fightersPath = './src/data/fighters.json';
const fighters = JSON.parse(fs.readFileSync(fightersPath, 'utf-8'));

async function fetchStats(name) {
  return new Promise((resolve) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
      
    const url = `https://www.ufc.com/athlete/${slug}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let stats = {};
        
        const fbMatch = data.match(/<img[^>]*class="hero-profile__image"[^>]*src="([^"]+)"/i) 
                     || data.match(/<img[^>]*src="([^"]+)"[^>]*class="hero-profile__image"/i);
        if (fbMatch && fbMatch[1]) {
          stats.fullBodyImage = fbMatch[1].replace(/&amp;/g, '&');
        }

        const ageMatch = data.match(/<div class="c-bio__label">Age<\/div>\s*<div class="c-bio__text">\s*<div[^>]*>(\d+)<\/div>/i)
                      || data.match(/<div class="field field--name-age[^>]*>\s*<div class="field__item">(\d+)<\/div>/i);
        if (ageMatch && ageMatch[1]) {
          stats.age = parseInt(ageMatch[1]);
        }

        stats.winMethods = { ko: 0, sub: 0, dec: 0 };
        const koMatch = data.match(/<div class="c-stat-3bar__label">\s*KO\/TKO\s*<\/div>\s*<div class="c-stat-3bar__value">\s*(\d+)/i);
        if (koMatch) stats.winMethods.ko = parseInt(koMatch[1]);
        
        const subMatch = data.match(/<div class="c-stat-3bar__label">\s*SUB\s*<\/div>\s*<div class="c-stat-3bar__value">\s*(\d+)/i);
        if (subMatch) stats.winMethods.sub = parseInt(subMatch[1]);
        
        const decMatch = data.match(/<div class="c-stat-3bar__label">\s*DEC\s*<\/div>\s*<div class="c-stat-3bar__value">\s*(\d+)/i);
        if (decMatch) stats.winMethods.dec = parseInt(decMatch[1]);

        resolve(stats);
      });
    }).on('error', (err) => {
      resolve(null);
    });
  });
}

async function processAll() {
  console.log('Starting data scrape for ' + fighters.length + ' fighters...');
  
  const batchSize = 5;
  for (let i = 0; i < fighters.length; i += batchSize) {
    const batch = fighters.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (f) => {
      if (f.fullBodyImage) return; // Skip if already done
      
      const stats = await fetchStats(f.name);
      if (stats) {
        if (stats.fullBodyImage) f.fullBodyImage = stats.fullBodyImage;
        if (stats.age) f.age = stats.age;
        if (stats.winMethods) f.winMethods = stats.winMethods;
        
        console.log(`[Success] ${f.name}`);
      } else {
        console.log(`[Failed]  ${f.name}`);
      }
    }));
    
    fs.writeFileSync(fightersPath, JSON.stringify(fighters, null, 2));
  }
  
  console.log('Finished scraping!');
}

processAll();
