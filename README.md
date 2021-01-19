# Scuffed Passwords
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
![docker-compose-build-actions-workflow](https://github.com/k-piekarczyk/scuffed-passwords/workflows/docker-compose-build-actions-workflow/badge.svg?branch=main)

An app to store your passwords (don't really do it, the app is more than likely very scuffed and held together with duct tape, rubber bands and fairy dust) very securely!

## Instructions
To run, just use `docker-compose up --build`. You need to be patient, since nginx needs to generate it's certificates,
and generating a 4096 bit prime for a Diffie–Hellman key exchange takes some time.

If you want to restart the app, you need to use `docker-compose down` and `docker volume prune` to remove the database
volume, because if it's present, it will crash on startup (kinks to work out in applying migrations).

### Important
Keep the logs open, do not detach the docker-compose service, because activation and password recovery tokens are
printed to the console, due to the lack of email integration.