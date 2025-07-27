# Welcome
Welcome to the DnD Interactive App Repo
# Setup
## VM Setup
## Repo Setup
## Discord Developer

# Build/Testing
Building and testing involves getting a few components connected and running. After following
setup instructions you need to setup the Docker containers, Frontend, Backend, and sync that
all up with discord developer.
## Frontend
For executing commands related to the Frontend you will want to be in the /Dnd-Interactive-Frontend
directory. All commands described in this section will be run in that directory unless otherwise
specified.
To build the Frontend, run
'''npm run build'''

To start the Frontend for testing, run
''' npm run dev '''

## Backend
For executing commands related to the Backend you will want to be in the /Dnd-Interactive-Backend
directory. All commands described in this section will be run in that directory unless otherwise
specified.
To build the Backend, run
'''npm run build'''

To start the Backend for testing, run
''' npm run start '''

## Docker
There are several Docker commands that are used during the setup, building, and testing of this
application. This section will list some of the common ones that are used and what they are used
for. The commands listed in this section will need to be run from the root directory of the repo
unless otherwise specified.

To start up the persistent storages(DB, S3 bucket, and admin pages) for the app run
''' docker-compose docker-compose.persistence.yml up -d'''

To shut down the persistent storages(DB, S3 bucket, and admin pages) for the app run
''' docker-compose docker-compose.persistence.yml down '''

To check the current status of docker containers that are running you can run:
''' docker ps '''

docker-compose.cf.yml is used for a cloudflare tunnel and is how you can access the application remotely.

To stop and remove the cloudflare containers
''' docker-compose -f docker-compose.cf.yml down '''

To start and run the containers
''' docker-compose -f docker-compose.cf.yml up -d '''

To display the URL that needs to be added to discord developer.
''' docker logs cloudflared-dev-frontend '''

To display the URL that needs to be added to discord developer. This one is for the '/colyseus' endpoint
''' docker logs cloudflared-dev-backend '''



## Discord Developer

