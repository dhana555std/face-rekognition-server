import { Rekognition } from "@aws-sdk/client-rekognition";
import fs from 'fs';
import dotenv from "dotenv";
import { logDataToDb } from "./database.js"

const environment = process.env.ENV || "development";
console.log(`Environment is ${environment}`);
dotenv.config({
  path: `./.env.${environment}`,
});

const rekognition = new Rekognition({
  region: process.env.AWS_REGION,
});

export async function searchFaces(localImagePath) {

const localImageBytes = fs.readFileSync(localImagePath);
const targetImage = {
  Bytes: localImageBytes,
};

const params = {
  Image:targetImage,
CollectionId: process.env.COLLECTION_ID
};

  try {
    const data = await rekognition.searchFacesByImage(params);
    if (data.FaceMatches.length > 0 && data.FaceMatches[0].Similarity>90) {
      const externalImageId = data.FaceMatches[0].Face.ExternalImageId;
      const idOfPerson= externalImageId.slice(0, externalImageId.lastIndexOf('.'));
      await logDataToDb(idOfPerson);
      return data.FaceMatches;
    } else {
      return {"message" : "No matching faces found in the collection."};
    }
  } catch (err) {
    console.error("Error searching faces:", err);
    return err;
  }
}



