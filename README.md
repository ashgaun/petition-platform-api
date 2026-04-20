# Petition Platform API

REST API for a petition platform built with Node.js, Express, TypeScript, and MySQL. This project demonstrates backend application design across authentication, request validation, relational data modelling, media handling, and API documentation in a structured service-oriented codebase.

## Overview

The API supports user registration and authentication, petition creation and management, supporter tier workflows, petition support records, and image upload endpoints for users and petitions. It is designed as a backend portfolio project that showcases practical Express application structure, SQL-backed persistence, validation, and file handling.

## Key Features

- User registration, login, logout, and profile management
- Petition creation, retrieval, update, and deletion
- Support tier management for petitions
- Petition supporter and contribution workflows
- User and petition image upload and retrieval endpoints
- JSON schema validation with AJV
- MySQL-backed persistence with a modular model/controller/route structure
- Structured application logging with Winston

## Tech Stack

- Node.js
- Express
- TypeScript
- MySQL
- AJV
- Winston

## Project Structure

```text
.
|-- src/
|   |-- app/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- resources/
|   |   `-- routes/
|   |-- config/
|   `-- server.ts
|-- postman/
|-- storage/
|-- api_spec.yaml
|-- package.json
`-- tsconfig.json
```

## Local Setup

### Prerequisites

- Node.js and npm
- A MySQL server you can connect to locally or remotely
- A database user with permission to create tables and insert data

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root using `.env.example` as the template.

3. Create an empty MySQL database matching the name in your `.env` file.

4. Initialize the database schema using [src/app/resources/create_database.sql](/c:/Users/ashut/OneDrive/Documents/UC/2024 semester 1/SENG 365/SENG 365 code/assignment1/aga124/src/app/resources/create_database.sql).

5. Start the API:

```bash
npm run start
```

The API runs on `http://localhost:4941` by default.

## Environment Variables

Create a `.env` file in the root directory with values similar to the following:

```env
SENG365_MYSQL_HOST=localhost
SENG365_MYSQL_PORT=3306
SENG365_MYSQL_USER=your_mysql_username
SENG365_MYSQL_PASSWORD=your_mysql_password
SENG365_MYSQL_DATABASE=your_database_name
PORT=4941
```

## Available Scripts

- `npm run build` compiles TypeScript into `dist/`
- `npm run start` builds the project and starts the API server

## API Testing

- [api_spec.yaml](/c:/Users/ashut/OneDrive/Documents/UC/2024 semester 1/SENG 365/SENG 365 code/assignment1/aga124/api_spec.yaml) documents the available endpoints and payloads
- Use the OpenAPI specification with your preferred API client or testing workflow to validate requests locally against `http://localhost:4941/api/v1`
- Seed and media assets in `storage/default/` can be used to prepare a local demo environment if you want realistic sample data

## Notes

- `.env`, `node_modules/`, build artifacts, logs, and generated runtime files should not be committed
- `storage/default/` contains demo assets used by the project and is intentionally tracked
- The codebase is organized around routes, controllers, and models to keep HTTP concerns, business logic, and data access separate
