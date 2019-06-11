var express = require('express')
var bodyParser = require('body-parser')
var session = require('express-session');
var moment = require('moment');
var app = express()
var port = 3000;
var db = require('./queries')
var bookings, clients;
var ssn;

db.client_promise.then((res) => {
	clients = res.rows;
})

app.use(session({secret:'XASDASDA'}));
app.use('/public', express.static('public'));
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.redirect('/login');
})

app.get('/login', db.getLogin);
app.post('/login', db.getLogin);
app.get('/bookings', db.getBookings);
app.get('/booking',db.createBooking);
app.post('/booking',db.createBooking);
app.get('/booking/:id',db.getBooking);
app.put('/booking/:id',db.updateBooking);
app.get('/booking_delete/:id', db.deleteBooking);

app.get("/client_create",db.createClient);
app.get("/clients",function(req,res) {
	res.render("client_index", {clients:clients});
});

app.get('/client/:id', db.getClientById)
app.post('/clients', db.createClient)
app.put('/client/:id', db.updateClient)
app.post('/clients/:id', db.deleteClient)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
app.set('view engine','ejs')
