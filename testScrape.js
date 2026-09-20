import https from 'https';
import fs from 'fs';

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
        let stats = { name };
        
        // Full Body Image (from the image string the user provided as example)
        // class="hero-profile__image"
        const fbMatch = data.match(/<img[^>]*class="hero-profile__image"[^>]*src="([^"]+)"/i) 
                     || data.match(/<img[^>]*src="([^"]+)"[^>]*class="hero-profile__image"/i);
        if (fbMatch && fbMatch[1]) {
          stats.fullBodyImage = fbMatch[1].replace(/&amp;/g, '&');
        }

        // Age
        const ageMatch = data.match(/<div class="c-bio__label">Age<\/div>\s*<div class="c-bio__text">\s*<div[^>]*>(\d+)<\/div>/i)
                      || data.match(/<div class="field field--name-age[^>]*>\s*<div class="field__item">(\d+)<\/div>/i);
        if (ageMatch && ageMatch[1]) {
          stats.age = parseInt(ageMatch[1]);
        }
        
        // Record (sometimes on page)
        const recordMatch = data.match(/<span class="c-hero__headline-suffix[^>]*>\s*•\s*([0-9-]+\s*\(W-L-D\))/i) || data.match(/<p class="hero-profile__division-body">([0-9-]+-[A-Z]+)/i);
        if (recordMatch) {
            stats.recordStr = recordMatch[1];
        }

        resolve(stats);
      });
    }).on('error', (err) => {
      resolve(null);
    });
  });
}

async function test() {
  const poirier = await fetchStats('Dustin Poirier');
  console.log('Poirier:', poirier);
}

test();
