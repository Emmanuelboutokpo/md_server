const fs = require('fs');
const connection = require('../config/dbConn');
const processEnv=process.env
const path = require('path');


exports.getAllMusic = async (req, res) => {
    const limit = parseInt(req.query.limit) || 4;
    const page = parseInt(req.query.page) || 0; 
    
    const cmpte = "SELECT COUNT(*) AS length FROM song";
   connection.query(cmpte, (err, data) => {
         if (err) return res.status(500).send(err); 
         const totalRows = data[0].length  
         const totalPage = Math.ceil(totalRows/limit);
         const startingLimit = (page)*limit;
        const q = `SELECT song.idsong, song.title, song.songImg, song.officialDate, song.songItem, song.lead,song.structure,song.tonalite,   song.description, gender.category FROM song JOIN gender ON gender.idgender = song.gender_idgender LIMIT ${startingLimit}, ${limit}`;
         
        connection.query(q, (err, data) => {
            if (err) return res.status(500).send(err);
             return res.status(200).json({
              result : data.sort(() => (Math.random() > 0.5 ? 1 : -1)),
              page: page,
              limit: limit, 
              totalRows: totalRows,
              totalPage: totalPage  
          }) ; 
         });   
         });   
  }
 
  exports.getMusic = async (req, res) => {
    const { id } = req.params
    const q = "SELECT  song.idsong,song.title,song.songImg,song.officialDate,song.songItem,song.description,song.structure,song.tonalite,song.lyrics,song.lead, users.firstName, users.lastName,gender.category, gender.idgender FROM song JOIN gender  ON gender.idgender = song.gender_idgender JOIN users ON users.iduser = song.user_iduser WHERE idsong = ?";
  connection.query(q, [id],(err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length ==0) return res.status(404).json('Post not found!')
    return res.status(200).json({result: data[0]});
  });
}

exports.getMusicCategory = async (req, res) => {
    const query = `SELECT DISTINCT category	 FROM gender;`;
    connection.query(query, (err, data) => {
      if (err) return res.status(500).send(err);
      if (data.length === 0) return res.status(404).json('Category not found!')
  
      const categoryNames = data.map(category => category.category);
      const booksByCategory = {};
       const fetchBooksForCategory = (categoryName) => {
        const booksQuery = `
          SELECT *
          FROM song i
          JOIN gender ic ON i.gender_idgender = ic.idgender
          WHERE ic.category = ?
          LIMIT 4;
        `;
        connection.query(booksQuery, [categoryName], (err, books) => {
          if (err) {
            console.error(`Erreur lors de la récupération des livres pour la catégorie:`, err);
          } else {
            booksByCategory[categoryName] = books;
          }
  
          // Si nous avons obtenu les livres pour toutes les catégories, renvoyez la réponse
          if (Object.keys(booksByCategory).length === categoryNames.length) {
            res.json(booksByCategory);
          } 
        });
      };  
  
      categoryNames.forEach(categoryName => {
        fetchBooksForCategory(categoryName);
      });  
    });
  }

  exports.getMusicByCategory = async (req, res) => {
    const { categorie } = req.params;
    const page = req.query.page || 1; 
    const limit = 4;
  
    let query = `
      SELECT i.*
      FROM song i
      JOIN gender ic ON i.gender_idgender = ic.idgender
      WHERE ic.category = ?
    `;
    
    const offset = (page - 1) * limit;
  
    connection.query(query, [categorie, offset, limit], (err, results) => {
      if (err) {
        console.error(`Erreur lors de la récupération des livres pour la catégorie ${categorie}:`, err);
        res.status(500).json({ error: 'Une erreur s\'est produite' });
      } else {
        res.json(results.sort(() => (Math.random() > 0.5 ? 1 : -1)));
      }
    });
  };

  exports.downloadMusic = async (req, res) => {
    const { id } = req.params;
    const q = "SELECT songItem FROM song WHERE idsong = ?";
  
    connection.query(q, [id], (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la requête à la base de données.' });
      }
  
      if (data.length === 0) {
        return res.status(404).json({ error: 'Song not found!' });
      }
  
      const cleanedFileName = data[0].songItem.replace(/.*http:\/\/localhost:5000\//, '');
      const fileName = cleanedFileName;
  
      const browser = path.join(__dirname, '../uploads');
      const filePath = path.resolve(browser, fileName);
  
      if (fs.existsSync(filePath)) {
       
        // Envoyer la réponse avec le fichier
        return res.download(filePath, (err) => {
          if (err) {
            console.error(err);
            res.status(500).json({ message: 'Erreur lors de l\'envoi du fichier' });
          }
        });
      } else {
        return res.status(404).json({
          fileName: fileName,
          error: 'Le fichier n\'existe pas sur le serveur.',
        });
      }
    });
  };
  
// Handle music upload
exports.uploadMusic = async (req, res) => {

    const { title, description,lead, tonalite, gender_idgender, user_iduser } = req.body;
    
    const files = req.files;

    // Check if any of the required fields are empty
    if (!files || !files['songItem'] || !files['songImg'] || !title || !description) {
        return res.status(400).json({ error: 'Missing required fields or files' });
    }

    let filets = "", coverImages="",lyrics = "", structures="";

    if (files) {
        coverImages = processEnv.API + files['songImg'][0].filename;
        lyrics = processEnv.API + files['lyrics'][0].filename;
       structures = processEnv.API + files['structures'][0].filename;
        filets = processEnv.API + files['songItem'][0].filename; 
    } 

    const q = "INSERT INTO song(`title`, `songImg`, `songItem`,`description`,`lead`,`tonalite`,`structure`,`lyrics`,`gender_idgender`, `user_iduser`) VALUES (?)";
    const values = [title, coverImages, filets, description,structures,lead,tonalite, lyrics, gender_idgender, user_iduser];
    connection.query(q, [values], (err, data) => {
        if (err) return res.status(500).json({ error: err });
        if(data)  return res.status(201).json({ message: 'Music uploaded successfully' });
    });
};

exports.updateMusic = async (req, res) => {
   const { id } = req.params
   const { title, description,lead, tonalite, gender_idgender, user_iduser } = req.body;
    
    const files = req.files;

    // Check if any of the required fields are empty
    if (!files || !files['songItem'] || !files['songImg'] || !title || !description) {
        return res.status(400).json({ error: 'Missing required fields or files' });
    }

    let filets = "", coverImages="",lyrics = "", structures="";

   if (files) {
       coverImages = processEnv.API + files['songImg'][0].filename;
       lyrics = processEnv.API + files['lyrics'][0].filename;
      structures = processEnv.API + files['structures'][0].filename;
       filets = processEnv.API + files['songItem'][0].filename; 
   }

   

        const q = "UPDATE song SET `title`=?, `songImg`=?, `songItem`=?, `description`=?, `structure`=?, `lyrics`=?, `tonalite`=?,`lead`=?,`gender_idgender`=?, `user_iduser`=? WHERE `idsong` = ? ";

        const values = [title, coverImages, filets, description,structures,lyrics,tonalite, lead , gender_idgender, user_iduser];

        connection.query(q, [...values, id], (err, data) => {
            if (err) return res.status(500).json(err);
            if (data.length == 0) return res.status(404).json('Song not found!')
            return res.json("Song has been updated.");
        }); 

    }

exports.deleteMusic = async (req, res) => {
    const { id } = req.params

    const q = "DELETE FROM song WHERE `idsong` = ?";

    connection.query(q, [id], (err, data) => {
      if (err) return res.status(403).json("You can delete only your song!");
      if (data.length===0) return res.status(404).json('Song not found!')
      return res.json("Song has been deleted!");
    });
};
