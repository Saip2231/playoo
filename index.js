import express from 'express';
import 'dotenv/config';
import { requireAuth } from './middleware/auth.js';
import { createClient } from '@supabase/supabase-js';
import neo4j from 'neo4j-driver';
import cors from 'cors'; // Add to imports


const app = express();
app.use(cors());
app.use(express.json());

// --- SUPABASE SETUP ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- NEO4J SETUP ---
const driver = neo4j.driver(
    process.env.NEO4J_URI, // now bolt://localhost:7687
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
// --- AUTH ROUTES ---
app.post('/auth/signup', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.json(data);
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        // This return prevents the infinite loading spinner!
        return res.status(400).json({ error: error.message }); 
    }
    res.json(data);
});

// --- MATCHMAKING ROUTE (The Graph query) ---
app.get('/api/matchmaking', requireAuth, async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(
            'MATCH (p1:Player)-[r:SIMILAR_LEVEL]->(p2:Player) RETURN p1.name AS Player1, p2.name AS Player2 LIMIT 5'
        );

        const matches = result.records.map(record => ({
            player1: record.get('Player1'),
            player2: record.get('Player2')
        }));

        res.json({ 
            message: "Matchmaking data pulled successfully!", 
            matches: matches 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to query the graph" });
    } finally {
        await session.close(); 
    }
});

// --- BOOKING ROUTE (PostgreSQL) ---
app.post('/api/bookings', requireAuth, async (req, res) => {
    // 1. Grab the booking details from the frontend's request
    const { arena_id, court_number, date, start_time } = req.body;
    
    // 2. Grab the user's ID from the auth token (your middleware handles this!)
    const user_id = req.user.id; 

    try {
        // 3. Insert the booking into your Supabase Postgres 'bookings' table
        const { data, error } = await supabase
            .from('bookings') // Make sure you have a table named 'bookings' in Supabase!
            .insert([
                { 
                    user_id: user_id, 
                    arena_id: arena_id, 
                    court_number: court_number, 
                    booking_date: date, 
                    start_time: start_time,
                    status: 'confirmed'
                }
            ])
            .select();

        if (error) throw error;

        // 4. Send success back to Person 3's frontend
        res.status(201).json({ 
            message: "Court booked successfully!", 
            booking: data 
        });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ error: "Failed to create booking" });
    }
});

// --- EXISTING TEST ROUTES ---
app.get('/api/protected', requireAuth, (req, res) => {
    res.json({ 
        message: "Welcome to the VIP lounge! Your token is valid.", 
        user: req.user 
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});