const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5001;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fiuga7j.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('onlineTutor').collection('services');

        app.get('/services', async(req, res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        }); 

        app.get('/services/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })


    }
    finally{

    }
}

run().catch(err => console.error(err))


app.get('/', (req, res)=>{
    res.send('online-tutor-web-server is running')
});


app.listen(port, ()=>{
    console.log(`tutor port running ${port}`);
})