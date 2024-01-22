import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Rekognition } from '@aws-sdk/client-rekognition';
import dotenv from "dotenv";

const environment = process.env.ENV || "development";
console.log(`Environment is ${environment}`);
dotenv.config({
  path: `./.env.${environment}`,
});


const rekognition = new Rekognition({
  region: process.env.AWS_REGION,
});

async function getImageFilenames() {
  const s3Client = new S3Client();
  try {

    const data = await s3Client.send(new ListObjectsV2Command({ Bucket: process.env.BUCKET_NAME, Prefix: process.env.IMAGES_DIRECTORY_PATH }));
    const imageFilenames = data.Contents
      .filter(({ Key }) => Key.endsWith('.jpg') || Key.endsWith('.png') || Key.endsWith('.JPG') || Key.endsWith('.PNG'))
      .map((object) => object.Key.split('/').pop().slice(0,object.Key.lastIndexOf('.')));
    return imageFilenames;

  } catch (error) {
    console.error('Error retrieving filenames:', error);
    throw error;
  }
}

async function processImages() {
  try {
    const filenames = await getImageFilenames();
    for (const filename of filenames) {
      console.log('Image filename:', filename);
      try {
          const params = {
              Image: {
                S3Object: {
                  Bucket: process.env.BUCKET_NAME,
                  Name: `${process.env.IMAGES_DIRECTORY_PATH}${filename}`,
                }
              },
              CollectionId: process.env.COLLECTION_ID,
              ExternalImageId: filename
            };
          const data = await rekognition.indexFaces(params);
          console.log("Faces indexed:");
          // console.log(JSON.stringify(data));
          for (const faceRecord of data.FaceRecords) {
            console.log("---------------------------------------------------------------");
            console.log(`Face ID: ${faceRecord.Face.FaceId}`);
            console.log(`ExternalImageId ID: ${faceRecord.Face.ExternalImageId}`);
            console.log(`Image ID: ${faceRecord.Face.ImageId}`);
            console.log("---------------------------------------------------------------");

          }
        } catch (err) {
          console.error("Error indexing faces:", err);
        }
    }

  } catch (error) {
    console.error('Error processing images:', error);
  }
}

processImages();
