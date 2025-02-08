const CSVHandler = require('./csvHandler');
const DBHandler = require('./dbHandler');

// CSV file paths
const TOLL_STATIONS_CSV = 'csv_templates/tollstations2024.csv';
const PASSES_CSV = 'csv_templates/passes-sample.csv';

async function loadTollStations() {
  const csvHandler = new CSVHandler(TOLL_STATIONS_CSV);
  const dbHandler = new DBHandler();

  try {
    console.log('Reading toll stations CSV file...');
    const csvResult = await csvHandler.process();
    if (!csvResult.success) {
      console.error('CSV Error:', csvResult.error);
      return;
    }
    console.log(`Found ${csvResult.data.length} toll stations to insert`);

    console.log('Connecting to database...');
    await dbHandler.connect();

    console.log('Inserting toll stations...');
    const dbResult = await dbHandler.insertTolls(csvResult.data);
    console.log('Database:', dbResult.message);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await dbHandler.disconnect();
  }
}

async function loadPasses() {
  const csvHandler = new CSVHandler(PASSES_CSV);
  const dbHandler = new DBHandler();

  try {
    console.log('Reading passes CSV file...');
    const csvResult = await csvHandler.process();
    if (!csvResult.success) {
      console.error('CSV Error:', csvResult.error);
      return;
    }
    console.log(`Found ${csvResult.data.length} passes to insert`);

    console.log('Connecting to database...');
    await dbHandler.connect();

    console.log('Inserting passes...');
    const dbResult = await dbHandler.insertPasses(csvResult.data);
    console.log('Database:', dbResult.message);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await dbHandler.disconnect();
  }
}

// Command line argument to determine which data to load
const dataType = process.argv[2];

if (dataType === 'tolls') {
  loadTollStations();
} else if (dataType === 'passes') {
  loadPasses();
} else {
  console.log('Please specify data type: node loadData.js [tolls|passes]');
} 