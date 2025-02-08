const fs = require('fs').promises;
const { parse } = require('csv-parse');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

// Replace this path with your CSV file location
const csvFilePath = '../csv_templates/passes-sample.csv';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
};

async function loadCSV() {
  let connection;
  try {
    // Read the file
    const fileContent = await fs.readFile(csvFilePath);
    
    // Parse CSV and return promise
    const records = await new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, records) => {
        if (err) reject(err);
        resolve(records);
      });
    });

    // Check for duplicates
    const seen = new Set();
    const duplicates = new Set();
    
    records.forEach(record => {
      const key = JSON.stringify(record);
      if (seen.has(key)) {
        duplicates.add(key);
      }
      seen.add(key);
    });

    if (duplicates.size > 0) {
      console.log('Error: Found duplicate entries');
      return;
    }

    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    
    // Start transaction
    await connection.beginTransaction();

    // Insert records
    for (const record of records) {
      const columns = Object.keys(record);
      const values = Object.values(record);
      const placeholders = columns.map(() => '?').join(', ');
      
      const query = `INSERT INTO passes (${columns.join(', ')}) VALUES (${placeholders})`;
      await connection.execute(query, values);
    }

    // Commit transaction
    await connection.commit();
    console.log('Success: Data inserted into database');

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run immediately
loadCSV(); 