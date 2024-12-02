const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const port = process.env.PORT || 5000

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174',],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json());
//ManageNest
// dICkfx0ZRov3mN8K



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrsyrpr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const apartmentsCollection = client.db('manageNest').collection('apartments')


    app.get('/apartments', async (req, res) => {
      const result = await apartmentsCollection.find().toArray();
      res.send(result);

    });
    app.get('/apartments/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await apartmentsCollection.findOne(query);
      res.send(result);
  });
  app.put('/apartments/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    const query = { _id: new ObjectId(id) };
    const update = { $set: updatedData };
    const result = await apartmentsCollection.updateOne(query, update);
    res.send(result);
});


  
    // Connect the client to the server	(optional starting in v4.7)
    // 
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('website is running')
  })
  
  app.listen(port, () => {
    console.log(`website is running on port ${port}`)
  })


