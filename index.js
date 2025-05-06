require('dotenv').config({ path: '.env.local' });
const express = require('express');
const videoRouter = require('./routes/videoRoutes');

const app = express();
const port = 5000;

app.use(express.json());
app.use('/video', videoRouter);

app.listen(port, ()=>{console.log("Server Started on port", port)});