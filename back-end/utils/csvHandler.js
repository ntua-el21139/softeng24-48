const fs = require('fs').promises;
const { parse } = require('csv-parse');
const DBHandler = require('./dbHandler');

class CSVHandler {
  constructor(filePath) {
    this.filePath = filePath;
    this.duplicates = new Set();
    // Define the two valid header formats
    this.validHeaderFormats = {
      passes: ['timestamp', 'tollID', 'tagRef', 'tagHomeID', 'charge'],
      stations: ['OpID', 'Operator', 'TollID', 'Name', 'PM', 'Locality', 'Road', 'Lat', 'Long', 'Email', 'Price1', 'Price2', 'Price3', 'Price4']
    };
  }

  validateHeaders(headers) {
    // Convert headers to lowercase for case-insensitive comparison
    const normalizedHeaders = headers.map(h => h.trim());
    
    // Check if headers match either of the valid formats
    const isPassesFormat = JSON.stringify(normalizedHeaders) === JSON.stringify(this.validHeaderFormats.passes);
    const isStationsFormat = JSON.stringify(normalizedHeaders) === JSON.stringify(this.validHeaderFormats.stations);
    
    if (!isPassesFormat && !isStationsFormat) {
      throw new Error('Invalid CSV format. File must be either a passes file (timestamp, tollID, tagRef, tagHomeID, charge) or a stations file (OpID, Operator, TollID, Name, PM, Locality, Road, Lat, Long, Email, Price1, Price2, Price3, Price4)');
    }
    
    return isPassesFormat ? 'passes' : 'stations';
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
      
      // Validate the headers format
      const fileType = this.validateHeaders(headers);
      console.log('File type detected:', fileType);
      
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
      console.log(`- File type: ${fileType}`);
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
      
      return {
        type: fileType,
        records: records
      };
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

  async validateCharges(records) {
    const dbHandler = new DBHandler();
    try {
      await dbHandler.connect();

      // Extract unique toll IDs from records
      const tollIds = [...new Set(records.map(record => record.tollID))];
      
      // Get prices for all toll stations in one query
      const query = `
        SELECT toll_id, price 
        FROM Tolls 
        WHERE toll_id IN (${'?,'.repeat(tollIds.length).slice(0, -1)})
      `;
      
      const [tollPrices] = await dbHandler.connection.execute(query, tollIds);
      
      // Create a map for quick price lookup
      const priceMap = {};
      tollPrices.forEach(row => {
        priceMap[row.toll_id] = row.price;
      });

      // Check each record's charge against the stored price
      const invalidCharges = [];
      records.forEach((record, index) => {
        const storedPrice = priceMap[record.tollID];
        const passCharge = parseFloat(record.charge);
        
        if (storedPrice === undefined) {
          invalidCharges.push({
            line: index + 2, // +2 because index starts at 0 and we skip header
            tollID: record.tollID,
            error: 'Toll station not found'
          });
        } else if (Math.abs(storedPrice - passCharge) > 0.01) { // Using small epsilon for float comparison
          invalidCharges.push({
            line: index + 2,
            tollID: record.tollID,
            expectedCharge: storedPrice,
            actualCharge: passCharge
          });
        }
      });

      return {
        isValid: invalidCharges.length === 0,
        invalidCharges
      };
    } finally {
      await dbHandler.disconnect();
    }
  }

  async validateTagHomeIDs(records) {
    const dbHandler = new DBHandler();
    try {
      await dbHandler.connect();

      // Check each record's tagHomeID individually
      const invalidTagHomeIDs = [];
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        // Query to check if this specific tagHomeID exists as an operator_id
        const query = `
          SELECT operator_id 
          FROM Tolls 
          WHERE operator_id = ?
          LIMIT 1
        `;
        
        const [result] = await dbHandler.connection.execute(query, [record.tagHomeID]);
        
        if (result.length === 0) {
          invalidTagHomeIDs.push({
            line: i + 2, // +2 because index starts at 0 and we skip header
            tagHomeID: record.tagHomeID,
            error: 'Tag home ID does not match any operator ID in the system'
          });
        }
      }

      return {
        isValid: invalidTagHomeIDs.length === 0,
        invalidTagHomeIDs
      };
    } finally {
      await dbHandler.disconnect();
    }
  }

  async process() {
    try {
      const { type, records } = await this.readCSV();
      
      // Only validate charges and tagHomeIDs for passes type
      if (type === 'passes') {
        // Validate charges
        const chargeValidation = await this.validateCharges(records);
        if (!chargeValidation.isValid) {
          return {
            success: false,
            error: 'Invalid charges detected',
            details: chargeValidation.invalidCharges.map(invalid => 
              invalid.error 
                ? `Line ${invalid.line}: ${invalid.tollID} - ${invalid.error}`
                : `Line ${invalid.line}: ${invalid.tollID} - Expected charge ${invalid.expectedCharge} but got ${invalid.actualCharge}`
            )
          };
        }

        // Validate tagHomeIDs
        const tagHomeValidation = await this.validateTagHomeIDs(records);
        if (!tagHomeValidation.isValid) {
          return {
            success: false,
            error: 'Invalid tag home IDs detected',
            details: tagHomeValidation.invalidTagHomeIDs.map(invalid => 
              `Line ${invalid.line}: ${invalid.tagHomeID} - ${invalid.error}`
            )
          };
        }
      }

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
        type: type,
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