const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ndta.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function run() {
	try {
		await client.connect();
		const database = client.db('emaJhonShop');
		const productCollection = database.collection('products');
		const orderCollection = database.collection('order');

		app.get('/', (req, res) => {
			res.send('Running Genius Server');
		});

		//GET Products API
		app.get('/products', async (req, res) => {
			const cursor = productCollection.find({});
			const page = req.query.page;
			const size = parseInt(req.query.size);
			let products;
			const count = await cursor.count();
			if (page) {
				products = await cursor
					.skip(page * size)
					.limit(size)
					.toArray();
			} else {
				products = await cursor.toArray();
			}
			res.send({
				count,
				products,
			});
		});
		//POST API
		app.post('/products/bykeys', async (req, res) => {
			const keys = req.body;
			const query = { key: { $in: keys } };
			const products = await productCollection.find(query).toArray();

			res.send(products);
		});
		//Order POST
		app.post('/orders', async (req, res) => {
			const order = req.body;
			const result = await orderCollection.insertOne(order);
			res.send(result);
		});
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('Running ema-jhon-server');
});

app.listen(port, () => {
	console.log('Running ema-jhon-server on port', port);
});
