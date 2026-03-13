import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from './routes'
import cookieParse from 'cookie-parser'

dotenv.config()
const app = express()

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: {
//     error: 'too many requests from this ip address',
//     retryAfter: '15 minutes',
//   },
//   standardHeaders: true,
//   legacyHeaders: false
// })
//
// app.use(limiter);

app.use(cors({
  origin: 'http://localhost:3000'
}))
app.use(helmet())
app.use(express.json())
app.use(cookieParse())

app.use(routes)

export default app
