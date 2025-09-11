const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const users = require('../models/users');
const fs = require('fs');
const { type } = require('os');


//Subir Imagen
var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, './Uploads');
    },
    filename: function(req,file,cb){
        cb(null,file.fieldname+"_"+Date.now()+"_"+file.originalname);
    }
});

var upload = multer({
    storage:storage,
}).single('image');

//Ruta para insertar imagen en base de datos

router.post('/add', upload,(req,res)=>{
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });

    user.save()
    .then(()=>{ 
        req.session.message ={ type: 'success', message: 'Usuario Registrado Exitosamente!' };
         res.redirect('/');
         })
    .catch((err)=>{ 
        res.json({message: err.message, type:'danger'});
     });
});

//Ruta para obtner todos los registros(usuarios)

router.get("/", async (req, res) => {
     try { 
            const users = await User.find().exec();
            //console.log(users);
            res.render("index", { title: 'Home Page',users: users, })
        }
    catch (err) {
         res.json({message: err.message});
     } 
});


router.get('/users', (req, res) => {
    res.send('USUARIOS');
});

router.get("/add", (req, res) => {
    res.render("add_users",{ title: "Agregar Usuarios"});
});

//Ruta para obtener datos a Modificar
router.get("/edit/:id", async(req,res)=>{
    try{
        let id = req.params.id;
        const users = await User.findById(id).exec();
        res.render('edit_users',{title: "Modificar Usuarios", user:users,});
    }
    catch(err){
        res.json({message: err.message});
        res.redirect('/');
    }
});

//Ruta para Editar usuario
router.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync('./Uploads/' + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        }).exec();

        req.session.message = {
            type: 'success',
            message: 'Usuario modificado Exitosamente!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

//Ruta eliminar Usuario
router.get('/delete/:id', async (req, res) => {
     try { let id = req.params.id ;
         const result = await User.findByIdAndDelete(id).exec();
        if (result && result.image !== '') {
             try { fs.unlinkSync('./Uploads/' + result.image);

              } 
              catch (err) {
                 console.log(err);
                 } 
                } req.session.message = {
                    type: 'success', message: '¡Usuario eliminado correctamente!', };
                    res.redirect('/');
                } catch (err) {
                     res.json({ message: err.message });
                     } 
                });
module.exports = router;