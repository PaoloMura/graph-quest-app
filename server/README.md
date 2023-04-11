# GraphVis Server

## Installation and running in development

Assuming you are using a Unix system, follow the steps below.

### Clone the `graph-vis` repository:

```shell
$ git clone https://github.com/PaoloMura/graph-vis
```

Navigate to the server directory:

```shell
$ cd graph-vis/app/server
```

### Set the `GRAPH_VIS_ENV` environment variable to tell the app to run in development mode.

If using Zsh:
```shell
$ echo 'export GRAPH_VIS_ENV="development"' >> ~/.zshenv
$ source ~/.zshenv
```

If using Bash:
```shell
$ echo 'export GRAPH_VIS_ENV="development"' >> ~/.bash_profile
$ source ~/.bash_profile
```

### Setup a Python virtual environment:

```shell
$ python -m venv venv
```

Activate it:

```shell
$ source venv/bin/activate
```

### To run the server, use:

```shell
$ flask run
```

Or:

```shell
$ python app.py
```

If running from PyCharm, you may need to quit and reopen for the environment variable to be recognised.


---

## Deploying the server (with GitHub Actions)

If you have forked the repo or have push permissions, 
you can use GitHub Actions to automatically deploy the application.

### Prerequisites:

* GitHub account
* Docker Hub account with auth token
* AWS account with IAM access credentials and AWS CLI setup

### Set the following GitHub secrets in the repository:

* DOCKER_AUTH_TOKEN
* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY

### Create a container service in AWS Lightsail:

```shell
$ aws lightsail create-container-service --service-name flask-service --power small --scale 1
```

Wait until it reaches 'READY' state either through the web console or by running:

```shell
$ aws lightsail get-container-services
```

### Run the GitHub Action to build and deploy the app:

1. Go to the GitHub repository in a web browser
2. 

### Cleanup AWS Lightsail resources when done:

```shell
$ aws lightsail delete-container-service --service-name flask-service
```


---

## Deploying the server (manually)

Alternatively, follow the steps below for manual deployment:

### Build the frontend React app:

```shell
$ cd /path/to/graph-vis/app
```

```shell
$ npm run build
```

### Move the build folder to the server directory:

```shell
$ [ -d "server/build/" ] && rm -r server/build/
$ mv build/ server/
```

### Update the `requirements.txt` file:

```shell
$ cd server
$ pip freeze > requirements.txt
```

### Run the Dockerfile to build the Docker image:

This step should be performed on the same platform you intend to host the app on (e.g. Ubuntu).

The Dockerfile instructs the app to run in production environment by setting the environment variable.

```shell
$ docker build -t flask-container .
```

### Verify that the image runs locally:

```shell
$ docker run -p 5000:5000 flask-container
```
