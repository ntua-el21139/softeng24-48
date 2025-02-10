const fs = require('fs').promises;
const { parse } = require('csv-parse');

class CSVHandler {
  constructor(filePath, type) {
    this.filePath = filePath;
    this.duplicates = new Set();
    this.malformedLines = 0;
    this.type = type; // 'passes' or 'tolls'
    
    // Define expected columns for each type
    this.expectedColumns = {
      passes: ['timestamp', 'tollID', 'tagRef', 'tagHomeID', 'charge'],
      tolls: ['OpID', 'Operator', 'TollID', 'Name', 'PM', 'Locality', 'Road', 'Lat', 'Long', 'Email', 'Price2']
    };
  }

  isCSVFile() {
    // Check file extension
    return this.filePath.toLowerCase().endsWith('.csv');
  }

  validateHeaders(headers) {
    if (!this.type || !this.expectedColumns[this.type]) {
      throw new Error('Invalid or missing data type');
    }

    const expected = this.expectedColumns[this.type];
    const missing = expected.filter(col => !headers.includes(col));
    const extra = headers.filter(col => !expected.includes(col));

    if (missing.length > 0 || extra.length > 0) {
      let error = 'Invalid CSV structure:';
      if (missing.length > 0) {
        error += `\nMissing columns: ${missing.join(', ')}`;
      }
      if (extra.length > 0) {
        error += `\nUnexpected columns: ${extra.join(', ')}`;
      }
      throw new Error(error);
    }

    return true;
  }

  async readCSV() {
    try {
      // First check if it's a CSV file
      if (!this.isCSVFile()) {
        throw new Error('File must be a CSV file');
      }

      console.log('Reading file:', this.filePath);
      const fileContent = await fs.readFile(this.filePath, 'utf-8');
      
      // Basic CSV structure validation
      if (!fileContent.includes(',')) {
        throw new Error('File does not appear to be a valid CSV (no commas found)');
      }

      const allLines = fileContent.split('\n');
      
      // Remove empty lines from the end of the file
      const lines = allLines.filter(line => line.trim());
      
      console.log(`Total lines in file (including header): ${lines.length}`);
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }
      
      const headers = lines[0].trim().split(',');
      console.log('Headers:', headers);
      
      // Validate headers
      this.validateHeaders(headers);
      
      const records = [];
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
          this.malformedLines++;
          continue;
        }
        
        const record = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = values[j];
        }
        
        processedLines++;
        records.push(record);
      }
      
      console.log('\nCSV Processing Summary:');
      console.log(`- Total lines in file: ${lines.length}`);
      console.log(`- Header line: 1`);
      console.log(`- Data lines: ${lines.length - 1}`);
      console.log(`- Malformed lines: ${this.malformedLines}`);
      console.log(`- Successfully processed lines: ${processedLines}`);
      console.log(`- Total valid records: ${records.length}`);
      
      if (records.length !== lines.length - 1 - this.malformedLines) {
        console.log('\nWARNING: Record count mismatch!');
        console.log(`Expected ${lines.length - 1 - this.malformedLines} records but got ${records.length}`);
      }
      
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
      
      // Check if we had any malformed lines
      if (this.malformedLines > 0) {
        return {
          success: false,
          error: `File contains ${this.malformedLines} malformed lines`,
          malformedCount: this.malformedLines
        };
      }

      // Check duplicates
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