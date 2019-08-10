const mongodb = require('mongodb')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static('dist'))

let db;
let contacts;

mongodb.MongoClient.connect(process.env.MONGO_URI || "localhost:27017/test").then(database => {
    db = database
    contacts = db.collection('contacts')
})
  
app.get('/contacts', (req, res) =>
    contacts.find().toArray().then(data => res.send(data))
) 
  
app.post('/contacts', (req, res) => {
    let contact = req.body

    contacts.insertOne(contact).then(result => {
        contact._id = result.insertedId
        res.status(201).send(contact)
    }).catch(err => {
        console.log(err)
        res.status(500).send(err)
    })
})

app.put('/contacts/:_id', (req, res) => {
    let _id = req.params._id
    let contact = req.body

    contacts.findOneAndReplace({_id}, contact).then(result => res.send(result))
})

app.delete('/contacts/:id', (req, res) => {
    let _id = req.params._id
    contacts.deleteOne({_id}).then(result => res.sendStatus(200))
})

app.get('*', (req, res) =>
    res.sendFile(__dirname + '/index.html')
)

app.listen(process.env.PORT || 9000)