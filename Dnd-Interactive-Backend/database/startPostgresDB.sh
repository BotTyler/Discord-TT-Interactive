#!/bin/bash

docker run --rm --name dnd-postgres -e POSTGRES_PASSWORD=password -d -v postgres-db:/var/lib/postgresql/data -p 5432:5432 postgres
docker run --rm --name pgadmin-container -p 5050:80 -e PGADMIN_DEFAULT_EMAIL=tyler2.jarboe@gmail.com -e PGADMIN_DEFAULT_PASSWORD=password -v pgadmin-data:/var/lib/pgadmin -d dpage/pgadmin4
docker run --rm --name minio-files -p 9002:9000 -p 9001:9001 -d -e MINIO_ROOT_USER=tyler2.jarboe@gmail.com -e MINIO_ROOT_PASSWORD=password -v minioFiles:/data minio/minio server /data --console-address ":9001"
