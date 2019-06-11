const Pool = require('pg').Pool

const pools = {
  'pii_us': new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'pii_us',
    password: 'dev',
    port: 5432,
  }),
  'pii_eu': new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'pii_eu',
    password: 'dev',
    port: 5432,
  }),
  'all_dist': new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'devdb',
    password: 'dev',
    port: 5432,
  })
};
const dist_pools = {
  1: new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'devdb1',
    password: 'dev',
    port: 5432,
  }),
  2: new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'devdb2',
    password: 'dev',
    port: 5432,
  }),
  3: new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'devdb3',
    password: 'dev',
    port: 5432,
  })
}


const getLogin = (request, response) => {
  ssn = request.session;
  ssn.distributor = request.body.distributors;

  console.log(!ssn.distributor)
  if(ssn.distributor)
    response.redirect('/bookings')

  pools['all_dist'].query('SELECT * FROM distributors', (error, results) => {
    if (error) {
      throw error
    }
    response.render("login", { distributors: results.rows });
  });
}

const getBookings = (request, response) => {
  ssn = request.session;
  if(!ssn.distributor) 
    response.redirect('/login');
  var i = parseInt(ssn.distributor);
  console.log(i)
  dist_pools[i].query('SELECT * FROM bookings ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error;
    }
   response.render("booking_index", { bookings: results.rows });
  });
}


const createBooking = (request, response) => {
  ssn = request.session;
  console.log(ssn.distributor)
  if(!ssn.distributor) 
    response.redirect('/login');
  var i = parseInt(ssn.distributor);
  var client_id;

  const { name, email, phone, address, date_of_birth, car_code, rental_date, is_eu_client } = request.body;
  
  if(is_eu_client=='Y') {
    pools['pii_eu'].query('INSERT INTO clients (name, email, phone, address, date_of_birth) VALUES ($1, $2, $3, $4, $5)', [name, email, phone, address, date_of_birth], (error, result1) => {
      if (error) {
        throw error
      }
     // response.status(200).json(results.rows);
      client_id = result1.insertId;
    })
  }  else {
    pools['pii_us'].query('INSERT INTO clients (name, email, phone, address, date_of_birth) VALUES ($1, $2, $3, $4, $5)', [name, email, phone, address, date_of_birth], (error, result2) => {
      if (error) {
        throw error
      }
    //  response.status(200).json(results.rows);
     client_id = result2.insertId;
    })
  }
    dist_pools[i].query('INSERT INTO bookings (client_id, car_code, rental_date, is_eu_client ) VALUES ($1, $2, $3, $4)', [client_id, car_code, rental_date, is_eu_client], (error, result3) => {
      if (error) {
        throw error
      }
     // response.status(201).send(`Booking Created with ID: ${results.insertId}`)
      response.render("booking_create");
    })

  
}

const getBooking = (request, response) => {
  ssn = request.session;
    if(!ssn.distributor) 
      response.redirect('/login');
    var i = parseInt(ssn.distributor);
    const id = parseInt(request.params.id)
    var booking = [];
    var v_client_id, v_car_code, v_rental_date, v_is_eu_client, v_name, v_email, v_phone, v_address, v_date_of_birth;

    if(v_is_eu_client=='Y') {
      pools['pii_eu'].query('SELECT * FROM clients where id = 1', (error, results) => {
        if (error) {
          throw error;
        }
      console.log(results.rows)
      v_name = results.rows[0].name;
      v_email = results.rows[0].email;
      console.log(results.rows[0].name)
      })
    } else {
      pools['pii_us'].query('SELECT * FROM clients where id = 1', (error, results) => {
        if (error) {
          throw error;
        }
      console.log(results.rows)
      v_name = results.rows[0].name;
      v_email = results.rows[0].email;
      console.log(results.rows[0].name)

      })
    }

    dist_pools[i].query('SELECT * FROM bookings where id = $1', [id] ,(error,results) => {
      if (error) {
        throw error;
      }
      console.log(v_email)
       console.log(results.rows[0].car_code)
       v_car_code = results.rows[0].car_code;
       v_rental_date = results.rows[0].rental_date;
       v_is_eu_client = results.rows[0].is_eu_client;
       response.render("booking_edit", {id:id, car_code: v_car_code, rental_date: v_rental_date, is_eu_client: v_is_eu_client, name: v_name, email: v_email});
    });

}

const updateBooking = (request, response) => {
  console.log('updateBooking')

  ssn = request.session;
  if(!ssn.distributor) 
    response.redirect('/login');
  var i = parseInt(ssn.distributor);
  const id = parseInt(request.params.id)
  // var booking = [];
  // var v_car_code, v_rental_date, v_is_eu_client;

  // dist_pools[i].query('SELECT * FROM bookings where id = $1', [id] ,(error,results) => {
  //   if (error) {
  //     throw error;
  //   }
  // console.log(results.rows[0].car_code)
  //    v_car_code = results.rows[0].car_code;
  //    v_rental_date = results.rows[0].rental_date;
  //    v_is_eu_client = results.rows[0].is_eu_client;
  // });
  
  const { client_id, car_code, rental_date, is_eu_client } = request.body;

  dist_pools[i].query(
    'UPDATE bookings SET client_id = $1, car_code = $2, rental_date = $3, is_eu_client = $4 WHERE id = $5',
    [client_id, car_code, rental_date, is_eu_client, id],
    (error, results) => {
      if (error) {
        throw error
      }
      console.log(request.body)
      console.log('update')
    });

  response.redirect('/bookings');
}

const deleteBooking = (request, response) => {
  ssn = request.session;
  if(!ssn.distributor) 
    response.redirect('/login');
  var i = parseInt(ssn.distributor);
  const id = parseInt(request.params.id)
  dist_pools[i].query('DELETE FROM bookings WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
   // response.status(200).send(`User deleted with ID: ${id}`)
  });
  response.redirect('/bookings');
}

const createClient = (request, response) => {
  ssn = request.session;
  if(!ssn.distributor)
    response.redirect('/login');
  var i = parseInt(ssn.distributor);

  
  const { name, email, phone, address, date_of_birth, is_eu_client } = request.body;
  if(is_eu_client=='Y') {
    pools['pii_eu'].query('INSERT INTO clients (name, email, phone, address, date_of_birth) VALUES ($1, $2, $3, $4, $5)', [name, email, phone, address, date_of_birth], (error, results) => {
      if (error) {
        throw error
      }
     // response.status(200).json(results.rows);
    })
  }  else {
    pools['pii_us'].query('INSERT INTO clients (name, email, phone, address, date_of_birth) VALUES ($1, $2, $3, $4, $5)', [name, email, phone, address, date_of_birth], (error, results) => {
      if (error) {
        throw error
      }
    //  response.status(200).json(results.rows);
    })
  }
  response.render("client_create");
}

const getClients = (request, response) => {
  ssn = request.session;
  pools['pii_eu'].query('SELECT * FROM clients ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    //response.status(200).json(results.rows)
  })
}


const getClientById = (request, response) => {
  ssn = request.session;
  if(!ssn.distributor)
    response.redirect('/login');
  
  var i = parseInt(ssn.distributor);

  const id = parseInt(request.params.id)

  pools['pii_eu'].query('SELECT * FROM clients WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    //response.status(200).json(results.rows)
  })
}


const updateClient = (request, response) => {
  ssn = request.session;
  const id = parseInt(request.params.id)
  const { name, email, phone, address, date_of_birth } = request.body
  console.log(request)
  pools['pii_eu'].query(
    'UPDATE clients SET name = $1, email = $2, phone = $3, address = $4, date_of_birth = $5 WHERE id = $6',
    [name, email, phone, address, date_of_birth, id],
    (error, results) => {
      if (error) {
        throw error
      }
     // response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteClient = (request, response) => {
  ssn = request.session;
  const id = parseInt(request.params.id)

  pools['pii_eu'].query('DELETE FROM clients WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    //response.status(200).send(`User deleted with ID: ${id}`)
  })
}

const client_promise = new Promise(function(resolve, reject) {
  pools['pii_eu'].query('SELECT * FROM clients ORDER BY id ASC', (error, results) => {
      if (error) {
         throw error
       }
       resolve(results);
     });
});


// const test = () => {
//   var promises = [];

//   for (var i=0; i<pools.lenght; i++) {
//     promises.push(new Promise());
//     doGetBookings(pools[i], (err, res) => {
//       promises[i].resolve(res);
//     })
//   }

//   promise.all(promises, () => {
//     //
//   })
// }

// const getBookings = (pool, handler) => {
//   pool.query('SELECT * FROM bookings ORDER BY id ASC', (error, results) => {
//     if (error) {
//       throw error;
//     }
//    response.render("booking_index", { bookings: results.rows });
//   });
// }


// const doGetBookings = (pool, handler) => {
//   pool.query('SELECT * FROM bookings ORDER BY id ASC', handler);
// }

// const getBookings = (request, response) => {
//   var i = parseInt(request.query.distributors);
//   doGetBookings(dist_pools[i], (error, results) => {
//     if (error) {
//       throw error;
//     }
//    response.render("booking_index", { bookings: results.rows });
//   });
// }


// const getBookings = (request, response) => {
//   console.log(request.query)
//   doGetBookings(pools['pii_eu'], (error, results1) => {
//     if (error) throw error;
//     doGetBookings(pools['pii_eu'], (error, results2) => {
//       if (error) throw error;
//       response.render("booking_index", { bookings: results1.rows.concat(results2.rows) });
//     })
//   });
// }


// const getBookingById = (request, response) => {
//   ssn = request.session;
//   console.log(!ssn.distributor);
//   if(!ssn.distributor) 
//     response.redirect('/login');
//   var i = parseInt(ssn.distributor);

//   const id = parseInt(request.params.id)

//   dist_pools[i].query('SELECT * FROM bookings WHERE id = $1', [id], (error, results) => {
//     if (error) {
//       throw error
//     }
//     response.render("booking_details", { booking: request.rows });
//   })
// }


module.exports = {
  getLogin,
  getBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
  client_promise,
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
}
