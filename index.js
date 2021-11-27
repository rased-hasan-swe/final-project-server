const express = require('express')
const app = express()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const {MongoClient}=require('mongodb');

const port = process.env.PORT || 5000;
// midleware set 
app.use(cors());
app.use(express.json());
var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.kess7.mongodb.net:27017,cluster0-shard-00-01.kess7.mongodb.net:27017,cluster0-shard-00-02.kess7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-p73rme-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);
async function run(){
      try{
        await client.connect();
        console.log('connected to the database');
        const database = client.db('finaldb');
        const servicesCollection = database.collection('products');
        const orderCollection = database.collection('orderData');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('review');
        // get data
        app.get('/products',async(req,res)=>{
            const cursor = servicesCollection.find({});
            const services =await cursor.toArray();
            res.send(services);
        })

        // post api 
        app.post('/products',async (req,res)=>{
            const service = req.body;
            console.log('hit the api',service);
            const result = await servicesCollection.insertOne(service);
           // console.log(result);
            res.json(result);
        })

        //get orderData 
        app.get('/orderData',async(req,res)=>{
            //res.send('hit it bro bro hit it ');
            const cursor = orderCollection.find({});
            const order = await cursor.toArray()
            res.send(order);
          
        })
        //add orderData 

        app.post('/orderData',async(req,res)=>{
            const result = await orderCollection.insertOne(req.body);
            res.json(result);
        })

        
        //status update
        app.put('/updateStatus/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body.status;
            const filter = { _id: ObjectId(id) };
            const result = await orderCollection.updateOne(filter, {
                $set: { status: updatedStatus },
            });
            res.json(result);
        })
         
        // post review
        app.post('/review',async(req,res)=>{
            const result = await reviewCollection.insertOne(req.body);
            res.json(result);
        })
        // get  review 
         app.get('/review',async(req,res)=>{
             const cursor = reviewCollection.find({});
             const review = await cursor.toArray()
             res.json(review);
         })
        //get user
        app.get('/users/:email',async(req,res)=>{
            const email = req.params.email;
            const query = {email:email};
            const user=await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role ==='admin'){
                isAdmin=true;
            }
            res.json({admin: isAdmin});
        })

        // add user 

        app.post('/users',async(req,res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })

        app.put('/users',async(req,res)=>{
            const user = req.body;
            const filter = {email:user.email};
            const options = {upsert:true};
            const updateDoc = {$set:user};
            const result = await usersCollection.updateOne(filter,updateDoc,options);
            res.json(result);
        })
       
        //make admin
        app.put('/users/admin',async(req,res)=>{
            const user=req.body;
            const filter={email:user.email};
            const updateDoc={$set:{role:'admin'}};
            const result = await usersCollection.updateOne(filter,updateDoc);
            res.json(result);
        })
        //delete order
        app.delete('/orderData/:id',async(req,res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const result = await orderCollection.deleteOne(query);
            //console.log('deleting order with id',result);
            res.json(result);
        })

      }
      finally{

      }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('hi server bro')
})

app.listen(port,()=>{
    console.log(`server run at port:${port}`)
})