const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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



const uri = `mongodb+srv://ManageNest:dICkfx0ZRov3mN8K@cluster0.nrsyrpr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const userCollection = client.db('manageNest').collection('users');
    const bookedApparmentCollection = client.db('manageNest').collection('bookedApparments');
    const announcementCollection = client.db('manageNest').collection('announcements');
    const cuponCollection = client.db('manageNest').collection('cupons');


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
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email
      const result = await userCollection.findOne({ email })
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })
    app.get('/users/member/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let member = false;
      if (user) {
        member = user?.role === 'member';
      }
      res.send({ member });
    })
    app.post('/bookedAppartment', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await bookedApparmentCollection.insertOne(newProduct)
      res.send(result)
    })

    app.post('/newAnnouncement', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await announcementCollection.insertOne(newProduct)
      res.send(result)
    })
    app.get('/announcements', async (req, res) => {
      const result = await announcementCollection.find().toArray();
      res.send(result);
    });
    app.get('/cupons', async (req, res) => {
      const result = await cuponCollection.find().toArray();
      res.send(result);
    });
    app.post('/newCupons', async (req, res) => {
      const newCupon = req.body;
      console.log(newCupon);
      const result = await cuponCollection.insertOne(newCupon)
      res.send(result)
    })
    app.get('/bookingApartments/:email', async (req, res) => {
      const email = req.params.email;
      const result = await bookedApparmentCollection.find({ ownerEmail: email }).toArray();
      res.status(200).json(result);
    });
    app.get('/acceptedApartments/:email', async (req, res) => {
      const email = req.params.email;
      const result = await bookedApparmentCollection.find({ userEmail: email }).toArray();
      res.status(200).json(result);
    });
    app.get('/coupons/:code', async (req, res) => {
      try {
        const couponCode = req.params.code;
        const coupon = await cuponCollection.findOne({ code: couponCode });

        if (coupon) {
          res.send({
            isValid: true,
            discountPercentage: coupon.discountPercentage
          });
        } else {
          res.send({
            isValid: false,
            discountPercentage: 0
          });
        }
      } catch (error) {
        res.status(500).send({
          isValid: false,
          message: 'Error validating coupon'
        });
      }
    });
    app.put('/updateUserRole/:email', async (req, res) => {
      const userEmail = req.params.email;
      const { role } = req.body;
      const result = await userCollection.updateOne(
        { email: userEmail },
        { $set: { role } }
      );
      res.send(result)
    });
    app.put('/updateRequestStatus/:id', async (req, res) => {
      const requestId = req.params.id;
      const { status } = req.body;
      const result = await bookedApparmentCollection.updateOne(
        { _id: new ObjectId(requestId) },
        { $set: { status } }
      );
      res.send(result)
    });
    app.delete('/deleteRequest/:id', async (req, res) => {
      const id = req.params.id;
      const result = await bookedApparmentCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result)
    });
    app.get('/manageMembers', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    // payment intent
    
    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log(amount, 'amount inside the intent')

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
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


