const fs = require('fs').promises;
const { parse } = require('csv-parse');
const moment = require('moment');

class CSVHandler {
  constructor(filePath) {
    this.filePath = filePath;
    this.duplicates = new Set();
    this.expectedHeaders = ['OpID', 'Operator', 'TollID', 'Name', 'PM', 'Locality', 'Road', 'Lat', 'Long', 'Email', 'Price1'];
  }

  validateHeaders(headers) {
    const missing = this.expectedHeaders.filter(h => !headers.includes(h));
    if (missing.length > 0) {
      throw new Error(`Missing required headers: ${missing.join(', ')}`);
    }
    return true;
  }

  validateRecord(record) {
    try {
      // Validate OpID (2-3 uppercase letters)
      if (!/^[A-Z]{2,3}$/.test(record.OpID)) {
        return { valid: false, error: 'Invalid OpID format' };
      }

      // Validate TollID (2-3 letters followed by 2 digits)
      if (!/^[A-Z]{2,3}\d{2}$/.test(record.TollID)) {
        return { valid: false, error: 'Invalid TollID format' };
      }

      // Validate Price1 is numeric and positive
      const price = parseFloat(record.Price1);
      if (isNaN(price) || price <= 0) {
        return { valid: false, error: 'Price must be a positive number' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async readCSV() {
    try {
      console.log('Reading file:', this.filePath);
      const fileContent = await fs.readFile(this.filePath, 'utf-8');
      const allLines = fileContent.split('\n');
      
      // Remove empty lines from the end of the file
      const lines = allLines.filter(line => line.trim());
      
      console.log(`Total lines in file (including header): ${lines.length}`);
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }
      
      const headers = lines[0].trim().split(',');
      console.log('Headers:', headers);
      
      const records = [];
      let malformedLines = 0;
      let invalidRecords = 0;
      let processedLines = 0;
      
      // Start from line 1 (after header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) {
          continue; // Skip empty lines
        }
        
        const values = line.split(',');
        
        if (values.length !== headers.length) {
          console.log(`Line ${i + 1} has ${values.length} values but expected ${headers.length}, skipping:`, line);
          malformedLines++;
          continue;
        }
        
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = values[j];
        }

        // Validate record format
        const validation = this.validateRecord(record);
        if (!validation.valid) {
          console.log(`Line ${i + 1} validation failed:`, validation.error);
          invalidRecords++;
          continue;
        }
        
        processedLines++;
        records.push(record);
      }
      
      console.log('\nCSV Processing Summary:');
      console.log(`- Total lines in file: ${lines.length}`);
      console.log(`- Header line: 1`);
      console.log(`- Data lines: ${lines.length - 1}`);
      console.log(`- Malformed lines: ${malformedLines}`);
      console.log(`- Invalid records: ${invalidRecords}`);
      console.log(`- Successfully processed lines: ${processedLines}`);
      console.log(`- Total valid records: ${records.length}`);
      
      return records;
    } catch (error) {
      throw new Error(`Failed to read CSV: ${error.message}`);
    }
  }

  checkDuplicates(records) {
    const seen = new Set();
    this.duplicates.clear();
    
    records.forEach(record => {
      const key = JSON.stringify(record);
      if (seen.has(key)) {
        this.duplicates.add(key);
      }
      seen.add(key);
    });

    return this.duplicates.size === 0;
  }

  getDuplicates() {
    return Array.from(this.duplicates);
  }

  async process() {
    try {
      const records = await this.readCSV();
      const hasDuplicates = !this.checkDuplicates(records);

      if (hasDuplicates) {
        return {
          success: false,
          error: 'Duplicate entries found',
          duplicates: this.getDuplicates()
        };
      }

      return {
        success: true,
        data: records
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CSVHandler; 