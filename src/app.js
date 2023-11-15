/*

JWT

1.- El cliente realiza un login con sus credenciales.
2.- El cliente es validado y se crea un nuevo token, utilizando una llave secreta.
3.- El cliente envia el token al cliente.
4.- El cliente almacena el token para su uso y lo envia en cada petición.
5.- El servidor verifica la firma del token, su caducidad y comprueba sí el usuario tiene permisos al recurso.

*/

const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')
const keys = require('./settings/keys')

app.set('key', keys.key)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('hi')
})

app.post('/login', (req, res) => {
  if(req.body.user == 'admin' && req.body.pass == '123456') {
    const payload = { 
      check: true
    }
    const token = jwt.sign(payload, app.get('key'),{
      expiresIn: "7d" //expires in 7 days
    })
    res.json({
      message: 'Autenticación exitosa',
      token: token
    })
  } else {
    res.status(400).json({
      message: 'Usuario y/o password son incorrectos.'
    })
  }
})

const verificacion = express.Router()

verificacion.use((req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  //console.log(token)
  if(!token) {
    res.status(401).send({
      error: 'Es necesario un token de autenticación.'
    })
    return
  }
  if(token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
    //console.log(token)
  }
  if(token) {
    jwt.verify(token, app.get('key'), (error, decoded) => {
      if(error) {
        return res.json({
          message: 'El token no es válido.'
        }) 
      } else {
        req.decoded = decoded
        next()
      }
    })
  }
})

app.get('/info', verificacion, (req,res) => {
  res.json({
    message: 'Información entregada'
  })
})

app.listen(3000, () => {
  console.log(`Server runing at port 3000`)
})

