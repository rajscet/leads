import {Alert} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import {Utils} from './utils';
const DATABASE_NAME = 'leadsApp.db';
const CURRENT_VERSION = 1; // Increment this value for new schema changes

SQLite.enablePromise(true);

//Open Database
const openDatabase = async () => {
  try {
    const db = await SQLite.openDatabase(
      DATABASE_NAME,
      CURRENT_VERSION,
      'Leads Database',
      200000,
    );
    await db.executeSql(`
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

    // Ensure the logs table exists without deleting existing data
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        desc TEXT,
        info1 TEXT,
        info2 TEXT,
        time TEXT
      );
    `);

    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
};

// Insert record
export async function insertRecord(record) {
  const db = await openDatabase();
  try {
    const {userId, locationId, username, location, label, value} = record;
    const localId=  Utils.generateFormatted128BitId();
    await executeSQL(
      db,
      `INSERT INTO leads (
       id,user_id,loc_id,uname,location,label,value,create_time,isSync, isFileSync
      ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        localId,
        userId,
        locationId,
        username,
        location,
        JSON.stringify(label),
        JSON.stringify(value),
        Date.now(),
        0, // Default isSync to false,
        Utils.totalIsSyncZeroCount(value) === 0 ? 1 : 0,
      ],
    );
    // const [queryResult] = await executeSQL(
    //   db,
    //   'SELECT last_insert_rowid() as id;',
    // );

    return localId;
  } catch (error) {
    console.error('Error inserting record:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Generic function to execute SQL
async function executeSQL(db, query, params = []) {
  try {
    const [result] = await db.executeSql(query, params);
    return result.rows.raw();
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

// Fetch all records where isSync is true
export async function getAllLeadsSyncTrue(isSuperAdmin, userId) {
  const db = await openDatabase();
  try {
    const query = isSuperAdmin
      ? 'SELECT * FROM leads WHERE isSync = 1 AND isFileSync= 1;'
      : 'SELECT * FROM leads WHERE isSync = 1 AND isFileSync= 1 AND user_id = ?;';
    const params = isSuperAdmin ? [] : [userId]; // Use parameters only if not a super admin
    const [result] = await db.executeSql(query, params);
    return result.rows.raw(); // Converts SQLite rows to a plain array
  } catch (e) {
    Alert.alert(e.message);
  } finally {
    db.close();
  }
}

// Fetch all records where isSync is false
export async function getAllLeadsSyncFalse(isSuperAdmin, userId) {
  const db = await openDatabase();
  try {
    const query = isSuperAdmin
      ? 'SELECT * FROM leads WHERE isSync = 0 OR isFileSync= 0;'
      : 'SELECT * FROM leads WHERE isSync = 0 OR isFileSync= 0 AND user_id = ?;';
    const params = isSuperAdmin ? [] : [userId]; // Use parameters only if not a super admin
    const [result] = await db.executeSql(query, params);
    return result.rows.raw(); // Converts SQLite rows to a plain array
  } catch (e) {
    Alert.alert(e.message);
  } finally {
    db.close();
  }
}

export async function getAttachmentLeads(isSuperAdmin, userId) {
  const db = await openDatabase();
  try {
    const query = isSuperAdmin
      ? 'SELECT * FROM leads WHERE isFileSync= 0;'
      : 'SELECT * FROM leads WHERE isFileSync= 0 AND user_id = ?;';
    const params = isSuperAdmin ? [] : [userId]; // Use parameters only if not a super admin
    const [result] = await db.executeSql(query, params);
    return result.rows.raw(); // Converts SQLite rows to a plain array
  } catch (e) {
    Alert.alert(e.message);
  } finally {
    db.close();
  }
}

export async function getAllLeadsTextSyncFalse(isSuperAdmin, userId) {
  const db = await openDatabase();
  try {
    const query = isSuperAdmin
      ? 'SELECT * FROM leads WHERE isSync = 0'
      : 'SELECT * FROM leads WHERE isSync = 0 AND user_id = ?;';
    const params = isSuperAdmin ? [] : [userId]; // Use parameters only if not a super admin
    const [result] = await db.executeSql(query, params);
    return result.rows.raw(); // Converts SQLite rows to a plain array
  } catch (e) {
    Alert.alert(e.message);
  } finally {
    db.close();
  }
}

// Delete all records
export async function deleteAllLeads() {
  const db = await openDatabase();
  try {
    const result = await executeSQL(db, 'DELETE  FROM leads');
    return result.rowsAffected;
  } finally {
    db.close();
  }
}

//

export async function deleteAllLeadsSyncFalse() {
  const db = await openDatabase();
  try {
    const result = await executeSQL(
      db,
      'DELETE  FROM leads WHERE isSync = 0 OR isFileSync = 0;',
    );
    return result.rowsAffected;
  } finally {
    db.close();
  }
}

export async function deleteAllLeadsSyncTrue() {
  const db = await openDatabase();
  try {
    const result = await executeSQL(db, 'DELETE  FROM leads WHERE isSync = 1;');
    return result.rowsAffected;
  } finally {
    db.close();
  }
}

export async function deleteSingleLead(id) {
  const db = await openDatabase();
  try {
    const result = await executeSQL(db, `DELETE  FROM leads WHERE id = ${id};`);
    return result.rowsAffected;
  } finally {
    db.close();
  }
}

// Fetch record by ID
export async function getRecordById(id) {
  const db = await openDatabase();
  try {
    const result = await executeSQL(db, 'SELECT * FROM leads WHERE id = ?;', [
      id,
    ]);
    return result;
  } finally {
    db.close();
  }
}

export async function updateSyncFileStatus(id,data,newStatus) {
  const db = await openDatabase();
  try {
    const result = await executeSQL(
      db,
      'UPDATE leads SET isFileSync = ? WHERE id = ?;',
      [newStatus === true ? 1 : 0, id],
    );
    console.log('update result', result);
    return result.rowsAffected;
  } finally {
    db.close();
  }
}

export async function updateSyncFileStatusWithData(id, data, newStatus) {
  const db = await openDatabase();
  try {
    const result = await executeSQL(
      db,
      'UPDATE leads SET isFileSync = ?, value = ?, isSync = 1  WHERE id = ?;',
      [newStatus === true ? 1 : 0, JSON.stringify(data),id],
    );
    return result.rowsAffected;
  } finally {
    db.close();
  }
}

export async function updateFileData(id, data) {
  const db = await openDatabase();
  try {
    const result = await executeSQL(
      db,
      'UPDATE leads SET value = ? WHERE id = ?;',
      [JSON.stringify(data), id],
    );
    console.log('update result', result);
    return result.rowsAffected;
  } finally {
    db.close();
  }
}

// Update isSync status
export async function updateSyncStatus(leadId, id, newStatus, value) {
  const db = await openDatabase();
  try {
    console.log('value', value);
    const urlSync = Utils.totalIsSyncZeroCount(value) === 0;
    console.log('urlSync', urlSync);
    const result = await executeSQL(
      db,
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
    console.log('update result', result);
    return result.rowsAffected;
  } finally {
    db.close();
  }
}

export async function updateSyncStatusBatch(apiIds, localIds) {
  const db = await openDatabase();
  try {
    // Construct the query
    const placeholders = localIds.map(() => '?').join(',');
    const query = `
      UPDATE leads
      SET isSync = 1, sync_time = ?, lead_id = CASE id
      ${localIds.map((id, index) => 'WHEN ? THEN ?').join(' ')}
      END
      WHERE id IN (${placeholders});
    `;

    // Build the parameter list
    const params = [
      new Date().toISOString(),
      ...localIds.flatMap((id, index) => [id, apiIds[index]]), // CASE parameters
      ...localIds, // IN clause parameters
    ];

    // Execute the query
    const result = await executeSQL(db, query, params);
    console.log('updateSyncStatusBatch result', result);
    return result.rowsAffected;
  } catch (error) {
    console.error('Error updating sync status batch:', error);
  } finally {
    db.close();
  }
}

// Insert record into logs
export async function insertLog(title, desc, info1, info2) {
  const db = await openDatabase();
  try {
    await db.executeSql(
      'INSERT INTO logs (title, desc, info1, info2, time) VALUES (?, ?, ?, ?, ?);',
      [title, desc, info1, info2, new Date().toISOString()],
    );
  } catch (error) {
    console.error('Error inserting log:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Delete log by ID
export async function deleteLogById(id) {
  const db = await openDatabase();
  try {
    await db.executeSql('DELETE FROM logs WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error deleting log:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Delete log by ID
export async function deleteAllLogs() {
  const db = await openDatabase();
  try {
    await db.executeSql('DELETE FROM logs');
  } catch (error) {
    console.error('Error deleting log:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Fetch logs with pagination
export async function getLogs(offset, limit = 20) {
  const db = await openDatabase();
  try {
    const result = await executeSQL(
      db,
      'SELECT * FROM logs ORDER BY time DESC LIMIT ? OFFSET ?;',
      [limit, offset],
    );
    return result;
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Initialize database on module load
// (async () => {
//   await initializeDatabase();
// })();
