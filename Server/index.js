const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
require('dotenv').config();

const allowedOrigins = [
'https://license-plate-git-main-brianhess213.vercel.app',
'https://license-plate-9vtx6m3s0-brianhess213.vercel.app',
'https://license-plate-client.vercel.app/',
'https://license-plate-client-aahhrh9er-brianhess213.vercel.app',
'https://license-plate-client-git-main-brianhess213.vercel.app',
'http://localhost:3000',
'http://localhost:3001',
'https://licenseplate-server.onrender.com/']; // Add allowed origins here

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // If your frontend needs to send credentials
};

const app = express();
const PORT = process.env.PORT;


// Middleware
app.use(cors(corsOptions));
app.use((error, req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // or set to specific domains 
  res.status(500).json({ error: 'Internal Server Error' });
});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send({ title: 'Hello!' });
});




// Global MongoClient variable
let client;

// Database initialization
async function initializeDatabase() {
  const url = process.env.MONGODB_URL;
  client = new MongoClient(url);
  await client.connect();
}

// Getting data from the database
async function getDataFromDatabase(query) {
  const dbName = "ItemSKU";
  const collectionName = "Items";

  try {
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    const result = await collection.findOne(query);
    return result;
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// POST /getData route to receive new data and respond
app.post('/updateItemData', async (req, res) => {
  console.log('Received request for /updateItemData', req.body);
  
  const newItemNumber = req.body.newItemNumber;
  // Process the new data as needed, e.g. add to the database.

  // After processing, fetch the updated data from the database.
  try {
    const updatedData = await getDataFromDatabase({"Case_GTIN": newItemNumber});
    res.json({ message: "Item number updated", updatedData: updatedData });
    console.log('Updated data:', updatedData);
  } catch (error) {
    res.status(500).send('Error fetching updated data.');
  }
});

// GET /getData route to send back data for a specific item
app.get('/getData', async (req, res) => {
  const rawItemNumber = req.query.itemNumber;
  const itemNumber = parseInt(rawItemNumber, 10);

  console.log("Type:", typeof rawItemNumber, "Value:", rawItemNumber);
  console.log("Parsed Type:", typeof itemNumber, "Parsed Value:", itemNumber);

  try {
    // Conditionally build query based on whether the parsed itemNumber is NaN
    const query = !isNaN(itemNumber) ? {Case_GTIN: itemNumber} : {Case_GTIN: rawItemNumber};

    const data = await getDataFromDatabase(query);
    if (data) {
      res.json(data); // Send the data if found
    } else {
      res.status(404).send('Item not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data.');
  }
});

// Start server and database initialization
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  initializeDatabase()
    .then(() => console.log("Database connected."))
    .catch((error) => console.error(`Failed to connect to the database: ${error}`));
});