//var storage = multer.diskStorage({
//    destination: function (req, file, cb) {
//        cb(null, 'uploads/')
//    },
//    filename: function (req, file, cb) {
//        cb(null, file.fieldname + '-' + Date.now() + ".jpg")
//    }
//})
//
//var upload = multer({
//    storage: storage
//}).single('avatar')






app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/signup", function (req, res) {
    res.render("signup");
});




app.post("/albums", function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            // An error occurred when uploading 
            return
        }
        res.json({
            success: true,
            message: "Image Uploaded!"
        })

        // Everything went fine 
    })
});






<img src="http://lorempixel.com/400/200">
                    <img src="http://lorempixel.com/400/200">
                    <img src="http://lorempixel.com/400/200">
                    <img src="http://lorempixel.com/400/200">
                    <img src="http://lorempixel.com/400/200">
                    <img src="http://lorempixel.com/400/200">
                    <img src="http://lorempixel.com/400/200">
                    <img src="http://lorempixel.com/400/200">
                    <img src="http://lorempixel.com/400/200">
                    <img src="http://lorempixel.com/400/200">
                    <img src="http://lorempixel.com/400/200">
                    <img src="http://lorempixel.com/400/200">