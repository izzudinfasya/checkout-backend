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

export default async function handler(req, res) {
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
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching registrants:', error);
        res.status(500).json({ error: 'Failed to fetch registrants' });
    }
}
