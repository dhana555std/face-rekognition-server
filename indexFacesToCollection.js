import AWS from 'aws-sdk';

AWS.config.update({ region: 'ap-south-1' }); // Replace with your AWS region
const rekognition = new AWS.Rekognition();

const params = {
  Image: {
    S3Object: {
      Bucket: 'rekophotos',
      Name: 'Employees/CTOSir.jpg',
    }
  },
  CollectionId: 'employees',
  ExternalImageId: 'Ashutosh_Bijoor'
};

async function indexFaces() {
  try {
    const data = await rekognition.indexFaces(params).promise();
    console.log("Faces indexed:");
    console.log(JSON.stringify(data));
    for (const faceRecord of data.FaceRecords) {
      console.log(`Face ID: ${faceRecord.Face.FaceId}`);
      // Access other indexed face details as needed
    }
  } catch (err) {
    console.error("Error indexing faces:", err);
  }
}

indexFaces();
