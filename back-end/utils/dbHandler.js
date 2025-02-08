const mysql = require('mysql2/promise');
const moment = require('moment');
const dbConfig = require('../config/database');

class DBHandler {
  constructor() {
    console.log('Using database configuration:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database
    });

    this.config = {
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    };
  }

  async connect() {
    try {
      console.log('Attempting to connect with config:', {
        host: this.config.host,
        user: this.config.user,
        database: this.config.database
      });
      
      this.connection = await mysql.createConnection(this.config);
      console.log('Database connection successful');
      return true;
    } catch (error) {
      console.error('Connection error details:', error);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
    }
  }

  async clearTolls() {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }
    try {
      await this.connection.execute('DELETE FROM Tolls');
    } catch (error) {
      throw new Error(`Failed to clear tolls table: ${error.message}`);
    }
  }

  formatTollRecord(record) {
    // Enhanced debugging
    console.log('Raw record:', record);
    console.log('Record keys:', Object.keys(record));
    console.log('Record entries:', Object.entries(record));
    console.log('First column value:', record[Object.keys(record)[0]]);
    
    // Try different possible case variations for the operator ID field
    const opId = record.OpID || record.opid || record.OPID || record.opID || record[Object.keys(record)[0]];
    console.log('OpID value:', opId);
    
    const formatted = {
      operator_id: opId,
      operator_name: record.Operator,
      toll_id: record.TollID,
      toll_name: record.Name,
      PM: record.PM,
      locality: record.Locality,
      road: record.Road,
      lat: record.Lat,
      longt: record.Long,
      email: record.Email,
      price: record.Price2 ? parseFloat(record.Price2) : 0.0
    };
    console.log('Formatted record:', JSON.stringify(formatted, null, 2));
    return formatted;
  }

  async formatPassRecord(record) {
    // First get the operator_id from Tolls table for this toll_id
    const [tollRows] = await this.connection.execute(
        'SELECT operator_id FROM Tolls WHERE toll_id = ?',
        [record.tollID]
    );
    
    const operator_id = tollRows.length > 0 ? tollRows[0].operator_id : null;
    
    console.log('Raw record in formatPassRecord:', record);
    const tag_id = record.tagRef;
    const tag_home_id = record.tagHomeID;
    const charge = parseFloat(record.charge);
    
    console.log('Raw timestamp:', record.timestamp);
    const timestamp = moment(record.timestamp, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss');
    console.log('Parsed timestamp:', timestamp);
    
    return {
        timestamp: timestamp,
        toll_id: record.tollID,
        tag_id: tag_id,
        tag_home_id: tag_home_id,
        operator_id: operator_id,  // Now using the operator_id from Tolls table
        charge: charge
    };
  }

  async insertTolls(records) {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }

    try {
      await this.connection.beginTransaction();
      
      await this.clearTolls();

      const query = `
        INSERT INTO Tolls 
        (operator_id, operator_name, toll_id, toll_name, PM, locality, road, lat, longt, email, price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (const record of records) {
        const formattedRecord = this.formatTollRecord(record);
        const values = [
          formattedRecord.operator_id || null,
          formattedRecord.operator_name || null,
          formattedRecord.toll_id || null,
          formattedRecord.toll_name || null,
          formattedRecord.PM || null,
          formattedRecord.locality || null,
          formattedRecord.road || null,
          formattedRecord.lat || null,
          formattedRecord.longt || null,
          formattedRecord.email || null,
          formattedRecord.price || null
        ];
        
        await this.connection.execute(query, values);
      }

      await this.connection.commit();
      return {
        success: true,
        message: `Successfully inserted ${records.length} toll stations`
      };
    } catch (error) {
      await this.connection.rollback();
      throw new Error(`Failed to insert toll stations: ${error.message}`);
    }
  }

  async insertPasses(records) {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }

    try {
      await this.connection.beginTransaction();

      const query = `
        INSERT INTO Passes 
        (timestamp, toll_id, tag_id, tag_home_id, operator_id, charge)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      for (const record of records) {
        const formattedRecord = await this.formatPassRecord(record);
        const values = [
          formattedRecord.timestamp,
          formattedRecord.toll_id,
          formattedRecord.tag_id,
          formattedRecord.tag_home_id,
          formattedRecord.operator_id,
          formattedRecord.charge
        ];
        
        await this.connection.execute(query, values);
      }

      await this.connection.commit();
      return {
        success: true,
        message: `Successfully inserted ${records.length} passes`
      };
    } catch (error) {
      await this.connection.rollback();
      throw new Error(`Failed to insert passes: ${error.message}`);
    }
  }
}

module.exports = DBHandler; 