import React from "react";

// Styling
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function DisplayFavourites({ favourites, delFav }) {
  /* media maps through favourites array and inputs fields(artworkUrl100,
        trackName etc. ) into a card */
  const mediaCard = favourites.map((fav) => (
    <Col key={fav.trackId.toString()} className="colcard">
      <Card className="card">
        <Card.Header>
          <FontAwesomeIcon
            icon={["fas", "trash-alt"]}
            className="icons"
            name="trash-bin"
            onClick={() => delFav(fav.trackId)}
          />
        </Card.Header>
        <Card.Img className="cardimg" variant="top" src={fav.artworkUrl100} />
        <Card.Body>
          <Card.Title className="cardtitle">{fav.trackName}</Card.Title>
          <Card.Text className="cardtext">
            Artist: {fav.artistName} <br />
            <br />
            Type: {fav.kind}
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  ));

  return (
    <Container fluid className="card-container">
      <h1>Favourites</h1>
      <Row className="cardrow" xs={1} md={2} lg={3}>
        {mediaCard}
      </Row>
    </Container>
  );
}
