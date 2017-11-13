var express = require("express");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var Photo = require("./models/photo.js");
var Album = require("./models/album.js");
var User = require("./models/studio.js");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

// mongoose.connect("mongodb://localhost/paparazzopro");
// mongodb://rohit:rohit@123@ds157185.mlab.com:57185/paparazzopro
// mongoose.connect("mongodb://rohit:rohit@123@ds157185.mlab.com:57185/paparazzopro");

mongoose.connect(process.env.DATABASEURL);

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(require("express-session")({
    secret: "I am designing PaparazzoPro",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(express.static(__dirname + "/public"));

app.post("/albums", function(req, res) {
    Album.findById(req.body.albumId).populate("photos").exec(function(err, found) {
        if(err)
        {
            console.log(err);
            req.flash("error", "Invalid Album Key! Please contact your photographer for correct key!")
            res.redirect("/");
        }
        else
        {
            res.render("showalbum", {album: found, currentUser: req.user});
        }
    });
});

app.get("/register", function(req, res) {
    res.render("signup", {currentUser: req.user});
});

app.post("/register", function(req, res) {
    User.register(new User({username: req.body.username, name: req.body.name}), req.body.password, function(err, user){
        if(err) {
            req.flash("error", err.message);
            res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Account created successfully");
            res.redirect("/users/" + user._id);
        });
    });
});

app.get("/", function (req, res) {
    res.render("landing", {currentUser: req.user});
});

app.get("/login", function(req, res) {
    res.render("login", {currentUser: req.user});
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/users",
    failureRedirect: "/login"
}), function(req, res) {
});

app.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Successfully Logged You Out!");
    res.redirect("/");
});

app.get("/users", function(req, res) {
    res.redirect("/users/" + req.user._id);
});

app.get("/users/:id", isLoggedIn, function (req, res) {
    User.findById(req.params.id).populate({
        path: "albums",
        populate: {
            path: "photos",
            model: "Photo"
        }
    }).exec(function(err, foundStudio) {
        if(err)
        {
            req.flash("error", "Oops! Something went wrong. Please try again");
            console.log(err);
            res.redirect("/login");
        }
        else
        {
            req.flash("Welcome to PaparazzoPro!");
            res.render("profile", {studio: foundStudio, currentUser: req.user});
        }
    });
});

app.get("/users/:id/edit", isLoggedIn, function(req, res) {
    User.findById(req.params.id, function(err, studio) {
        if(err)
        {
            req.flash("error", "Oops! Something went wrong. Please try again");
            console.log(err);
            res.redirect("back");
        }
        else
        {
            res.render("profileupdate", {currentUser: req.user, studio: studio});
        }
    });
});

app.put("/users/:id", isLoggedIn,function(req, res) {
    User.findByIdAndUpdate(req.params.id, req.body.studio, function(err) {
        if(err)
        {  
            req.flash("error", "Oops! Something went wrong. Please try again");
            console.log(err);
            res.redirect("back");
        }
        else
        {
            req.flash("Profile Updated successfully!");
            res.redirect("/users/" + req.params.id);
        }
    });
});

app.get("/users/:id/albums", isLoggedIn, function (req, res) {
    User.findById(req.params.id).populate({
        path: "albums",
        populate: {
            path: "photos",
            model: "Photo"
        }
    }).exec(function(err, foundStudio) {
        if(err)
        {
            req.flash("error", "Oops! Something went wrong. Please try again");
            res.redirect("back");
            console.log(err);
        }
        else
        {
            res.render("albums", {studio:foundStudio, currentUser: req.user});
        }
    });
});

app.get("/users/:id/albums/new", isLoggedIn, function (req, res) {
    User.findById(req.params.id, function(err, studio){
        if(err)
        {
            req.flash("error", "Oops! Something went wrong. Please try again");
            res.redirect("back");
            console.log(err);
        }
        else
        {
            res.render("newalbum", {studio: studio, currentUser: req.user});
        }
    });
});

app.get("/users/:studio_id/albums/:album_id/edit", isLoggedIn, function(req, res) {
    User.findById(req.params.studio_id, function(err, studio) {
        if(err) 
        {
            req.flash("error", "Oops! Something went wrong. Please try again");
            res.redirect("back");
            console.log(err);
        }
        else
        {
            Album.findById(req.params.album_id, function(err, album) {
                if(err)
                {
                    req.flash("error", "Oops! Couldn't find requested album. Please try again");
                    res.redirect("back");
                    console.log(err);
                }
                else
                {
                    res.render("albumupdate", {currentUser: req.user, studio: studio, album: album});
                }
            });
        }
    });
});

app.put("/users/:studio_id/albums/:album_id", function(req, res) {
    Album.findByIdAndUpdate(req.params.album_id, req.body.album, function(err) {
        if(err)
        {
            req.flash("error", "Error! Unable to do the updates. Please try again.");
            console.log(err);
            res.redirect("back");
        }
        else
        {
            req.flash("success", "Album updated successfully!");
            res.redirect("/users/" + req.params.studio_id + "/albums/" + req.params.album_id);
        }
    });
});

app.post("/users/:id/albums", isLoggedIn, function(req, res) {
    User.findById(req.params.id, function(err, foundStudio){
        if(err)
        {
            req.flash("error", "Oops! Something went wrong. Please try again");
            res.redirect("back");
            console.log(err);
        }
        else
        {
            Album.create(req.body.newalbum, function(err,createdAlbum) {
                if(err){
                    req.flash("error", "Error! Album could not be created!");
                    console.log(err);
                    res.redirect("back");
                }
                else
                {
                    createdAlbum.save();
                    foundStudio.albums.push(createdAlbum);
                    foundStudio.save();
                    req.flash("success", "Album created successfully!");
                    res.redirect("/users/" + req.params.id + "/albums/" + createdAlbum._id + "/add");
                }
            });
        }
    });
});

app.get("/users/:id/albums/:album_id", isLoggedIn, function(req, res) {
    User.findById(req.params.id).populate("albums").exec(function(err, studio) {
        if(err)
        {
            req.flash("error", "Oops! Something went wrong. Please try again");
            res.redirect("back");
            console.log(err);
        }
        else
        {
            Album.findById(req.params.album_id).populate("photos").exec(function(err, foundAlbum) {
                if(err) 
                {
                    req.flash("error", "Error! Album could not be found!");
                    console.log(err);
                    res.redirect("back");
                }
                else
                {
                    res.render("photos", {album: foundAlbum, studio: studio, currentUser: req.user});
                }
            });
        }
    });
});

app.get("/users/:studio_id/albums/:album_id/add", isLoggedIn, function(req, res) {
    User.findById(req.params.studio_id).populate("albums").exec(function(err, studio) {
        if(err)
        {
            req.flash("error", "Oops! Something went wrong. Please try again");
            res.redirect("back");
            console.log(err);
        }
        else
        {
            Album.findById(req.params.album_id).populate("photos").exec(function(err, album) {
                if(err)
                {
                    req.flash("error", "Oops! Something went wrong. Please try again");
                    res.redirect("back");
                    console.log(err);
                }
                else
                {
                    res.render("addphotos", {album: album, studio: studio, currentUser: req.user});
                }
            });
        }
    });
});

app.post("/users/:id/albums/:album_id", isLoggedIn, function(req, res) {
    Album.findById(req.params.album_id, function(err, album) {
        if(err)
        {
            req.flash("error", "Oops! Something went wrong. Please try again");
            res.redirect("back");
            console.log(err);
        }
        else
        {
            Photo.create(req.body.newphoto, function(err, createdPhoto) {
                if(err)
                {
                    req.flash("error", "Error! Photo could not be added!");
                    console.log(err);
                    res.redirect("back");
                }
                else
                {
                    createdPhoto.save();
                    album.photos.push(createdPhoto);
                    album.save();
                    res.redirect("/users/" + req.params.id + "/albums/" + req.params.album_id);
                }
            });
        }
    });
});

app.delete("/users/:studio_id/albums/:album_id", isLoggedIn, function(req, res) {
    Album.findByIdAndRemove(req.params.album_id, function(err) {
        if(err)
        {
            req.flash("error", "Oops! Something went wrong. Please try again");
            res.redirect("back");
            res.redirect("/users/" + req.params.studio_id + "/albums/" + req.params.album_id);
        }
        else
        {
            req.flash("success", "Album deleted successfully");
            res.redirect("/users/" + req.params.studio_id + "/albums");
        }
    });
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Log In First");
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function () {
    console.log("Server has started");
});
