import React, { memo } from 'react'

const Card = memo(function Card(props) {
  return (
    <div className="card">
      <img src={props.image_url} alt={props.title} loading="lazy" />
      <div className="card-content">
        <h2>{props.title}</h2>
        <p>Score: {props.score}</p>
      </div>
    </div>
  );
});

export default Card;