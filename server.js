const express = require("express");
const app = express(); //Initialise express
const cors = require("cors");
const helmet = require("helmet");
const fileHandler = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const favMedia = require("./favmedia");

// CORS middleware, enables all CORS requests
app.use(cors());

//  ****** Body parser middleware ******* //
/* Returns middleware that only parses json and only looks at 
requests where the Content-Type header matches the type option. */
app.use(express.json());
/*only parses urlencoded bodies and only looks at requests where the 
Content-Type header matches the type option*/
app.use(express.urlencoded({ extended: true }));

//helmet security policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'", "https://itunes.apple.com/"],
      "script-src": [
        "'self'",
        "'sha256-1kri9uKG6Gd9VbixGzyFE/kaQIHihYFdxFKKhgz3b80='",
      ],
      "object-src": ["'self'"],
      "img-src": ["'self'", "https://itunes.apple.com/", "https:"],
      "connect-src": ["'self'", "https://itunes.apple.com/"],
      "font-src": ["'self'"],
      "style-src": [
        "'self'",
        "'sha256-UTjtaAWWTyzFjRKbltk24jHijlTbP20C1GUYaWPqg7E='",
      ],
    },
  })
);

//GET function to display data from favmedia.json
app.get("/api", (req, res) => {
  fileHandler.readFile("favmedia.json", (err, data) => {
    if (err) {
      res.send("File not found. First post to create file.");
    } else {
      const fav = JSON.parse(data);

      res.send(fav);
    }
  });
});

// GET data from itunes based on term and media
app.get(`/itunes/:termmedia`, async (req, res) => {
  // splits termmedia at the comma
  const termmedia = req.params.termmedia.split(",");
  // define term and media to use in the url
  const term = termmedia[0];
  const media = termmedia[1];

  const url = `https://itunes.apple.com/search?term=${term}&media=${media}&country=za&limit=25`;
  const fetch_res = await fetch(url);
  const data_res = await fetch_res.json();
  res.json(data_res);
});

// Adds to favourites to the favmedia.json file
app.post("/", (req, res) => {
  const newFav = {
    trackId: req.body.trackId,
    artistName: req.body.artistName,
    trackName: req.body.trackName,
    artworkUrl100: req.body.artworkUrl100,
    kind: req.body.kind,
  };

  if (!newFav.trackId || !newFav.trackName) {
    return res.status(400).json({ msg: "Please include a track id and name" });
  } else {
    favMedia.push(newFav);

    fileHandler.writeFile("favmedia.json", JSON.stringify(favMedia), (err) => {
      if (err) throw err;
      res.json({ msg: "Data not written", favMedia });
    });
  }
});

//Delete favourites

app.delete("/:id", (req, res) => {
  /* returns found as true if trackId = request param id
   * returns found as false if the requested param id does not exist */
  const found = favMedia.some(
    (favList) => favList.trackId === parseInt(req.params.id)
  );

  if (found) {
    // remove the favaourite from the array object based on the id in the params
    let faves = favMedia;

    faves.splice(
      faves.findIndex((del) => del.trackId === parseInt(req.params.id)),
      1
    );

    //updates favmedia.json with the new array faves
    fileHandler.writeFile("favmedia.json", JSON.stringify(faves), (err) => {
      if (err) throw err;
    });

    res.json({
      msg: "Favourite removed",
      faves,
    });
  } else {
    res.status(400).json({ msg: `Favourite ${req.params.id} does not exist` });
  }
});

//Manages errors
app.use(function (err, req, res, next) {
  console.log(err.stack);
  res.status(500).send("Something broke!");
});

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  //set static folder
  app.use(express.static("frontend/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

// listen to port 3001 or a port specified in process.env
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
