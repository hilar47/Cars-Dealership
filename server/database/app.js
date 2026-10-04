const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');

const Reviews = require('./review');
const Dealerships = require('./dealership');

const app = express();
const port = process.env.PORT || 3030;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';

app.use(cors());
app.use(express.json());

const reviewsData = JSON.parse(fs.readFileSync('data/reviews.json', 'utf8'));
const dealershipsData = JSON.parse(fs.readFileSync('data/dealerships.json', 'utf8'));

async function seedDatabase() {
  await Reviews.deleteMany({});
  await Reviews.insertMany(reviewsData.reviews);
  await Dealerships.deleteMany({});
  await Dealerships.insertMany(dealershipsData.dealerships);
  console.log('Database seeded: ' + dealershipsData.dealerships.length + ' dealerships, ' +
    reviewsData.reviews.length + ' reviews');
}

mongoose.connect(mongoUrl, { dbName: 'dealershipsDB' })
  .then(seedDatabase)
  .catch((error) => console.error('Database startup error:', error));

// Express route to home
app.get('/', (req, res) => {
  res.send('Welcome to the Mongoose API');
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    res.json(await Reviews.find({}, { _id: 0, __v: 0 }));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Fetch reviews for one dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    res.json(await Reviews.find({ dealership: id }, { _id: 0, __v: 0 }));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Fetch all dealers
app.get('/fetchDealers', async (req, res) => {
  try {
    res.json(await Dealerships.find({}, { _id: 0, __v: 0 }).sort({ id: 1 }));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealers' });
  }
});

// Fetch dealers by state (full name, e.g. Kansas, or abbreviation, e.g. KS)
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const query = { $or: [{ state: new RegExp('^' + escapeRegex(state) + '$', 'i') },
      { st: new RegExp('^' + escapeRegex(state) + '$', 'i') }] };
    res.json(await Dealerships.find(query, { _id: 0, __v: 0 }).sort({ id: 1 }));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealers' });
  }
});

// Fetch a dealer by id
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    res.json(await Dealerships.find({ id: id }, { _id: 0, __v: 0 }));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealer' });
  }
});

// Insert a review
app.post('/insert_review', async (req, res) => {
  try {
    const data = req.body || {};
    const latest = await Reviews.findOne().sort({ id: -1 });
    const newId = latest ? latest.id + 1 : 1;
    const review = new Reviews({
      id: newId,
      name: data.name,
      dealership: data.dealership,
      review: data.review,
      purchase: data.purchase,
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: data.car_year
    });
    const saved = await review.save();
    res.json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.listen(port, () => {
  console.log('Server is running on http://localhost:' + port);
});
