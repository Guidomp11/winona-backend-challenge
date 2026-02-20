# Winona Backend Challenge

## Setup

This is a NestJS application.

Please clone the repository and run the following commands:

1. `npm install` to install the dependencies  
2. `npm run start:dev` to start the development server

The server will start at `http://localhost:3000`.

## Stack

This application is built with NestJS and uses TypeORM with a SQLite database.  
It exposes an OpenAPI specification at `http://localhost:3000/api` when the server is running.

## Tasks

1. Add API endpoints to manage patients. A patient can have prescriptions for medications.
2. Document the API using an OpenAPI specification.
3. Write unit and end-to-end (e2e) tests for the implemented features.
4. Add pagination to listing endpoints.
