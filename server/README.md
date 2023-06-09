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
* AWS account with IAM access credentials and AWS CLI setup

### Set the following GitHub secrets in the repository:

* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY

### Build the React frontend locally and move to the server/ directory:

```shell
npm build
mv build/ server/
```

### Push changes to the remote repository

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
2. Go to Actions > build_and_deploy_service
3. Run the workflow

On completion, check the URL included in the final JSON output on the GitHub Actions web page
or run the `get-container-services` command from before in a local terminal.

This URL is where the website will be hosted (it may take a few minutes to go live).

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


---

## Updating the _graphquest_ package

This section is for use by developers working on the GraphQuest project.

### In the graphquest directory, do the following:

1. Activate the virtual environment:

```shell
$ source env/bin/activate
```

2. Update the version in pyproject.toml
3. Build the server:

```shell
$ python3 -m build
```

4. Push to the PyPi repository:

```shell
$ python3 -m twine upload --skip-existing --repository testpypi dist/*
```

Use `__token__` as the username and your PyPi token as the password.

### In the server directory, do the following:

1. Activate the virtual environment:

```shell
$ source venv/bin/activate
```

2. Install the latest version of GraphQuest, replacing the version number:

```shell
$ pip install -i https://test.pypi.org/simple/ graphquest==1.0.2 
```
