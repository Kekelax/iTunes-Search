import React from "react";

// Style sheets
import "./App.css";

// Components
import SearchITunes from "./components/searchItunes";
import DisplayFavourites from "./components/favourites";
import DisplaySearch from "./components/searchresults";

// Font/icons
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas); // passing all icons in @fortawesome/free-solid-svg-icons

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      favourites: [],
      iTunes: [],
      issue: undefined,
    };
  }

  // GET api, fetches favourites from favmedia.json
  getFav = () => {
    fetch("/api")
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            favourites: result,
          });
        },
        (error) => {
          console.log(error);
          this.setState({
            issue: error,
          });
        }
      );
  };

  // On clicking search button fetches the itunes api based on search input fields
  itunesSearch = async (e) => {
    e.preventDefault(); // prevent page reload on form submit

    // gets the form input values and assign them to term and media
    const term = e.target.term.value.replace(" ", "+").trim().toLowerCase(); // replace space with +
    const media = e.target.media.value;
    const api_call = await fetch(`itunes/${term},${media}`); //Making the API call with the term and media input varibles, and setting the country to za and limit 25.

    if (api_call.status !== 200) {
      //check if api_call is not successful -> send error.
      this.setState({
        iTunes: [],
        issue: "Search failed.",
      });
      return;
    }

    const data = await api_call.json(); //parsing the json data recieved.

    if (term && media) {
      //if term/enity both return true/have inputs ->
      if (data.resultCount === 0) {
        //if nothing is returned -> send error.
        this.setState({
          iTunes: [],
          issue:
            "The item you are looking for is not available in the iTunes store.",
        });
      } else {
        console.log(data.results);
        //if inputs match something in database -> setState data.results array to results.
        this.setState({
          iTunes: data.results,
          issue: "",
        });
      }
    } else {
      //if inputs were empty -> send error.
      this.setState({
        iTunes: [],
        issue: "Please enter your search criteria.",
      });
    }
  };

  // Add to favourites.
  addToFav = (result) => {
    // If an item is already a favourite, it gets removed
    if (
      this.state.favourites.some((faves) => faves.trackId === result.trackId)
    ) {
      const trackId = result.trackId.toString();

      fetch(`/${trackId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      })
        .then((res) => res.json()) // transforms data from the server into json

        //Catches any errors
        .catch((error) => console.log(error));

      //update favourites to exclude removed items
      const filteredFavourites = this.state.favourites.filter(
        (newFav) => newFav.trackId !== parseInt(trackId)
      );
      this.setState({ favourites: filteredFavourites });
    } else {
      // Assign fav to values that will update te favmedia.json file
      const newFavMedia = {
        trackId: result.trackId,
        artistName: result.artistName,
        trackName: result.trackName,
        artworkUrl100: result.artworkUrl100,
        kind: result.kind,
      };

      // HTTP request to update favmedia.json
      fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(newFavMedia),
      })
        .then((res) => res.json()) // transforms data from the server into json

        // catches any errors
        .catch((err) => {
          console.log(err);
        });
      //Updates favourite with the new favourite item
      const newFavourites = [...this.state.favourites];
      newFavourites.push(newFavMedia);
      this.setState({ favourites: newFavourites });
    }
  };

  //deletes favourite from list
  delFav = (trackId) => {
    const newtrackId = trackId.toString();

    fetch(`/${newtrackId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    })
      .then((res) => res.json())

      .catch((error) => console.log(error));

    //Updates favurites to remove the deleted item
    const filteredFavourites = this.state.favourites.filter(
      (newFav) => newFav.trackId !== parseInt(newtrackId)
    );
    this.setState({ favourites: filteredFavourites });
  };

  // on load, calls getFav() to fetch data from favmedia.json
  componentDidMount = () => {
    this.getFav();
  };

  render() {
    //Displays the components
    return (
      <div className="App">
        <header className="App-header">
          <div className="cnter">
            <SearchITunes itunesSearch={this.itunesSearch} />
            <DisplaySearch
              favourites={this.state.favourites}
              search={this.state.iTunes}
              error={this.state.issue}
              addToFav={this.addToFav}
            />
            <DisplayFavourites
              favourites={this.state.favourites}
              delFav={this.delFav}
            />
          </div>
        </header>
      </div>
    );
  }
}

export default App;
