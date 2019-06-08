const Pool = require('pg').Pool

const pool_eu = new Pool({
  user: 'dev',
  host: 'localhost',
  database: 'devdb',
  password: 'dev',
  port: 5432,
})

const pool_us = new Pool({
  user: 'po',
  host: 'localhost',
  database: 'pi',
  password: 'po',
  port: 5432,
})

const booking_promise = new Promise(function(resolve, reject) {
  pool_eu.query('SELECT * FROM bookings join clients on bookings.client_id = clients.id', (error, results) => {
      if (error) {
         throw error
       }
       resolve(results);
     });
});
const booking_promise_us = new Promise(function(resolve, reject) {
  pool_us.query('SELECT * FROM bookings join clients on bookings.client_id = clients.id', (error, results) => {
      if (error) {
         throw error
       }
       resolve(results);
     });
});

const client_promise = new Promise(function(resolve, reject) {
  pool_eu.query('SELECT * FROM clients ORDER BY id ASC', (error, results) => {
      if (error) {
         throw error
       }
       resolve(results);
     });
});

const getBookings = (request, response) => {
  pool_eu.query('SELECT * FROM bookings join clients on bookings.client_id = clients.id', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })

}

const createBooking = (request, response) => {
  const { client_id, car_code, rental_date } = request.body

  pool_eu.query('INSERT INTO bookings (client_id, car_code, rental_date) VALUES ($1, $2, $3)', [client_id, car_code, rental_date], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`Booking Created with ID: ${results.insertId}`)
  })
}

const getBookingById = (request, response) => {
  const id = parseInt(request.params.id)

  pool_eu.query('SELECT * FROM clients WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}


const updateBooking = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email, phone, address, date_of_birth } = request.body

  pool_eu.query(
    'UPDATE clients SET name = $1, email = $2, phone = $3, address = $4, date_of_birth = $5 WHERE id = $6',
    [name, email, phone, address, date_of_birth, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteBooking = (request, response) => {
  const id = parseInt(request.params.id)

  pool_eu.query('DELETE FROM clients WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}


const getClients = (request, response) => {
  pool_eu.query('SELECT * FROM clients ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}


const getClientById = (request, response) => {
  const id = parseInt(request.params.id)

  pool_eu.query('SELECT * FROM clients WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createClient = (request, response) => {
  const { name, email, phone, address, date_of_birth } = request.body

  pool_eu.query('INSERT INTO clients (name, email, phone, address, date_of_birth) VALUES ($1, $2, $3, $4, $5)', [name, email, phone, address, date_of_birth], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`User added with ID: ${results.insertId}`)
  })
}

const updateClient = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email, phone, address, date_of_birth } = request.body

  pool_eu.query(
    'UPDATE clients SET name = $1, email = $2, phone = $3, address = $4, date_of_birth = $5 WHERE id = $6',
    [name, email, phone, address, date_of_birth, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteClient = (request, response) => {
  const id = parseInt(request.params.id)

  pool_eu.query('DELETE FROM clients WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}

module.exports = {
  booking_promise_us,
  booking_promise,
  client_promise,
  createBooking,
  getBookings,
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
}
