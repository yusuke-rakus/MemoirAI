FROM node:22-bookworm

WORKDIR /firebase

# Install Java runtime needed by Firebase emulators and firebase-tools once at build time
RUN apt-get update \
  && apt-get install -y --no-install-recommends wget gnupg ca-certificates \
  && wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public \
    | gpg --dearmor > /usr/share/keyrings/adoptium.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb bookworm main" \
    > /etc/apt/sources.list.d/adoptium.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends temurin-21-jre \
  && npm install -g firebase-tools \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

