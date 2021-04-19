# SBE-Server

  SBE stands for SponsorBlockExplorer

## Usage

### Without Docker

 Rename `.env.example` to `.env` and edit content

### With Docker

  Use the enviroment variables in `.env.example`

### Docker compose example

    version: "3.8"
    services:
      api:
        build:
          context: .
          target: production
        volumes:
          - ./src:/usr/src/app/src
          - /home/user/public_config.json:/usr/src/app/public_config.json
        ports:
          - "127.0.0.1:8081:8080"
        environment:
          WEB_HOST: 127.0.0.1
          WEB_PORT: 8080
          DEFAULT_ITEM_LIMIT: 100
          POSTGRES: postgres://test:test@postgres:5432/sponsorTimes
      postgres:
        image: postgres
        environment:
          - POSTGRES_USER=test
          - POSTGRES_PASSWORD=test
          - POSTGRES_DB=sponsorblock
        ports:
          - "5432:5432"
        volumes:
          - /home/user/sponsorblock/data:/var/lib/postgresql/data
