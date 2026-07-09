import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import placesRouter from './routes/places'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/places', placesRouter)

app.get("/health", (req, res) => {
    res.json({ status: 'ok'})
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

