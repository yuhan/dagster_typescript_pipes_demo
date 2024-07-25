
FROM python:3.12

# Install node
RUN apt update
RUN apt-get install -y curl;
RUN curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
RUN chmod +x ./nodesource_setup.sh
RUN ./nodesource_setup.sh
RUN apt-get install -y nodejs

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy requirements.txt to the working directory
COPY requirements.txt ./

RUN pip3 install -r requirements.txt

# Copy the rest of the project files to the working directory
COPY . .

# Compile the TypeScript files
RUN npm run build

