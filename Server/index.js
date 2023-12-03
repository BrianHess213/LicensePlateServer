// After Change!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",newItemNumber);

  // After processing, fetch the updated data from the database.
  try {
    const updatedData = await getDataFromDatabase({"Item_Name": newItemNumber});
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
    const query = !isNaN(itemNumber) ? {Item_Name: itemNumber} : {Item_Name: rawItemNumber};

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