import React from "react";

//Component to display the search form
export default function SearchITunes(props) {
  return (
    <div className="SearchForm">
      <h1 className="SearchHeading">Search iTunes for Media</h1>
      <form onSubmit={props.itunesSearch}>
        <div className="frmInput">
          <input type="text" name="term" placeholder="Search..."></input>
          <select name="media">
            <option value="all">All</option>
            <option value="movie">Movie</option>
            <option value="tvShow">TV Show</option>
            <option value="music">Music</option>
            <option value="podcast">Podcast</option>
            <option value="musicVideo">Music Video</option>
            <option value="audiobook">Audio Book</option>
            <option value="ebook">e-Book</option>
          </select>
          <button>Search</button>
        </div>
      </form>
    </div>
  );
}
