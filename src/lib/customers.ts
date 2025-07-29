import fs from 'fs';
import path from 'path';
import { readDatabase } from './database';

const CUSTOMERS_DB_PATH = path.join(process.cwd(), 'data', 'customers.json');

interface CustomerData {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: 'free' | 'pro' | 'enterprise';
  monthlyFee: number;
  linksCount: number;
  totalClicks: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
}

interface CustomersDatabase {
  customers: { [id: string]: CustomerData };
}

// Default müşteri veritabanı
const defaultCustomersDB: CustomersDatabase = {
  customers: {
    'cust_1': {
      id: 'cust_1',
      name: 'Ahmet Teknoloji A.Ş.',
      email: 'musteri@sirket.com',
      password: 'musteri123',
      plan: 'pro',
      monthlyFee: 299,
      linksCount: 0,
      totalClicks: 0,
      status: 'active',
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: '2024-07-29T14:22:00Z'
    }
  }
};

export async function readCustomersDatabase(): Promise<CustomersDatabase> {
  try {
    // Data klasörü yoksa oluştur
    const dataDir = path.dirname(CUSTOMERS_DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Dosya yoksa default ile oluştur
    if (!fs.existsSync(CUSTOMERS_DB_PATH)) {
      await writeCustomersDatabase(defaultCustomersDB);
      return defaultCustomersDB;
    }

    const data = fs.readFileSync(CUSTOMERS_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Customers database okuma hatası:', error);
    return defaultCustomersDB;
  }
}

export async function writeCustomersDatabase(db: CustomersDatabase): Promise<void> {
  try {
    // Data klasörü yoksa oluştur
    const dataDir = path.dirname(CUSTOMERS_DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(CUSTOMERS_DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Customers database yazma hatası:', error);
    throw error;
  }
}

export async function addCustomer(customerData: Omit<CustomerData, 'id' | 'createdAt' | 'lastLogin' | 'linksCount' | 'totalClicks'>): Promise<CustomerData> {
  const db = await readCustomersDatabase();
  
  const newCustomer: CustomerData = {
    ...customerData,
    id: `cust_${Date.now()}`,
    linksCount: 0,
    totalClicks: 0,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  db.customers[newCustomer.id] = newCustomer;
  await writeCustomersDatabase(db);
  
  return newCustomer;
}

export async function updateCustomer(customerId: string, updates: Partial<CustomerData>): Promise<CustomerData | null> {
  const db = await readCustomersDatabase();
  
  if (!db.customers[customerId]) {
    return null;
  }

  db.customers[customerId] = { ...db.customers[customerId], ...updates };
  await writeCustomersDatabase(db);
  
  return db.customers[customerId];
}

export async function deleteCustomer(customerId: string): Promise<boolean> {
  const db = await readCustomersDatabase();
  
  if (!db.customers[customerId]) {
    return false;
  }

  delete db.customers[customerId];
  await writeCustomersDatabase(db);
  
  return true;
}

export async function getCustomerByEmail(email: string): Promise<CustomerData | null> {
  const db = await readCustomersDatabase();
  
  const customer = Object.values(db.customers).find(c => c.email === email);
  return customer || null;
}

export async function getAllCustomers(): Promise<CustomerData[]> {
  const db = await readCustomersDatabase();
  const mainDb = await readDatabase();
  
  // Her müşteri için güncel link ve tıklama sayılarını hesapla
  const customers = Object.values(db.customers).map(customer => {
    // Bu müşteriye ait linkleri say
    const customerLinks = Object.values(mainDb.links).filter(link => link.customerId === customer.id);
    const linksCount = customerLinks.length;
    
    // Bu müşteriye ait toplam tıklamaları say
    const totalClicks = customerLinks.reduce((sum, link) => {
      const linkStats = mainDb.stats[link.shortCode] || [];
      return sum + linkStats.length;
    }, 0);
    
    return {
      ...customer,
      linksCount,
      totalClicks
    };
  });
  
  return customers;
}
