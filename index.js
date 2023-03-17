const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5001;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fiuga7j.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message: 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next()
    })
}


async function run(){
    try{
        const serviceCollection = client.db('onlineTutor').collection('services');
        const ordersCollection = client.db('onlineTutor').collection('orders');

        app.post('/jwt', (req, res)=>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
            res.send({token});
        })


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
        });

        app.get('/orders', verifyJWT, async(req, res)=>{
            const decoded = req.decoded;
            console.log('inside',decoded)
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }

            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })

        app.post('/orders', async(req, res)=>{
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        });

        app.delete('/orders/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
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