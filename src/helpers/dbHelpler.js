// database.js - Full Code (Copy and Paste)

import { Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { Utils } from './utils'; // Ensure you have utils.js in the same directory

const DATABASE_NAME = 'leadsApp.db';
const CURRENT_VERSION = 1;
SQLite.enablePromise(true);

let dbInstance = null;

const openDatabase = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await SQLite.openDatabase(
      DATABASE_NAME,
      CURRENT_VERSION,
      'Leads Database',
      200000,
    );
    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT,
        lead_id TEXT,
        user_id TEXT, 
        loc_id TEXT,
        uname TEXT,
        location TEXT,
        label TEXT,
        value TEXT,
        create_time TEXT,
        sync_time TEXT,
        isSync BOOLEAN,
        isFileSync BOOLEAN DEFAULT 0
      );
    `);

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        desc TEXT,
        info1 TEXT,
        info2 TEXT,
        time TEXT
      );
    `);

    return dbInstance;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

async function executeSQL(query, params = []) {
  const db = await openDatabase();
  try {
    const [result] = await db.executeSql(query, params);
    return result.rows.raw();
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

export async function insertRecord(record) {
  try {
    const { userId, locationId, username, location, label, value } = record;
    const localId = Utils.generateFormatted128BitId();
    await executeSQL(
      `INSERT INTO leads (id,user_id,loc_id,uname,location,label,value,create_time,isSync, isFileSync) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        localId,
        userId,
        locationId,
        username,
        location,
        JSON.stringify(label),
        JSON.stringify(value),
        Date.now(),
        0,
        Utils.totalIsSyncZeroCount(value) === 0 ? 1 : 0,
      ],
    );
    return localId;
  } catch (error) {
    console.error('Error inserting record:', error);
    throw error;
  }
}

export async function getAllLeadsSyncTrue(isSuperAdmin, userId) {
  try {
    const query = isSuperAdmin
      ? 'SELECT * FROM leads WHERE isSync = 1 AND isFileSync= 1;'
      : 'SELECT * FROM leads WHERE isSync = 1 AND isFileSync= 1 AND user_id = ?;';
    const params = isSuperAdmin ? [] : [userId];
    const result = await executeSQL(query, params);
    return result;
  } catch (e) {
    Alert.alert(e.message);
  }
}

export async function getAllLeadsSyncFalse(isSuperAdmin, userId) {
  try {
    const query = isSuperAdmin
      ? 'SELECT * FROM leads WHERE isSync = 0 OR isFileSync= 0;'
      : 'SELECT * FROM leads WHERE isSync = 0 OR isFileSync= 0 AND user_id = ?;';
    const params = isSuperAdmin ? [] : [userId];
    const result = await executeSQL(query, params);
    return result;
  } catch (e) {
    Alert.alert(e.message);
  }
}

export async function getAttachmentLeads(isSuperAdmin, userId) {
  try {
    const query = isSuperAdmin
      ? 'SELECT * FROM leads WHERE isFileSync= 0;'
      : 'SELECT * FROM leads WHERE isFileSync= 0 AND user_id = ?;';
    const params = isSuperAdmin ? [] : [userId];
    const result = await executeSQL(query, params);
    return result;
  } catch (e) {
    Alert.alert(e.message);
  }
}

export async function getAllLeadsTextSyncFalse(isSuperAdmin, userId) {
  try {
    const query = isSuperAdmin
      ? 'SELECT * FROM leads WHERE isSync = 0'
      : 'SELECT * FROM leads WHERE isSync = 0 AND user_id = ?;';
    const params = isSuperAdmin ? [] : [userId];
    const result = await executeSQL(query, params);
    return result;
  } catch (e) {
    Alert.alert(e.message);
  }
}

export async function deleteAllLeads() {
  try {
    const result = await executeSQL('DELETE  FROM leads');
    return result.rowsAffected;
  } catch (error) {
    console.error('error deleting all leads', error);
    return 0;
  }
}

export async function deleteAllLeadsSyncFalse() {
  try {
    const result = await executeSQL(
      'DELETE  FROM leads WHERE isSync = 0 OR isFileSync = 0;',
    );
    return result.rowsAffected;
  } catch (error) {
    console.error('error deleting all leads sync false', error);
    return 0;
  }
}

export async function deleteAllLeadsSyncTrue() {
  try {
    const result = await executeSQL('DELETE  FROM leads WHERE isSync = 1;');
    return result.rowsAffected;
  } catch (error) {
    console.error('error deleting all leads sync true', error);
    return 0;
  }
}

export async function deleteSingleLead(id) {
  try {
    const result = await executeSQL(`DELETE  FROM leads WHERE id = ${id};`);
    return result.rowsAffected;
  } catch (error) {
    console.error('error deleting single lead', error);
    return 0;
  }
}

export async function getRecordById(id) {
  try {
    const result = await executeSQL('SELECT * FROM leads WHERE id = ?;', [id]);
    return result;
  } catch (error) {
    console.error('error getting record by id', error);
    return [];
  }
}

export async function updateSyncFileStatus(id, newStatus) {
  try {
    const result = await executeSQL(
      'UPDATE leads SET isFileSync = ? WHERE id = ?;',
      [newStatus === true ? 1 : 0, id],
    );
    return result.rowsAffected;
  } catch (error) {
    console.error('error updating sync file status', error);
    return 0;
  }
}

export async function updateSyncFileStatusWithData(id, data, newStatus) {
  try {
    const result = await executeSQL(
      'UPDATE leads SET isFileSync = ?, value = ?, isSync = 1  WHERE id = ?;',
      [newStatus === true ? 1 : 0, JSON.stringify(data), id],
    );
    return result.rowsAffected;
  } catch (error) {
    console.error('error updating sync file status with data', error);
    return 0;
  }
}

export async function updateFileData(id, data) {
  try {
    const result = await executeSQL(
      'UPDATE leads SET value = ? WHERE id = ?;',
      [JSON.stringify(data), id],
    );
    return result.rowsAffected;
  } catch (error) {
    console.error('error updating file data', error);
    return 0;
  }
}

export async function updateSyncStatus(leadId, id, newStatus, value) {
  try {
    const urlSync = Utils.totalIsSyncZeroCount(value) === 0;
    const result = await executeSQL(
      'UPDATE leads SET isSync = ?, isFileSync = ? , sync_time = ?, lead_id = ?, value = ? WHERE id = ?;',
      [
        newStatus === true ? 1 : 0,
        urlSync === true ? 1 : 0,
        new Date().now,
        leadId,
        JSON.stringify(value),
        id,
      ],
    );
    return result.rowsAffected;
  } catch (error) {
    console.error('error updating sync status', error);
    return 0;
  }
}

export async function updateSyncStatusBatch(apiIds, localIds) {
  try {
    const placeholders = localIds.map(() => '?').join(',');
    const query = `
      UPDATE leads
      SET isSync = 1, sync_time = ?, lead_id = CASE id
      ${localIds.map((id, index) => 'WHEN ? THEN ?').join(' ')}
      END
      WHERE id IN (${placeholders});
    `;

    const params = [
      new Date().toISOString(),
      ...localIds.flatMap((id, index) => [id, apiIds[index]]),
      ...localIds,
    ];

    const result = await executeSQL(query, params);
    return result.rowsAffected;
  } catch (error) {
    console.error('Error updating sync status batch:', error);
    return 0;
  }
}

export async function insertLog(title, desc, info1, info2) {
  try {
    await executeSQL(
      'INSERT INTO logs (title, desc, info1, info2, time) VALUES (?, ?, ?, ?, ?);',
      [title, desc, info1, info2, new Date().toISOString()],
    );
  } catch (error) {
    console.error('Error inserting log:', error);
  }
}

export async function deleteLogById(id) {
  try {
    await executeSQL('DELETE FROM logs WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error deleting log:', error);
  }
}

export async function deleteAllLogs() {
  try {
    await executeSQL('DELETE FROM logs');
  } catch (error) {
    console.error('Error deleting logs:', error);
  }
}

export async function getLogs(offset, limit = 20) {
  try {
    const result = await executeSQL(
      'SELECT * FROM logs ORDER BY time DESC LIMIT ? OFFSET ?;',
      [limit, offset],
    );
    return result;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
}

export const closeDatabase = async () => {
  if (dbInstance) {
    try {
      await dbInstance.close();
      dbInstance = null;
    } catch (error) {
      console.error('error closing database', error);
    }
  }
};