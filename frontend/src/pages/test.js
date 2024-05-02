import axios from 'axios';
import React from 'react';

class Test extends React.Component {
  state = { details:[],}

  componentDidMount() {
    let data;
    axios.get('http://localhost:8000/users/')
      .then(res => {
        data = res.data;
        this.setState({
          details: data
        });
      })
      .catch(err => {
        console.error('Error fetching data:', err);
      })
        }

  render() {
    return (
      <div>
      <header style={{color:'white', fontSize:'100px'}}> Data 12345667</header>
      <hr></hr>
      {this.state.details.map((output, id) => (
        <div key={id}>
          <div>
          <h2 style={{color:'white', fontSize:'100px'}}>{output.users}</h2>
          </div>
        </div>
      ))}
      </div>
    )
  }
}

export default Test;