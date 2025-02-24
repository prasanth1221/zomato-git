const mongoose  = require('mongoose')
const fs = require('fs')

const uri = "mongodb+srv://Prasanthbhumula:7zl8LEArv0NKaLov@cluster0.pslda.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const restaurantSchema = new mongoose.Schema({}, { strict: false });
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

fs.readFile('merged_data.json', 'utf-8', async (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    console.log('mongo atlas connected');
    await Restaurant.insertMany(jsonData);
    console.log('Data successfully inserted into MongoDB Atlas');
    mongoose.connection.close();
} catch (error) {
  console.error('Error inserting data into MongoDB:', error);
}
});