// Bu dosya mevcut linkleri default müşteriye atamak için bir kerelik çalıştırılacak
const fs = require('fs');
const path = require('path');

async function migrateLinks() {
  try {
    const dbPath = path.join(__dirname, 'data', 'database.json');
    
    if (!fs.existsSync(dbPath)) {
      console.log('Database dosyası bulunamadı.');
      return;
    }
    
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    
    const defaultCustomerId = 'cust_1'; // Default müşteri ID'si
    
    let updated = false;
    
    // Tüm linkleri kontrol et
    for (const [shortCode, linkData] of Object.entries(db.links)) {
      if (!linkData.customerId) {
        console.log(`Link ${shortCode} için customerId ekleniyor...`);
        db.links[shortCode] = {
          ...linkData,
          customerId: defaultCustomerId
        };
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      console.log('Linkler başarıyla güncellendi!');
    } else {
      console.log('Güncellenecek link bulunamadı.');
    }
    
  } catch (error) {
    console.error('Migration hatası:', error);
  }
}

migrateLinks();
