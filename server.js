const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 3000;

// Read the MONGO_URI from Render's "Environment Variables"
const MONGO_URI = process.env.MONGO_URI; 

const MAX_DISTANCE_METERS = 500;
 // Increased for GPS accuracy

// --- MIDDLEWARE ---
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON request bodies

// --- DATABASE CONNECTION ---
// Check if MONGO_URI exists
if (!MONGO_URI) {
  console.error("MongoDB URI is not set. Please set the MONGO_URI environment variable.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB Atlas!"))
  .catch(err => console.error("Failed to connect to MongoDB", err));

// --- DATABASE MODEL (Schema) ---
const noteSchema = new mongoose.Schema({
    text: String, // The encrypted note text
    timestamp: { type: Date, default: Date.now },
    location: {
        type: {
            type: String,
            enum: ['Point'], 
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }
});

noteSchema.index({ location: '2dsphere' });
noteSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 }); // 24 hours

const Note = mongoose.model('Note', noteSchema);


// --- API ENDPOINTS ---

/**
 * [GET] /
 * A simple health check to see if the server is awake.
 */
app.get('/', (req, res) => {
    res.send('Geo-Note server is alive and running!');
});

/**
 * [POST] /api/note
 * Creates a new note.
 */
app.post('/api/note', async (req, res) => {
    const { text, lat, lon } = req.body;

    if (!text || lat === undefined || lon === undefined) {
        return res.status(400).json({ error: 'Missing required fields: text, lat, lon' });
    }

    try {
        const newNote = new Note({
            text: text,
            location: {
                type: 'Point',
                coordinates: [lon, lat] // [Longitude, Latitude]
            }
        });

        await newNote.save();
        console.log(`Note created: ${newNote._id}`);
        res.status(201).json(newNote);

    } catch (e) {
        console.error("Error saving note:", e);
        res.status(500).json({ error: 'Failed to save note' });
    }
});

/**
 * [GET] /api/notes
 * Finds nearby notes.
 */
app.get('/api/notes', async (req, res) => {
    console.log("A user is searching for notes!"); // <-- ADD THIS LINE

    const { lat, lon } = req.query;
//...


    if (lat === undefined || lon === undefined) {
        return res.status(400).json({ error: 'Missing required query parameters: lat, lon' });
    }

    const userCoords = {
        lon: parseFloat(lon),
        lat: parseFloat(lat)
    };

    try {
        const nearbyNotes = await Note.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [userCoords.lon, userCoords.lat]
                    },
                    $maxDistance: MAX_DISTANCE_METERS
                }
            }
        });

        const notesToReturn = nearbyNotes.map(note => ({
            id: note._id,
            text: note.text
        }));

        console.log(`Found ${notesToReturn.length} notes.`);
        res.status(200).json(notesToReturn);

    } catch (e) {
        console.error("Error finding notes:", e);
        res.status(500).json({ error: 'Failed to find notes' });
    }
});

/**
 * [PATCH] /api/note/:id
 * Updates the text of an existing note.
 */
app.patch('/api/note/:id', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Missing required field: text' });
    }

    try {
        const updatedNote = await Note.findByIdAndUpdate(
            id, 
            { text: text },
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }

        console.log(`Note updated: ${updatedNote._id}`);
        res.status(200).json(updatedNote);

    } catch (e) {
        console.error("Error updating note:", e);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Geo-Note API server running on port ${PORT}`);
});
