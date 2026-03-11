import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
// import routes from './routes'

dotenv.config()
const app = express()

// app.use(express.json())
// app.use(routes)

app.use(cors({
  origin: 'http://localhost:3000'
}))
app.use(helmet())
app.use(express.json())

export default app
