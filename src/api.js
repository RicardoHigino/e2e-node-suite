const express = require('express')
const { join } = require('path')
const CarService = require('./service/carService')


const app = express()
app.use(express.json())


const carsDatabase = join(__dirname, '../database', "cars.json")
const carService = new CarService({
  cars: carsDatabase
})


// curl -i -X POST --data '{ "id": "34da2ec7-6c73-4a01-ba0c-887d8456c6ec", "name": "Extended Cab Pickup", "carIds": [ "ea811e0e-ef5c-4a51-bdd4-b5959f01569d", "d9bd1f10-f898-45ab-bbb1-f1e337a602c4", "48eeafc1-f63c-4f82-9431-bdd6a582a32b" ], "price": "31.16"}' -H "Content-type: application/json" localhost:3000/available-car
app.post('/available-car', async (req, res) => {
  try {
    const carCategory = req.body;
  
    if (!carCategory.id || !carCategory.name || carCategory.carIds.length < 0) {
      return res.status(400).send("Invalid fields!")
    };
  
    const availableCar = await carService.getAvailableCar(carCategory)
  
    if (!availableCar) {
      return res.status(404).send("Car not found!")
    }
  
    res.status(200).send(availableCar)
  } catch (err) {
    return res.status(500).send("Internal server error!")
  }
})

// curl -i -X POST --data '{ "customer": {"id": "5589b6e9-cc66-4e2e-a56f-3c299495ae28", "name": "Ms. Bruce Boyle", "age": 32}, "carCategory": { "id": "34da2ec7-6c73-4a01-ba0c-887d8456c6ec", "name": "Extended Cab Pickup", "carIds": [ "ea811e0e-ef5c-4a51-bdd4-b5959f01569d", "d9bd1f10-f898-45ab-bbb1-f1e337a602c4", "48eeafc1-f63c-4f82-9431-bdd6a582a32b" ], "price": "31.16"}, "numberOfDays": 5}' -H "Content-type: application/json" localhost:3000/final-amount
app.post('/final-amount', async (req, res) => {
  try {
    const {customer, carCategory, numberOfDays} = req.body;

    if (!customer || !carCategory || !numberOfDays) {
      return res.status(400).send("Invalid fields!")
    };

    const finalAmount = carService.calculateFinalPrice(customer, carCategory, numberOfDays)

    if (!finalAmount) {
      return res.status(404).send("Final amount not found!")
    }

    res.status(200).send(finalAmount)
  } catch (err) {
    return res.status(500).send("Internal server error!")
  }
})

// curl -i -X POST --data '{ "customer": {"id": "5589b6e9-cc66-4e2e-a56f-3c299495ae28", "name": "Ms. Bruce Boyle", "age": 32}, "carCategory": { "id": "34da2ec7-6c73-4a01-ba0c-887d8456c6ec", "name": "Extended Cab Pickup", "carIds": [ "ea811e0e-ef5c-4a51-bdd4-b5959f01569d", "d9bd1f10-f898-45ab-bbb1-f1e337a602c4", "48eeafc1-f63c-4f82-9431-bdd6a582a32b" ], "price": "31.16"}, "numberOfDays": 5}' -H "Content-type: application/json" localhost:3000/transaction-receipt
app.post('/transaction-receipt', async (req, res) => {
  try {
    const {customer, carCategory, numberOfDays} = req.body;

    if (!customer || !carCategory || !numberOfDays) {
      return res.status(400).send("Invalid fields!")
    };

    const transaction = await carService.rent(customer, carCategory, numberOfDays)

    if (!transaction) {
      return res.status(404).send("Transaction receipt not found!")
    }

    res.status(200).send(transaction)
  } catch (err) {
    return res.status(500).send("Internal server error!")
  }
})


const server = app.listen(3000, () => {
  console.log(`Server is running on port ${3000}`)
})

module.exports = server;