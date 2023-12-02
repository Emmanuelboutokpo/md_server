const connection = require("../config/dbConn");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const processEnv=process.env

exports.signup = async (req, res) => {
  const sql = "SELECT * FROM `users` WHERE email =?";
  const { firstName, lastName, email, password} = req.body;
     console.log(firstName, lastName, email, password);
    connection.query(sql, [email], (error,data) =>{
      if(error) return res.json(error);
      if(data.length>0){
           return res.status(422).json({error: `${firstName} existe déjà veuillez vous connecter`});
          }   else if((!firstName || !lastName || !email || !password)) {
            return res.status(400).json({ error: 'Veuillez remplir tous les champs requis.' });
      }   else{
        const hashed = bcrypt.hashSync(password, 10);
           const q = "INSERT INTO users (`firstName`,`lastName`,`email`,`password`) VALUES (?)";
           const values = [firstName,lastName,email,hashed];
           connection.query(q,[values], (error,data) =>{
               if(error) return res.json(error);
               if(data)  return res.status(201).json({
                  message : "Votre compte a été créé avec succès"
               })
           })
      }  
})  

}
const generateAccessToken = (data) => {
  return  jwt.sign({id: data[0].iduser,status: data[0].status}, process.env.JWT_SECRET)
};

exports.signin = async (req, res) => {
    const q = "SELECT * FROM `users` WHERE email =?";
    const { email, password } = req.body;
  
    connection.query(q, [email,password],  (err, data) => {
     if (err) return res.status(500).json(err);
     if (data.length === 0) return res.status(404).json({error : "L'utilisateur n'existe pas!"});
 
     //Check password
     const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        data[0].password
     );

     if (!isPasswordCorrect) return res.status(400).json({error : "Mauvais mot de passe!"});
     const accessToken = generateAccessToken(data);

     const { password, ...other } = data[0];
     const {iduser,firstName,lastName, status}=other
     res.status(201).json({
      iduser,
       accessToken,
       firstName,
       lastName,
       status
      }); 
    });
  }  
  
  exports.getAllUser = async (req, res) => {
    const q = "SELECT  * FROM `users`";
  connection.query(q,(err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length ==0) return res.status(404).json('Users not found!')
    return res.status(200).json(data);
  });
}

exports.makeAnAdmin = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
    console.log(status);
  const q = "UPDATE users SET `status`=? WHERE `iduser` = ? ";

  const values = [status];

  connection.query(q, [values, id], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length ==0) return res.status(404).json('Users not found!')
    return res.json("Users is an admin");
  });

}

