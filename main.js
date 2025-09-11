require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');


const app = express();
const PORT = process.env.PORT || 4000;

//database connection
mongoose.connect(process.env.DB_URI, {
    //useNewUrlParser: true,
    //useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

//middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: 'Mi_Clave_Secreta',
    resave: false,
    saveUninitialized: true,
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next(); 
});

//Engine
app.use(express.static('uploads'));
app.set('view engine', 'ejs');

//Routes
/*
app.get('/', (req, res) => {
    res.send('Hello World!');
});
*/
app.use("", require('./routes/routes'));

//Settings

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

