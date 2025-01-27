//Storage layer

import {Storage} from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { rejects } from 'assert';

//create an instance
const storage = new Storage();

//google-storage
//where users will upload vidoes--server download
const rawVideoBucketName = "ga-raw-videos";
//where developer will process--upload the processed version
const processedVideoBucketName = "ga-processed-videos";

//localhost
//holds the directory path where raw video files are stored
const localRawVideoPath = "./raw-videos";
//when we process videos
const localProcessedVideoPath = "./processed-videos";

/**
 * Creates local directories for raw and processed vidoes
 */
export function setupDirectories(){
    ensureDirectoryExcistence(localRawVideoPath);
    ensureDirectoryExcistence(localProcessedVideoPath);
}


/**
 * 
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}
 * @param processVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processVideoName: string) {
    return new Promise<void>((resolve, reject) => {
      ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360") // 360p
        .on("end", () => {
          console.log("Video processing finished.");
          resolve();
        })
        .on("error", (err, stdout, stderr) => {
          console.error("An error occurred during video processing:");
          console.error(`Error Message: ${err.message}`);
          console.error(`stdout:\n${stdout}`);
          console.error(`stderr:\n${stderr}`);
          reject(err);
        })
        .save(`${localProcessedVideoPath}/${processVideoName}`);
    });
  }

/**
 * 
 * @param fileName - The name of the file to download from the
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded
 */
export async function downloadRawVideo(fileName: string){
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({destination: `${localRawVideoPath}/${fileName}`});

    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
    )
}

/**
 * 
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} bucket into the {@link processedVideoBucketName} folder.
 * @returns A promise that resolves when the file has been uploaded
 */
export async function uploadProcessedVideo(fileName: string){
    const bucket = storage.bucket(processedVideoBucketName);

    await storage.bucket(processedVideoBucketName)
        .upload(`${localProcessedVideoPath}/${fileName}`,{
        destination: fileName
    });
    console.log(
       `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`
    )

    await bucket.file(fileName).makePublic();
}

/**
 * 
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder
 * @returns A new promise that resolves when the file has been deleted
 */
export function deleteRawVideo(fileName: string){
    return deleteFile(`${localRawVideoPath}/${fileName}`);

}

/**
 * 
 * @param fileName - The name of the file to delete from the
 * {@link localProcessedVideoPath} folder
 * @returns A new promise that resolves when the file has been deleted
 */
export function deleteProcessedVideo(fileName: string){
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * 
 * @param filePath - The path of the file to be deleted.
 * @returns A promise that resolves when the file has been deleted
 */
function deleteFile(filePath: string): Promise<void>{
    return new Promise((resolve,reject) =>{
        if(fs.existsSync(filePath)){
            fs.unlink(filePath, (err) =>{
                if(err){
                    console.log(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                }else{
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            })
        }else{
            console.log(`File not found at ${filePath}, skipping the delete`);
            reject(new Error(`File not found at ${filePath}`));
        }
    })
    
}

/**
 * Ensures a directory exists
 * @param dirPath - The path to be checked
 */
function ensureDirectoryExcistence(dirPath: string){
    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, {recursive: true});
        console.log(`Directory created at ${dirPath}`);
    }
}