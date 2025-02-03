import { useState, useEffect } from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form} from 'react-bootstrap';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import axios from 'axios';

function getDate(datetTime){

let myDate = new Date(datetTime);

let day = myDate.getDate();     
let month = myDate.getMonth() + 1; 
let year = myDate.getFullYear(); 

let formattedDate = `${day}-${month}-${year}`;

return formattedDate; 
}

const myStyle2={borderRadius:"10px"}
const myStyle5={borderRadius:"10px", overflow:"hidden"}

function MyModal ({ show, handleClose, setData }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [contact, setContact] = useState('');

  const handleSave = () => {
    
    const postData = {
      name: name,
      birthdate: getDate(dob),
      contact: contact,
    };

    // Make the POST request
    axios.post("https://majdsuhail2.pythonanywhere.com/insert", postData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then(response => {

        // Close the modal
        handleClose();
        fetchData(setData)
        
      })
      .catch(error => {
        console.error('Error making POST request:', error);
      });

  };

  return (
    <Modal show={show} onHide={handleClose}>

      
      <Modal.Header closeButton>
      <div>
        <Modal.Title>Enter Details</Modal.Title>
        <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
          Please fill in all fields.
        </p>
        </div>
      </Modal.Header>

      <Modal.Body>

        <Form>
          <Form.Group controlId="formName" className="mb-3">
            <Form.Label>Name:</Form.Label>
            <Form.Control type="text" placeholder="Enter your name" onChange={(e) => setName(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="formDob" className="mb-3">
            <Form.Label>Date of Birth:</Form.Label>
            <br/>
            <DatePicker selected={dob} onChange={(date) => setDob(date)} dateFormat="yyyy-MM-dd" />
          </Form.Group>

          <Form.Group controlId="formContact" className="mb-3">
            <Form.Label>Contact:</Form.Label>
            <Form.Control type="text" placeholder="Enter your contact" onChange={(e) => setContact(e.target.value)} />
            <Form.Text className="text-muted">
            Please enter your contact information <br/>(e.g. Instagram: @username).
            </Form.Text>
          </Form.Group>

        </Form>

      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function CreateBtn({setData}){

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '5%', 
  };
  
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return(
    <div style={containerStyle}>
      <button className="fancy-button" id="myButton" onClick={handleShow}>Add your birthday!</button>
      <MyModal show={showModal} handleClose={handleClose} setData={setData} />
  </div>
  )
}

function Search({setData}){
  const myStyle={paddingRight:"10%", paddingLeft:"10%", marginTop:"5%", marginBottom:"5%"};
  const formStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  const myStyle3={borderWidth:"3px"}
  const myStyle4=Object.assign({}, myStyle2,myStyle3);

  const [selectedDate, setSelectedDate] = useState(null);

  const search= (e)=>{

    const postData={
      birthdate:getDate(selectedDate),
    }

    e.preventDefault();

    axios.post("https://majdsuhail2.pythonanywhere.com/search", postData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then(response => {
        
        setData(response.data);
        
      })
      .catch(error => {
        console.error('Error making POST request:', error);
      });
  }

  return(
    <div 
    style={myStyle}
    >
  <form className="d-flex" role="search" style={formStyle}>
  <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"  
          className="form-control me-5"
          placeholderText="Select a date"
        />
  <button className="btn btn-outline-success" style={myStyle2} onClick={search}>Search</button>
  <button className="btn btn-outline-success" style={myStyle2} onClick={(e)=>{
    e.preventDefault() 
    fetchData(setData)
  }}>Reload</button>
  </form>
  </div>
  )
}

function MyTable({data}){
  const myStyle={paddingLeft:"10%", paddingRight:"10%"}

  return(
    <div style={myStyle}>
      <div style={myStyle5}>
    <table className="table " >
  <thead className= "table-dark">
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Age</th>
      <th scope="col">date of birth</th>
      <th scope="col">contact</th>
    </tr>
  </thead>
  <tbody>
  {data.map(item => (
              <tr key={item.id}>
                <td title={item.name.length > 20 ? item.name : null} >{item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}</td>
                <td>{item.age}</td>
                <td>{item.birthdate}</td>
                <td title={item.contact.length > 20 ? item.contact : null} >{item.contact.length > 20 ? `${item.contact.substring(0, 20)}...` : item.contact}</td>
              </tr>
            ))}
  </tbody>
</table>
</div>
</div>
  );
}



function fetchData(setData, loading, setLoading){
  
  // Fetch data from Flask server using Axios
  setLoading(true);
  axios.get('https://majdsuhail2.pythonanywhere.com/index')  
  .then(response => {
    setData(response.data);
    setLoading(false);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    setLoading(false);
  });
}

export default function MyApp() {
  
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(setData, loading, setLoading)
  }, []);
 

  return (
    <div>
      <CreateBtn setData={setData}/>
      <Search setData={setData}/>
      {loading ? (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    ) : (
      <MyTable data={data} />
    )}    </div>
  );
}
