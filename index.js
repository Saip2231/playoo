import express from 'express';
import 'dotenv/config';
import { requireAuth } from './middleware/auth.js';
import { createClient } from '@supabase/supabase-js'; // <-- ADD THIS

const app = express();
app.use(express.json()); 

// --- SUPABASE SETUP ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- 1. SIGNUP ROUTE ---
app.post('/auth/signup', async (req, res) => {
    const { email, password } = req.body;
    
    // Tell Supabase to create a new user
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Check your email to verify, or test login if auto-confirm is on!", user: data.user });
});

// --- 2. LOGIN ROUTE (This is where the token comes from!) ---
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Tell Supabase to log them in
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) return res.status(400).json({ error: error.message });
    
    // SUCCESS! Send the token back to the user
    res.json({
        access_token: data.session.access_token,
        user: data.user
    });
});

// --- YOUR EXISTING ROUTES ---
app.get('/api/public', (req, res) => {
    res.json({ message: "Anyone can see this!" });
});

app.get('/api/protected', requireAuth, (req, res) => {
    res.json({ 
        message: "Success! You bypassed the bouncer.",
        userId: req.user.id 
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});