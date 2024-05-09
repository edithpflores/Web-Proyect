const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configuración de multer para guardar imágenes
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'app/public/images/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Construyendo el nombre del archivo
    }
});
const upload = multer({ storage: storage });

mongoose.connect('mongodb+srv://oscarchiw:HomeBakesDASW@daswproject.ur4wdy7.mongodb.net/HomeBakes')

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected successfully to MongoDB");
});

router.get('/recipes',(req,res) => res.sendFile(path.resolve(__dirname + "/../views/recipe.html")));


// Esquema y modelo de Mongoose
const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    ingredients: { type: String, required: true },
    instructions: { type: String, required: true },
    //creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// Ruta POST para crear una receta
router.post('/recipes', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No image uploaded" });
    }
    try {
        const { name, description, ingredients, instructions } = req.body;
        const image = req.file.path;
        const recipe = new Recipe({
            name,
            description,
            image,
            ingredients,
            instructions
            //creator
        });
        await recipe.save();
        res.status(201).send({ message: "Recipe created successfully", recipeId: recipe._id });
    } catch (error) {
        console.error('Recipe creation failed:', error);
        res.status(500).send({ message: "Error creating recipe" });
    }
});

module.exports = router;