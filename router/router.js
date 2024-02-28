import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import cors from 'cors';
import {handleImageUpload} from '../controller/uploadController.js'

const app = express();


app.use(cors(corsOptions));
var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}

app.use(bodyParser.raw());
const storage = multer.memoryStorage();
const files = multer({ storage });

app.post('/upload', files.single('file'), handleImageUpload);

export {app};
