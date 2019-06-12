const Pool = require('pg').Pool

const pools = {
  //create table clients (id uuid primary key default gen_random_uuid(), name varchar (30), 
  // email varchar (255), phone varchar (30), address varchar (255), date_of_birth date);
  'pii_us': new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'pii_us',
    password: 'dev',
    port: 5432,
  }),

  //create table clients (id uuid primary key default gen_random_uuid(), name varchar (30), 
  // email varchar (255), phone varchar (30), address varchar (255), date_of_birth date);
  'pii_eu': new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'pii_eu',
    password: 'dev',
    port: 5432,
  }),

  //create table distributors (id seiral primary key, name varchar (255));
  'all_dist': new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'devdb',
    password: 'dev',
    port: 5432,
  })
};
const dist_pools = {
  //create table bookings (id serial primary key, client_id uuid, car_code varchar (30), rental_date date );
  1: new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'devdb1',
    password: 'dev',
    port: 5432,
  }),
  //create table bookings (id serial primary key, client_id uuid, car_code varchar (30), rental_date date );
  2: new Pool({
    user: 'dev',
    host: 'localhost',
    database: 'devdb2',
    password: 'dev',
    port: 5432,
  }),
  //create table bookings (id serial primary key, client_id uuid, car_code varchar (30), rental_date date );
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


const lookupBooking = (request, response) => {
  ssn = request.session;
  if(!ssn.distributor)
    response.redirect('/login')
  var i = parseInt(ssn.distributor);
  var search_results = [], ids = [];
  var car_code, rental_date, id;
  var keyword = request.body.keyword;

  const client_promise = new Promise(function(resolve, reject) {
    pools['pii_eu'].query("SELECT * FROM clients WHERE name LIKE '%"+request.body.keyword+
                      "%' OR email LIKE '%"+request.body.keyword+"%'", (error, result1) => {
      if (error) {
        throw error;
      }
      for(var i = 0; i < result1.rows.length; i++) {
        ids.push(result1.rows[i].id);
      }
      
      pools['pii_us'].query("SELECT * FROM clients WHERE name LIKE '%"+request.body.keyword+
                          "%' OR email LIKE '%"+request.body.keyword+"%'", (error, result2) => {
        if (error) {
          throw error;
        }
        for(var i = 0; i < result2.rows.length; i++) {
          ids.push(result2.rows[i].id);
        }
        resolve(ids);
      });
    });
  });


  client_promise.then(data => {
    console.log(data);

    var params = [];
    for(var n = 1; n<=data.length; n++) {
        params.push('$'+n);
    }

    dist_pools[i].query('SELECT * FROM bookings WHERE client_id IN ('+params.join(',')+')',data,(error, result3) => {
      if (error) {
        throw error;
      }
      console.log(result3);

      for(var i = 0; i < result3.rows.length; i++) {
        //
        var arr = {};
        arr['id'] = result3.rows[i].id;
        arr['car_code'] = result3.rows[i].car_code;
        search_results.push(arr);
      }
      response.render("search_results",{ search_results : search_results, count : search_results.length, keyword : keyword });

    });

  });



  /*}).then ((res) => {
    console.log("here3");
    if(ids['0']!='') {
      var params = [];
      for(var n = 1; n<=ids.length; n++){
        params.push('$'+n);
      }
      console.log(params);
        dist_pools[i].query('SELECT * FROM bookings WHERE client_id IN ('+params.join(',')+')',["8f73a989-d103-4aec-b4aa-9c0dca4d0c94","8f73a989-d103-4aec-b4aa-9c0dca4d0c94" ],(error, result3) => {
        if (error) {
           throw error
         }
        if(result3.rows!='') { 
           for(var i = 0; i < result3.rows.length; i++) {
            var arr = {};
            arr['id'] = result3.rows[i].id;
            arr['car_code'] = result3.rows[i].car_code;
            search_results.push(arr);
            count++;
            console.log(search_results);
         }
       }

      });
    }
  });*/
}


// const lookupBooking = (request, response) => {
//   ssn = request.session;
//   if(ssn.distributor)
//     response.redirect('/bookings')
//   var i = parseInt(ssn.distributor);
//   var count = 0;
//   var keyword = request.body.keyword;
//   var search_results = [];
//   var ids = [];
//   const client_promise = new Promise(function(resolve, reject) {
//   pools['pii_eu'].query("SELECT id FROM clients WHERE name LIKE '%"+request.body.keyword+
//     "%' OR email LIKE '%"+request.body.keyword+"%'", (error, result1) => {
//     if (error) {
//       throw error;
//     }
//     for(i=0;i<result1.length;i++)
//       {
//         var data = result1.rows[id].id;
//         ids.push(data);
//         console.log(data);
//         console.log(ids);
//         count++;
//       }
//       resolve(results);
//     });
//   }).then((res) => {
//   pools['pii_us'].query("SELECT id FROM clients WHERE name LIKE '%"+request.body.keyword+
//     "%' OR email LIKE '%"+request.body.keyword+"%'", (error, result2) => {
//     if (error) {
//       throw error;
//     }
//     var data = [];
//     for(i=0;i<result1.length;i++)
//       {
//         var data = result2.rows[id].id;
//         ids.push(data);
//         count++;
//       }
//     });

//   });


//     response.render("search_results", { results : search_results, count : count, keyword : keyword});

// }


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
  console.log('here 0');
  var promise = new Promise((resolve, reject) => {
    console.log('here 1');
    if(is_eu_client=='Y') {
      pools['pii_eu'].query('INSERT INTO clients (name, email, phone, address, date_of_birth) VALUES ($1, $2, $3, $4, $5) RETURNING id', [name, email, phone, address, date_of_birth], (error, result1) => {
        if (error) {
          reject(error);
        }
        console.log('here 2', result1);
        resolve(result1.rows[0].id);
      })
    }  else {
      pools['pii_us'].query('INSERT INTO clients (name, email, phone, address, date_of_birth) VALUES ($1, $2, $3, $4, $5) RETURNING id', [name, email, phone, address, date_of_birth], (error, result2) => {
        if (error) {
          reject(error);
        }
        console.log('here 2---', result2);
       resolve(result2.rows[0].id);
      })
    }
  });
  console.log('here 3');

  promise.then(client_id => {
    dist_pools[i].query('INSERT INTO bookings (client_id, car_code, rental_date, is_eu_client ) VALUES ($1, $2, $3, $4)', [client_id, car_code, rental_date, is_eu_client], (error, result3) => {
      if (error) {
        throw error
      }
      response.render("booking_create");
    })
  }).catch(error => {
    console.log('here 4', error);
    throw error;
  });
}

const getBooking = (request, response) => {
  ssn = request.session;
    if(!ssn.distributor) 
      response.redirect('/login');
    var i = parseInt(ssn.distributor);
    const id = parseInt(request.params.id)
    var booking = [];
    var v_client_id, v_car_code, v_rental_date, v_is_eu_client, v_name, v_email, v_phone, v_address, v_date_of_birth;

    dist_pools[i].query("SELECT *,TO_CHAR(rental_date, 'YYYY-MM-DD') f_date FROM bookings where id = $1", [id] ,(error,results) => {
      console.log(results);
      if (error) {
        throw error;
      }
       v_car_code = results.rows[0].car_code;
       v_rental_date = results.rows[0].f_date;
       v_is_eu_client = results.rows[0].is_eu_client;
       v_client_id = results.rows[0].client_id;


       if(v_is_eu_client=='Y') {
        pools['pii_eu'].query("SELECT *, TO_CHAR(date_of_birth, 'YYYY-MM-DD') f_date FROM clients where id = $1",[v_client_id], (error, results) => {
          if (error) {
            throw error;
          }
          v_name = results.rows[0].name;
          v_email = results.rows[0].email;
          v_phone = results.rows[0].phone;
          v_address = results.rows[0].address;
          v_date_of_birth = results.rows[0].f_date;

          response.render("booking_edit", {id:id, client_id: v_client_id, car_code: v_car_code, rental_date: v_rental_date, is_eu_client: v_is_eu_client, 
            name: v_name, email: v_email, phone: v_phone, address: v_address, date_of_birth: v_date_of_birth});
        })
      } else {
        pools['pii_us'].query("SELECT *,TO_CHAR(date_of_birth, 'YYYY-MM-DD') f_date FROM clients where id = $1",[v_client_id], (error, results) => {
          if (error) {
            throw error;
          }
          v_name = results.rows[0].name;
          v_email = results.rows[0].email;
          v_phone = results.rows[0].phone;
          v_address = results.rows[0].address;
          v_date_of_birth = results.rows[0].f_date;

          response.render("booking_edit", {id:id, client_id: v_client_id, car_code: v_car_code, rental_date: v_rental_date, is_eu_client: v_is_eu_client,
           name: v_name, email: v_email,phone: v_phone, address: v_address, date_of_birth: v_date_of_birth});
        })
      }
    });

}

const updateBooking = (request, response) => {
  ssn = request.session;
  if(!ssn.distributor) 
    response.redirect('/login');
  var i = parseInt(ssn.distributor);
  const id = parseInt(request.params.id);
  
  const { client_id, car_code, rental_date, is_eu_client, name, email, phone, address, date_of_birth } = request.body;
  console.log(is_eu_client)
  var client_pool = (is_eu_client == 'Y') ? 'pii_eu' : 'pii_us';

  dist_pools[i].query(
    'UPDATE bookings SET car_code = $1, rental_date = $2 WHERE id = $3',
    [car_code, rental_date, id],
    (error, results) => {
      if (error) {
        throw error
      }

  });

  pools[client_pool].query(
    'UPDATE clients SET name = $1, email = $2, phone = $3, address = $4, date_of_birth = $5 WHERE id = $6',
    [name, email, phone, address, date_of_birth, client_id],
    (error, results) => {
      if (error) {
        throw error
      }

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
  });
  response.redirect('/bookings');
}

// const getClients = (request, response) => {
//   ssn = request.session;
//   var clients = [], client1 = [], client2 = [];
//   const client_promise = new Promise(function(resolve, reject) {
//   pools['pii_eu'].query('SELECT * FROM clients', (error, result1) => {
//       if (error) {
//          throw error
//        }
//        for(var i = 0; i < result1.rows.length; i++) {
//           var arr = {};

//           arr['name'] = result1.rows[i].name;
//           arr['email'] = result1.rows[i].email;
//           arr['phone'] = result1.rows[i].phone;
//           arr['address'] = result1.rows[i].address;
//           arr['date_of_birth'] = result1.rows[i].date_of_birth;

//           clients.push(arr);
//        }
//        resolve(result1);
//      });
//   }).then((res) => {
//     pools['pii_us'].query('SELECT * FROM clients', (error, result2) => {
//         if (error) {
//            throw error
//          }

//          for(var i = 0; i < result2.rows.length; i++) {
//           var arr = {};

//           arr['name'] = result2.rows[i].name;
//           arr['email'] = result2.rows[i].email;
//           arr['phone'] = result2.rows[i].phone;
//           arr['address'] = result2.rows[i].address;
//           arr['date_of_birth'] = result2.rows[i].date_of_birth;

//           clients.push(arr);
//           response.render("client_index",{clients:clients})

//        }
//       });
//   });
  
// }


module.exports = {
  getLogin,
  getBookings,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
  lookupBooking,
  //getClients,
}
