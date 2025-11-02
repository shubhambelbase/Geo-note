const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 3000;

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!  PASTE YOUR MONGODB CONNECTION STRING FROM STEP 5 (in my last reply)  !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// It should look like: 'mongodb+srv://geoNoteUser:mySecretPass123@cluster0.xxxxx.mongodb.net/geoNoteDB?retryWrites=true&w=majority'
const MONGO_URI = process.env.MONGO_URI;

const MAX_DISTANCE_METERS = 50;

// --- MIDDLEWARE ---
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON request bodies

// --- DATABASE CONNECTION ---
mongoose.connect(MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB Atlas!"))
  .catch(err => console.error("Failed to connect to MongoDB", err));

// --- DATABASE MODEL (Schema) ---
// This defines what a "Note" looks like in the database.
const noteSchema = new mongoose.Schema({
    text: String, // The encrypted note text
    timestamp: { type: Date, default: Date.now },
    // This stores the location in a special format for geo-queries
    location: {
        type: {
            type: String,
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }
});

// Creates a "2dsphere" index for fast geospatial queries (find nearby)
noteSchema.index({ location: '2dsphere' });

// Creates a TTL (Time To Live) index to automatically delete notes after 24 hours
// 24 * 60 * 60 = 86400 seconds
noteSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

// The Model is the compiled version of the Schema
const Note = mongoose.model('Note', noteSchema);


// --- API ENDPOINTS ---

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
                coordinates: [lon, lat] // IMPORTANT: MongoDB uses [Longitude, Latitude]
            }
            // timestamp is set by default
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
 * Finds nearby notes using a geospatial query.
 */
app.get('/api/notes', async (req, res) => {
    const { lat, lon } = req.query;

    if (lat === undefined || lon === undefined) {
        return res.status(400).json({ error: 'Missing required query parameters: lat, lon' });
    }

    const userCoords = {
        lon: parseFloat(lon),
        lat: parseFloat(lat)
    };

    try {
        // Use the $near operator to find notes
        const nearbyNotes = await Note.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [userCoords.lon, userCoords.lat]
                    },
                    $maxDistance: MAX_DISTANCE_METERS // Find notes within 50 meters
                }
            }
        });

        // Format the notes to send back to the client
        const notesToReturn = nearbyNotes.map(note => ({
            id: note._id,
            text: note.text
            // We don't need to send 'distance' since the frontend just says "nearby"
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
    const { id } = req.params; // Get the ID from the URL
    const { text } = req.body; // Get the new encrypted text

    if (!text) {
        return res.status(400).json({ error: 'Missing required field: text' });
    }

    try {
        // Find the note by its ID and update its text field
        const updatedNote = await Note.findByIdAndUpdate(
            id, 
            { text: text }, // The data to update
            { new: true }  // Return the new, updated version
        );

        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }

        console.log(`Note updated: ${updatedNote._id}`);
        res.status(200).json(updatedNote); // Send back the updated note

    } catch (e) {
        console.error("Error updating note:", e);
        res.status(500).json({ error: 'Failed to update note' });
    }
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Geo-Note API server running on port ${PORT}`);
});
