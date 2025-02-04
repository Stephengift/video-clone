Project Overview - Video Clone
The aim of this project is to list videos, enable sign in/out, upload, and watch transcoded videos. The tech stack will be explained as the project grows.

First Week – Setting up Video Processing Service
Tech Stack: FFmpeg, Docker, Express.js, TypeScript

FFmpeg
FFmpeg is a Node.js wrapper that allows users to process videos locally. I am using FFmpeg to transcode videos to 360p.

Docker
The aim of this project is to integrate it with Google Cloud Run for development. Deploying to Google Cloud Run can be challenging without Docker. Docker is a container that allows me to package my application with all its dependencies. This ensures that the application can run on any system with Docker installed. I will develop my project locally and deploy it to Google Cloud Run using Docker.

Key Files
Storage.ts: Contains all the code that interacts with Google Cloud Storage.
Index.ts: Contains all the code that interacts with local directories while processing videos from Google Cloud.

Week 2
This week, I hosted my video processing service on Google Cloud Run. Google Cloud Run is a fully managed serverless container platform. Below are the services I am using and what I aim to achieve:

Google Cloud Run
Google Cloud Run is a fully managed serverless container platform that helps with managing servers and scaling our services.

Artifact Registry
Artifact Registry is where I uploaded my local Docker image. This created an instance of my container, so I did not have to push my code manually.

Pub/Sub
Pub/Sub is a messaging service that allows me to send messages between different services. I am using different services for my project, and Pub/Sub helps me accomplish this.

Buckets
Just as we have folders for storing files on our personal machines, Google Cloud uses buckets to store objects (videos) uploaded to cloud storage.

Current Buckets
Raw-videos: Currently private for processing videos. Users can upload videos to this bucket.
Processed-videos: Public bucket for users to view the processed 360p videos.
