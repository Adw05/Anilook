import React from 'react'

function Card(props) {
  return (
    
      <div className="card">
        <img src={props.image_url} alt=""/>
        <div className="card-content">
          <h2>{props.title}</h2>
          <p>
            {props.score}
          </p>
          <div className='background'></div>
          <a href="#" class="button">
      
            <span className='material-symbols-outlined'>
            </span>
          </a>
        </div>
      </div>
  );
}

export default Card;