const Pool = require('pg').Pool

const pool = new Pool({
  user: 'dev',
  host: 'localhost',
  database: 'ba',
  password: 'dev',
  port: 5432,
})

const pool_eu = new Pool({
  user: 'po',
  host: 'localhost',
  database: 'pi',
  password: 'po',
  port: 5432,
})


const getUsers = (request, response) => {
  pool.query('SELECT * FROM clients ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getClients = (request, response) => {
  pool_eu.query('SELECT * FROM clients ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
      console.log('error')
    }
    response.status(200).json(results.rows)
  })
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM clients WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createUser = (request, response) => {
  const { name, email, phone, address, date_of_birth } = request.body

  pool.query('INSERT INTO clients (name, email, phone, address, date_of_birth) VALUES ($1, $2, $3, $4, $5)', [name, email, phone, address, date_of_birth], (error, results) => {
    if (error) {
      throw error
    }
    response.status(201).send(`User added with ID: ${results.insertId}`)
  })
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email, phone, address, date_of_birth } = request.body

  pool.query(
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

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM clients WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}

module.exports = {
  getClients,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
}
