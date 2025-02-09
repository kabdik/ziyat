# Payment Hub

Payment Hub is a payment processing service designed to manage and streamline online payment operations. 
The service is containerized with Docker and wrapped by Makefile.

**Features**

- Blue-Green Deployment: Ensures zero downtime during updates and new version deployments.
- Comprehensive Health Checks: Regular health checks for all services to ensure smooth operations.
- Integrated with Stripe, RabbitMQ, and PostgreSQL;
- Local and production environment configurations;

## Deployment

### Requirements

- GNU Make;
- Docker;

### General Installation Procedure

1. clone the repository;
2. `cd payment-hub-new` - navigate to the project directory;
3. copy an appropriate `.env` file example;
4. set up the environment variables (ask for the keys, seeds if required, correct local ports);
5. (for local environment) ask for DB seeds;
5. `make` - Makefile will read environment from `NODE_ENV` and use corresponding commands;

### Local Dev Environment
The local development environment can be established by deploying dockerized services with a simple `make` command.

However, it's worth noting that the NodeJS service (payment-hub) may not perform optimally when run within a local Docker container.

To address this, one potential solution is to deploy the project with the NodeJS app running directly on the host machine while keeping other services within Docker containers. This can help improve the performance of the NodeJS service during local development.
For such setup use the `.env.local.ph-at-host` file as an example, but get the DB and RabbitMQ env var values from the `.env.dev` file.

For such setup do the following:
1. install the NodeJS locally without docker;
1. comment the `payment-hub` service in the `docker-compose.local.yml` file;
1. `cp .env.local.ph-at-host .env`
1. set up the environment variables in the `.env` file;
1. `make` - build & run the dockerized services;

Additionally, you will need to ask for DB seeds.


### Available Environments

Set application environment using variable `NODE_ENV`.

- `local` - basic setup without blue/green deployment; `.env` file example: `.env.local.ph-at-host`
- `development` - run tests on dockerized test database; `.env` file example: `.env.dev`
- `production` - tests and fixtures won't be ran; env var values are set in the GitLab;

## Makefile commands

Makefile contains the scripts based on environments, but you can use the `make` commands manually.
Useful commands are listed down below.

**Database Operations**
- `make db-migrate` - migrate database changes;
- `make db-seed` - seed the database;

**Testing**
- `make test` - run tests;
- `make test-e2e` - run functional tests:

**Blue-Green Deployment**
- `make blue-green-deploy` - executes the blue-green deployment script;


