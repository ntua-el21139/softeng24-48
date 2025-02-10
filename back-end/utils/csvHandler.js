const fs = require('fs').promises;
const { parse } = require('csv-parse');

class CSVHandler {
  constructor(filePath) {
    this.filePath = filePath;
    this.duplicates = new Set();
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
        
        processedLines++;
        records.push(record);
      }
      
      console.log('\nCSV Processing Summary:');
      console.log(`- Total lines in file: ${lines.length}`);
      console.log(`- Header line: 1`);
      console.log(`- Data lines: ${lines.length - 1}`);
      console.log(`- Malformed lines: ${malformedLines}`);
      console.log(`- Successfully processed lines: ${processedLines}`);
      console.log(`- Total valid records: ${records.length}`);
      
      if (records.length !== lines.length - 1 - malformedLines) {
        console.log('\nWARNING: Record count mismatch!');
        console.log(`Expected ${lines.length - 1 - malformedLines} records but got ${records.length}`);
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