const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const db = process.env.MongoURI;

app.use('/', require('./routes'));

const PORT = process.env.PORT || 8000;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB is connected');
        app.listen(PORT, () => {
            console.log("Server is running...");
        });
    })
    .catch(err => console.log(err));