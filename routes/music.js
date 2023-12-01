const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const shortId =require("shortid");
const { getAllMusic, getMusic, uploadMusic, updateMusic, deleteMusic, downloadMusic, getMusicCategory, getMusicByCategory } = require('../controllers/musicController');

const router = express.Router();

 const uploadFolderPath = path.join(__dirname, '../uploads');

 if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath);
}

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'songItem') {
         if (file.originalname.match(/\.(mp3|mp4|MP3|MP4|ogg|OGG|3gpp|3GPP|wav|WAV|M4A|m4a)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP3, MP4 and OGG files are allowed.'));
        }
    } else if (file.fieldname === 'songImg') {
         if (file.originalname.match(/\.(jpg|jpeg|png|PNG|JPEG|JPG)$/)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG and PNG images are allowed for the cover image.'));
        }
    } else if (file.fieldname === 'lyrics') {
        if (file.originalname.match(/\.(pdf|PDF|docx|DOCX)$/)) {
           cb(null, true);
       } else {
           cb(new Error('Invalid file type. Only JPG and PNG images are allowed for the lyrics'));
       }
   }else if (file.fieldname === 'structures') {
    if (file.originalname.match(/\.(pdf|PDF|docx|DOCX)$/)) {
       cb(null, true);
   } else {
       cb(new Error('Invalid file type. Only JPG and PNG images are allowed for the lyrics'));
   }
} else {
         cb(null, false);
    }
};

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadFolderPath);
        },
        filename: function (req, file, cb) {      
           const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
           cb(null, shortId.generate() + '-' + file.originalname);
        }
    }),
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 
    }
});

router.get("/getAllMusic", getAllMusic);
router.get("/music/category", getMusicCategory);
router.get("/music/category/:categorie", getMusicByCategory);
router.get("/download/:id", downloadMusic);
router.get('/getMusic/:id',getMusic);
router.post('/addMusic', upload.fields([{ name: 'songItem', maxCount: 1 }, { name: 'songImg', maxCount: 1 }, { name: 'lyrics', maxCount: 1 }, { name: 'structures', maxCount: 1 }]), uploadMusic);
router.put("/putMusic/:id", upload.fields([{ name: 'songItem', maxCount: 1 }, { name: 'songImg', maxCount: 1 }, { name: 'lyrics', maxCount: 1 }, { name: 'structures', maxCount: 1 }]), updateMusic); 
router.delete("/deleteMusic/:id", deleteMusic); 
 
module.exports = router;
