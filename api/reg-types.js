import axios from 'axios';

const getToken = async () => {
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
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

export default async function handler(req, res) {
    const eventId = req.query.event_id || '219985';
    try {
        const token = await getToken();
        const regtypes = await getRegtypes(token, eventId);
        res.status(200).json(regtypes);
    } catch (error) {
        console.error('Error fetching reg types:', error);
        res.status(500).json({ error: 'Failed to fetch reg types' });
    }
}
