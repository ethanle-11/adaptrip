import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/search', async (req, res) => {
    const { destination } = req.query
    try {
        const response = await axios.get(
            `https://geocode.googleapis.com/v4/geocode/address/${destination}`, {
                params: {
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            }
        )
        const location = response.data.results[0].location
        res.json({ lat: location.latitude, lng: location.longitude})
    } catch (error) {
        res.status(500).json({ error: "Something went wrong"})
    }
})

export default router