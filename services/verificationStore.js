import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/store.json');

// Initialize Stores from File
let verificationStore = new Map();
let vendorStore = new Map();

const loadData = () => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            const data = JSON.parse(raw);

            // Hydrate Maps
            if (data.vendors) {
                vendorStore = new Map(data.vendors.map(v => [v.id, v]));
            }
            if (data.certificates) {
                verificationStore = new Map(data.certificates.map(c => [c.id, c]));
            }
            console.log(`[Store] Loaded ${vendorStore.size} vendors and ${verificationStore.size} certificates.`);
        } else {
            // Create file if not exists
            saveData();
        }
    } catch (err) {
        console.error("[Store] Failed to load data:", err);
    }
};

const saveData = () => {
    try {
        const data = {
            vendors: Array.from(vendorStore.values()),
            certificates: Array.from(verificationStore.values())
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("[Store] Failed to save data:", err);
    }
};

// Load on startup
loadData();

export const saveCertificate = (data) => {
    const id = Math.random().toString(36).substr(2, 9); // Simple ID generation
    const timestamp = new Date().toISOString();

    const certificate = {
        id,
        timestamp,
        ...data
    };

    verificationStore.set(id, certificate);
    saveData(); // Persist
    return certificate;
};

export const getCertificate = (id) => {
    return verificationStore.get(id);
};

// Vendor Methods
export const saveVendor = (id, data) => {
    vendorStore.set(id, data);
    saveData(); // Persist
};

export const getVendorById = (id) => {
    return vendorStore.get(id);
};

export const getAllVendors = () => {
    return Array.from(vendorStore.values());
};

// Transactions (Mock)
export const saveTransaction = (transaction) => {
    // In a real app, save to DB
    console.log("Transaction Saved:", transaction.id);
};

