const express = require("express");
const cors = require("cors");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/process-payment", async (req, res) => {
    const { token, amount } = req.body;

    try {
        const charge = await stripe.charges.create({
            amount: amount,
            currency: "cad",
            source: token,
            description: "Test charge",
        });

        res.status(200).json({ success: true, nextStep: 'confirmation' });
    } catch (error) {
        console.error("Payment failed:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const getToken = async () => {
    try {
        const encodedCredentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        const body = new URLSearchParams({ grant_type: 'client_credentials' });

        const response = await axios.post(
            'https://api.swoogo.com/api/v1/oauth2/token',
            body,
            {
                headers: {
                    'Authorization': `Basic ${encodedCredentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                },
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('Token error:', error.response?.data || error.message);
        throw new Error('Failed to get token');
    }
};

const getEvents = async (token) => {
    const response = await axios.get(
        'https://api.swoogo.com/api/v1/events?fields=capacity,close_date,close_time,created_at,created_by,description,end_date,end_time,folder_id,free_event,hashtag,id,name,organizer_id,start_date,start_time,status,target_attendance,timezone,type_id,updated_at,updated_by,url,webinar_url',
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }
    );

    return response.data;
};

const getRegtypes = async (token, eventId) => {
    const response = await axios.get(
        `https://api.swoogo.com/api/v1/reg-types?event_id=${eventId}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        }
    );

    return response.data;
};

const getRegistrants = async (token) => {
    try {
        const response = await axios.get('https://api.swoogo.com/api/v1/registrants', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        throw new Error('Failed to get registrants');
    }
};

const getDiscounts = async (token) => {
    try {
        const response = await axios.get('https://api.swoogo.com/api/v1/discounts', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        throw new Error('Failed to get discounts');
    }
};


app.get('/api/events', async (req, res) => {
    try {
        const token = await getToken();
        const events = await getEvents(token);
        res.json(events);
    } catch (error) {
        console.error('Events error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.get('/api/reg-types', async (req, res) => {
    try {
        const token = await getToken();
        const eventId = req.query.event_id || '219985';
        const regtypes = await getRegtypes(token, eventId);
        res.json(regtypes);
    } catch (error) {
        console.error('RegTypes error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch reg types' });
    }
});

app.get('/api/registrants', async (req, res) => {
    try {
        const token = await getToken();
        const eventId = req.query.event_id || '219985';
        const response = await axios.get(
            `https://api.swoogo.com/api/v1/registrants?event_id=${eventId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Registrants error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch registrants' });
    }
});

app.get('/api/discounts', async (req, res) => {
    try {
        const token = await getToken();
        const eventId = req.query.event_id || '219985';
        const response = await axios.get(
            `https://api.swoogo.com/api/v1/discounts?event_id=${eventId}&fields=absolute_discount%2Capplicable_line_items%2Ccapacity%2Ccode%2Ccreated_at%2Ccustom_fees%2Cevent_id%2Cid%2Cnotes%2Cpercentage_discount%2Csold_out_message%2Ctype%2Cupdated_at`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Discounts error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
});


const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

