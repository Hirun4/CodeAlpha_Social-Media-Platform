const mongoose = require('mongoose');
const Tag = require('../models/Tag');

const tags = [
  "music", "sports", "news", "travel", "food", "fashion", "art", "technology", "science", "movies",
  "books", "fitness", "health", "nature", "photography", "gaming", "education", "history", "politics", "finance",
  "business", "startup", "coding", "programming", "javascript", "python", "java", "csharp", "webdev", "design",
  "architecture", "interior", "diy", "crafts", "parenting", "relationships", "love", "friendship", "pets", "dogs",
  "cats", "animals", "wildlife", "environment", "climate", "space", "astronomy", "astrology", "cars", "motorcycles",
  "biking", "cycling", "running", "hiking", "camping", "fishing", "hunting", "gardening", "cooking", "baking",
  "recipes", "vegan", "vegetarian", "meat", "seafood", "desserts", "coffee", "tea", "wine", "beer",
  "cocktails", "bars", "restaurants", "hotels", "resorts", "beach", "mountains", "citylife", "countrylife", "adventure",
  "luxury", "budgettravel", "roadtrip", "backpacking", "study", "university", "college", "school", "math", "physics",
  "chemistry", "biology", "engineering", "robotics", "ai", "machinelearning", "datascience", "blockchain", "crypto", "nft",
  "investing", "stocks", "realestate", "marketing", "advertising", "branding", "socialmedia", "influencer", "blogging", "vlogging",
  "youtube", "tiktok", "instagram", "facebook", "twitter", "snapchat", "linkedin", "podcast", "radio", "tv",
  "anime", "manga", "comics", "cartoons", "drawing", "painting", "sculpture", "dance", "theatre", "opera",
  "classical", "rock", "pop", "jazz", "hiphop", "edm", "metal", "countrymusic", "folk", "reggae",
  "kpop", "jpop", "indie", "concerts", "festivals", "events", "holidays", "christmas", "halloween", "easter",
  "valentines", "wedding", "birthday", "anniversary", "shopping", "sales", "deals", "gadgets", "apps", "mobile"
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://hirun08072002:e0GYj3x8vz1BfNQN@cluster0.17zgtnv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  for (const name of tags) {
    await Tag.updateOne({ name }, { name }, { upsert: true });
  }
  console.log('Tags seeded!');
  process.exit();
}

seed();