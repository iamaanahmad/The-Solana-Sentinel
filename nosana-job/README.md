# Nosana Job for Solana Sentinel

This directory contains everything you need to build and deploy your sentiment analysis job to the Nosana Network.

## Step-by-Step Deployment Guide

**Prerequisites:**
1.  **Docker Installed:** You must have Docker running on your machine.
2.  **Nosana CLI Installed & Configured:** You have run `npm install -g @nosana/cli` and configured your wallet with `nosana wallet init`.
3.  **Docker Hub Account:** You need a Docker Hub account to store your container image.

---

### Step 1: Build the Docker Image

First, you need to build the Docker image that contains your Python script and its dependencies.

In your terminal, navigate to this `nosana-job` directory and run the following command. Replace `your-docker-hub-username` with your actual Docker Hub username.

```bash
docker build -t ashqking/solana-sentinel-sentiment:v1 .
```

### Step 2: Push the Image to Docker Hub

Next, upload the image you just built to Docker Hub. This makes it accessible to the Nosana Network.

```bash
docker push ashqking/solana-sentinel-sentiment:v1
```
*(If you are not already, you may need to run `docker login` first.)*

### Step 3: Update `nosana.json`

Open the `nosana.json` file in this directory. Find the `image` field and replace the placeholder with the full name of the image you just pushed.

```json
{
    ...
    "job": {
        ...
        "image": "ashqking/solana-sentinel-sentiment:v1"
    }
}
```

### Step 4: Deploy the Job to Nosana

Now you're ready to deploy the job! Run the following command from this `nosana-job` directory:

```bash
nosana job publish
```

The CLI will read your `nosana.json` file and deploy the job. If successful, it will output a **Job Address** (which is your Job ID). It will look something like this: `job-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

### Step 5: Update Your Environment File

Copy the **Job Address** from the previous step. Open the `.env` file in the root of your project and paste the address as the value for `NOSANA_JOB_ID`.

```env
HELIUS_API_KEY="..."
NOSANA_JOB_ID="job-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" # <-- PASTE YOUR ID HERE
```

---

**That's it!** Your application is now fully configured to use your custom, live sentiment analysis job running on the Nosana Network.
