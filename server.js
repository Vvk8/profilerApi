const http = require('http');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const hostname = 'localhost';
const port = 4000;

const mongoURI = 'mongodb+srv://admin:admin@database.uotiioo.mongodb.net/profiler?retryWrites=true&w=majority';
const dbName = 'profiler';
const collectionName = 'userdetails';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// POST API to store personal, qualifications, and experience infos...................................
app.post('/api/userdetails/adduser', async (req, res) => {
    const { firstName, lastName, email, phoneNumber, qualifications, experience } = req.body;

    // Unique id generation for the users......................
    const id = generateUniqueId(firstName);

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Create a document with personal , qualifications, and experience info
        const document = {
            id,
            firstName,
            lastName,
            email,
            phoneNumber,
            qualifications,
            experience
        };

        // Insert the document into the MongoDB collection
        await collection.insertOne(document);

        res.json({ message: 'Data stored in MongoDB' });
    } catch (err) {
        console.error('Failed to connect to MongoDB or insert data:', err);
        res.status(500).json({ message: 'Failed to store data in MongoDB' });
    }
});

// GETALL API to retrieve personal information, qualifications, and experience
app.get('/api/userdetails/viewall', async (req, res) => {
    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Retrieve all documents from the MongoDB collection
        const documents = await collection.find({}).toArray();

        if (documents.length > 0) {
            res.json(documents);
        } else {
            res.status(404).json({ message: 'No data found' });
        }
    } catch (err) {
        console.error('Failed to connect to MongoDB or retrieve data:', err);
        res.status(500).json({ message: 'Failed to retrieve data from MongoDB' });
    }
});


// GET API to view personal, qualifications & experience info
app.get('/api/userdetails/viewby/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // view the doc by using the given id
        const document = await collection.findOne({ id });

        if (document) {
            res.json(document);
        } else {
            res.status(404).json({ message: 'Data not found' });
        }
    } catch (err) {
        console.error('Failed to connect to MongoDB or retrieve data:', err);
        res.status(500).json({ message: 'Failed to retrieve data from MongoDB' });
    }
});

// PUT API to update personal, qualifications & experience info
app.put('/api/userdetails/updateby/:id', async (req, res) => {
    const id = req.params.id;
    const updatedFields = req.body;

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Retrieve existing document from MongoDB collection
        const existingDoc = await collection.findOne({ id });

        // update object only to include provided fields with non-null values
        const updateObject = {};
        for (const [key, value] of Object.entries(updatedFields)) {
            if (value !== null && existingDoc.hasOwnProperty(key)) {
                updateObject[key] = value;
            }
        }

        // Update the doc with the given id in mongodb
        await collection.updateOne({ id }, { $set: updateObject });

        res.json({ message: 'Data updated in MongoDB' });
    } catch (err) {
        console.error('Failed to connect to MongoDB or update data:', err);
        res.status(500).json({ message: 'Failed to update data in MongoDB' });
    }
});

//Delete All personal, qualifications, and experience infos...................................
app.delete('/api/userdetails/removeall', async (req, res) => {
    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Delete all documents from the MongoDB collection
        await collection.deleteMany({});

        res.json({ message: 'All documents deleted from MongoDB' });
    } catch (err) {
        console.error('Failed to connect to MongoDB or delete documents:', err);
        res.status(500).json({ message: 'Failed to delete documents from MongoDB' });
    }
});



//PErsonal Infos
// GET API to view personal infos.........................
app.get('/api/userdetails/viewpersonalinfo/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Find the document with the given ID in the MongoDB collection
        const user = await collection.findOne({ id });

        if (user) {
            const { firstName, lastName, email, phoneNumber } = user;
            res.json({ firstName, lastName, email, phoneNumber });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Failed to connect to MongoDB or retrieve personal information:', err);
        res.status(500).json({ message: 'Failed to retrieve personal information from MongoDB' });
    }
});

// POST API to add personal infos.........................
app.post('/api/userdetails/addpersonalinfo/:id', async (req, res) => {
    const id = req.params.id;
    const { firstName, lastName, email, phoneNumber } = req.body;

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Update personal information in the document with the given ID in the MongoDB collection
        await collection.updateOne(
            { id },
            { $set: { firstName, lastName, email, phoneNumber } }
        );

        res.json({ message: 'Personal information updated in MongoDB' });
    } catch (err) {
        console.error('Failed to connect to MongoDB or update personal information:', err);
        res.status(500).json({ message: 'Failed to update personal information in MongoDB' });
    }
});

// DELETE API to remove personal info 
app.delete('/api/userdetails/removepersonalinfo/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Remove specified fields from the document with the given ID in the MongoDB collection
        await collection.updateOne({ id }, {
            $unset: {
                firstName: 1,
                lastName: 1,
                email: 1,
                phoneNumber: 1
            }
        });

        res.json({ message: 'Personal Info deleted from MongoDB' });
    } catch (err) {
        console.error('Failed to connect to MongoDB or delete Personal Info:', err);
        res.status(500).json({ message: 'Failed to delete Personal Info from MongoDB' });
    }
});

//Qualifications
// GET API to view qualifications
app.get('/api/userdetails/viewqualifications/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Find the document with the given ID in the MongoDB collection
        const user = await collection.findOne({ id });

        if (user && user.qualifications) {
            res.json(user.qualifications);
        } else {
            res.status(404).json({ message: 'User qualifications not found' });
        }
    } catch (err) {
        console.error('Failed to connect to MongoDB or retrieve user qualifications:', err);
        res.status(500).json({ message: 'Failed to retrieve user qualifications from MongoDB' });
    }
});


// POST API to add qualifications
app.post('/api/userdetails/addqualifications/:id', async (req, res) => {
    const id = req.params.id;
    const qualifications = req.body;

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Add qualifications to the document with the given ID in the MongoDB collection
        await collection.updateOne({ id }, { $set: { qualifications: qualifications.qualifications } });

        res.json({ message: 'Qualifications added to MongoDB' });
    } catch (err) {
        console.error('Failed to connect to MongoDB or add qualifications:', err);
        res.status(500).json({ message: 'Failed to add qualifications to MongoDB' });
    }
});


// DELETE API to remove qualifications
app.delete('/api/userdetails/removequalifications/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Remove qualifications from the document with the given ID in the MongoDB collection
        await collection.updateOne({ id }, { $unset: { qualifications: 1 } });

        res.json({ message: 'Qualifications deleted from MongoDB' });
    } catch (err) {
        console.error('Failed to connect to MongoDB or delete qualifications:', err);
        res.status(500).json({ message: 'Failed to delete qualifications from MongoDB' });
    }
});



//Experience
// GET API to add experience
app.get('/api/userdetails/viewexperience/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Find the document with the given ID in the MongoDB collection
        const user = await collection.findOne({ id });

        if (user && user.experience) {
            res.json(user.experience);
        } else {
            res.status(404).json({ message: 'User experience not found' });
        }
    } catch (err) {
        console.error('Failed to connect to MongoDB or retrieve user experience:', err);
        res.status(500).json({ message: 'Failed to retrieve user experience from MongoDB' });
    }
});

// POST API to add experience
app.post('/api/userdetails/addexperience/:id', async (req, res) => {
    const id = req.params.id;
    const { companyName, from, to } = req.body;

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Add experience to the document with the given ID in the MongoDB collection
        await collection.updateOne({ id }, { $set: { 'experience.companyName': companyName, 'experience.from': from, 'experience.to': to } });

        res.json({ message: 'Experience added to MongoDB' });
    } catch (err) {
        console.error('Failed to connect to MongoDB or add experience:', err);
        res.status(500).json({ message: 'Failed to add experience to MongoDB' });
    }
});

// DELETE API to remove experience
app.delete('/api/userdetails/delexperience/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const client = await MongoClient.connect(mongoURI, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Remove experience from the document with the given ID in the MongoDB collection
        await collection.updateOne({ id }, { $unset: { experience: 1 } });

        res.json({ message: 'Experience deleted from MongoDB' });
    } catch (err) {
        console.error('Failed to connect to MongoDB or delete experience:', err);
        res.status(500).json({ message: 'Failed to delete experience from MongoDB' });
    }
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

// Function to generate a unique ID for the user
function generateUniqueId(firstName) {
    const uniqueId = firstName.toLowerCase().replace(/\s/g, '') + '_' + Date.now();
    return uniqueId;
}