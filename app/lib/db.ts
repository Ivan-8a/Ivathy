// lib/db.ts
import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  name: string;
  pushSubscription?: PushSubscription;
  partnerId?: string;
  createdAt: Date;
}

export interface Couple {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
}

class SimpleDB {
  private users: Map<string, User>;
  private pairCodes: Map<string, string>;
  private couples: Map<string, Couple>;
  private dbPath: string;

  constructor() {
    // Inicializar Maps
    this.users = new Map();
    this.pairCodes = new Map();
    this.couples = new Map();
    
    // Configurar ruta de datos
    this.dbPath = path.join(process.cwd(), 'data', 'db.json');
    
    // Crear directorio si no existe
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Cargar datos existentes
    this.loadData();
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
        
        // Cargar usuarios
        this.users = new Map(data.users?.map((user: User) => [user.id, user]) || []);
        
        // Cargar códigos de emparejamiento
        this.pairCodes = new Map(data.pairCodes || []);
        
        // Cargar parejas
        this.couples = new Map(data.couples?.map((couple: Couple) => [couple.id, couple]) || []);
        
        console.log('Data loaded:', {
          users: Array.from(this.users.entries()),
          pairCodes: Array.from(this.pairCodes.entries()),
          couples: Array.from(this.couples.entries())
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private saveData(): void {
    try {
      const data = {
        users: Array.from(this.users.values()),
        pairCodes: Array.from(this.pairCodes.entries()),
        couples: Array.from(this.couples.values())
      };
      
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Usuarios
  async createUser(user: Omit<User, 'createdAt'>): Promise<User> {
    const newUser = {
      ...user,
      createdAt: new Date()
    };
    this.users.set(user.id, newUser);
    this.saveData();
    return newUser;
  }

  async getUser(id: string): Promise<User | undefined> {
    console.log('Getting user:', id);
    console.log('Available users:', Array.from(this.users.entries()));
    return this.users.get(id);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    this.saveData();
    return updatedUser;
  }

  // Parejas
  async createCouple(user1Id: string, user2Id: string): Promise<Couple> {
    const coupleId = `${user1Id}_${user2Id}`;
    const couple: Couple = {
      id: coupleId,
      user1Id,
      user2Id,
      createdAt: new Date()
    };
    
    this.couples.set(coupleId, couple);
    
    // Actualizar usuarios
    await this.updateUser(user1Id, { partnerId: user2Id });
    await this.updateUser(user2Id, { partnerId: user1Id });
    
    return couple;
  }

  // Códigos de emparejamiento
  generatePairCode(): string {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Generated new code:', code); // Debug log
    return code;
  }

  setPairCode(userId: string, code: string): void {
    console.log('Setting pair code:', { userId, code });
    this.pairCodes.set(code, userId);
    this.saveData();
    console.log('Current pair codes:', Array.from(this.pairCodes.entries()));
  }

  getUserByPairCode(code: string): string | undefined {
    console.log('Looking for code:', code);
    console.log('Available codes:', Array.from(this.pairCodes.entries()));
    return this.pairCodes.get(code);
  }

  clearPairCode(code: string): void {
    this.pairCodes.delete(code);
    this.saveData();
  }
}

// Exporta una instancia de SimpleDB
export const db = new SimpleDB();