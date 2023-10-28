const { describe, it, after, before } = require('mocha')
const supertest = require ('supertest')
const faker = require('faker')
const sinon = require('sinon')
const { join } = require('path')
const { expect } = require('chai')
const CarService = require('./../../src/service/carService')
const Transaction = require('./../../src/entities/transaction')

const carsDatabase = join(__dirname, './../../database', "cars.json")

const mocks = {
  validCarCategory: require('./../mocks/valid-carCategory.json'),
  validCar: require('./../mocks/valid-car.json'),
  validCustomer: require('./../mocks/valid-customer.json')
}

describe('API Suite Tests', () => {
  let carService = {};
  let sandbox = {};
  let app;
  
  before((done) => {
    carService = new CarService({
      cars: carsDatabase
    });
    app = require('../../src/api');
    app.once('listening', done);
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  after((done) => {
    app.close(done)
  })

  describe('/available-car', () => {
    it('Given a carCategroy it should return an available car and HTTP status 200', async () => {
      const car = mocks.validCar
      const carCategory = mocks.validCarCategory

      carCategory.carIds = [car.id]

      sandbox.stub(
        carService.carRepository,
        carService.carRepository.find.name,
      ).resolves(car)

      const response = await supertest(app)
      .post('/available-car')
      .send(carCategory)
      .expect(200)

      const expected = JSON.stringify(car)
      expect(response.text).to.be.deep.equal(expected)
    })

    it('Given a invalid carCategroy it should return an HTTP status 400', async () => {
      await supertest(app)
      .post('/available-car')
      .send(null)
      .expect(400)
    })

    it('Given a carCategroy with invalid car it should return an HTTP status 404', async () => {
      const carCategory = mocks.validCarCategory
      carCategory.carIds = [faker.datatype.uuid()]

      await supertest(app)
      .post('/available-car')
      .send(carCategory)
      .expect(404)
    })
  })

  describe('/final-amount', () => {
    it('Given a carCategory, customer and numberOfDays it should calculate final amount in real and HTTP status 200', async () => {
      const customer = mocks.validCustomer
      customer.age = 50
  
      const carCategory = mocks.validCarCategory
      carCategory.price = 37.6
  
      const numberOfDays = 5

      sandbox.stub(
        carService,
        "taxesBasedOnAge"
      ).get(() => [{ from: 40, to: 50, then: 1.3 }])

      const expected = carService.currencyFormat.format(244.40)

      const response = await supertest(app)
      .post('/final-amount')
      .send({customer, carCategory, numberOfDays})
      .expect(200)

      expect(response.text).to.be.deep.equal(expected)
    })

    it('Given a bad request it should return an HTTP status 400', async () => {
      await supertest(app)
      .post('/final-amount')
      .send(null)
      .expect(400)
    })

    it('Given a customer with invalid age it should return an HTTP status 404', async () => {
      const customer = mocks.validCustomer
      customer.age = 0
  
      const carCategory = mocks.validCarCategory
      carCategory.price = 0
  
      const numberOfDays = 1

      await supertest(app)
      .post('/final-amount')
      .send({customer, carCategory, numberOfDays})
      .expect(404)
    })
  })

  describe('/transaction-receipt', () => {
    it('Given a customer an a car category it should return a transaction receipt and HTTP status 200', async () => {
      const car = mocks.validCar;
      const carCategory =  {
        ...mocks.validCarCategory,
        price: 37.6,
        carIds: [car.id]
      }

      const customer = mocks.validCustomer
      customer.age = 20
  
      const numberOfDays = 5
      const dueDate = "10 de novembro de 2020"
  
      const now = new Date(2020, 10 ,5)
      sandbox.useFakeTimers(now.getTime())
      // age: 20, tax: 1.1, categoryPrice: 37.6
      // 37.6 * 1.1 = 41.36 * 5 days = 206.8
      sandbox.stub(
        carService.carRepository,
        carService.carRepository.find.name,
      ).resolves(car)

      const expectedAmount = carService.currencyFormat.format(206.80)

      const response = await supertest(app)
      .post('/transaction-receipt')
      .send({customer, carCategory, numberOfDays})
      .expect(200)

      const expected = JSON.stringify(
        new Transaction({
          customer,
          car,
          dueDate,
          amount: expectedAmount,
        })
      )

      expect(response.text).to.be.deep.equal(expected)
    })
    
    it('Given a bad request it should return an HTTP status 400', async () => {
      await supertest(app)
      .post('/transaction-receipt')
      .send(null)
      .expect(400)
    })

    it('Given a customer with invalid age it should return an HTTP status 404', async () => {
      const customer = mocks.validCustomer
      customer.age = 10
  
      const carCategory = mocks.validCarCategory
      carCategory.price = 37.6
  
      const numberOfDays = 5

      await supertest(app)
      .post('/transaction-receipt')
      .send({customer, carCategory, numberOfDays})
      .expect(404)
    })
  })
})