var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var _ = require('lodash')
var lst = []
var port = 3000;
var db = require('./queries')
var bookings, booking1, clients;

db.booking_promise.then((res) => {
	bookings = res.rows;
})
db.booking_promise_us.then((res) => {
  booking1 = res.rows;
})

db.client_promise.then((res) => {
	clients = res.rows;
})

app.use('/public', express.static('public'));
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.redirect('/bookings');
})
app.get("/bookings",function(req,res) {
  lst = { 'list': [bookings, booking1]}
	res.render("booking_index", {bookings:bookings.concat(booking1)});

});
app.get("/booking_create",function(req, res) {
	res.render("booking_create");
});
app.post("/booking_create",db.createBooking);
app.put("/booking_edit",db.editBooking);

app.get("/client_create",function(req, res) {
    res.render("client_create");
});
app.get("/clients",function(req,res) {
	res.render("client_index", {clients:clients});
});

app.get('/client/:id', db.getClientById)
app.post('/clients', db.createClient)
app.put('/client/:id', db.updateClient)
app.delete('/clients/:id', db.deleteClient)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
app.set('view engine','ejs')
