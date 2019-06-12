var express = require('express')
var bodyParser = require('body-parser')
var session = require('express-session');
var moment = require('moment');
var app = express()
var port = 3000;
var db = require('./queries')
//var bookings, clients;
var ssn;

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
app.get('/booking',(req,resp) => {
	resp.render('booking_create');
});
app.post('/booking',db.createBooking);
app.get('/booking/:id',db.getBooking);
app.post('/booking/:id',db.updateBooking);
app.get('/booking_delete/:id', db.deleteBooking);

app.post('/search',db.lookupBooking);
app.get('/search_results',(req,resp) => {
	resp.render('search_results');
});

app.get('/client_create',(req,resp) => {
	resp.render('client_create');
});
//app.get('/clients',db.getClients);
//app.get('/client/:id', db.getClientById)
//app.post('/clients', db.createClient)
// app.put('/client/:id', db.updateClient)
// app.post('/clients/:id', db.deleteClient)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
app.set('view engine','ejs')
