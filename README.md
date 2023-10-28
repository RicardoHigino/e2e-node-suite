# This repository contains the source code for a simple Node.js API for car rental management created for the purpose of end-to-end (E2E) testing studies.


## Installation
1. Clone the repository to your local machine using git clone.
2. Navigate to the project directory: cd renting-car.
3. Install dependencies using npm install.

## Usage
- Start the API server: npm start. The server will run at http://localhost:3000.
  
## Available Scripts
- Run API Tests: npm run test:api. This script runs Mocha tests located in **/**/api.test.js.
- Run Service Tests: npm run test:service. This script runs Mocha tests for car service logic located in **/**/carService.test.js.
- Generate Test Coverage Report: npm run test:cov. This script generates a test coverage report using NYC and Mocha.
- Seed Data: npm run seed. This script seeds the database with initial data using seed.js.

## Dependencies
- Express: Fast, unopinionated, minimalist web framework for Node.js.
- Mocha: Feature-rich JavaScript test framework running on Node.js and in the browser.
- Chai: BDD/TDD assertion library for Node.js and browsers.
- Sinon: Standalone test spies, stubs, and mocks for JavaScript.
- Supertest: SuperAgent driven library for testing HTTP servers.
