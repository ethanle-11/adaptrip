import { Router } from "express";
import axios from 'axios'

const router = Router()

router.get("/search", async (req, res) => {
    const { query } = req.query
    try {
        const response = await axios.post(
                "https://places.googleapis.com/v1/places:searchText", {
                    textQuery: query,
                    maxResultCount: 5
                }, {
                    headers: {
                        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
                        'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.types'
                    }
                }

            )
            res.json(response.data)
    } catch (error: any) {
        console.error(error.response?.data)
        res.status(500).json({ error: "Something went wrong"})
    }
    
})

export default router