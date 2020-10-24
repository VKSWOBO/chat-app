import React from "react";
import { withRouter } from "react-router-dom";
import { useSendBird } from "../SendbirdApi/sendBirdApi";
import Modal from 'react-modal'
import plus from '../Images/plus.svg'
import SimpleMap from '../Components/Maps'
import axios from "axios";

Modal.setAppElement('#root')

const ChatroomPage = ({ match }) => {
  const chatRoom = match.params.url;
  const [channelName, setChannelName] = React.useState("");
  const [channel, setChannel] = React.useState({});
  const [messages, setMessages] = React.useState([]);
  const messageRef = React.useRef();
  const [userName, setUserName] = React.useState("");
  const { getGroupChannel, createPreviousMessageListQuery, sendUserMessage, onMessageReceived} = useSendBird();
  
  const [modalIsOpen, setModalIsOpen] = React.useState(false)
  const [mapModal,setMapModal] = React.useState(false)

  const [startLocation, setStartLocation] = React.useState("")
  const [startLocationCoord,setStartLocationCoord] = React.useState("")

  const [endLocation, setEndLocation] = React.useState("")
  const [endLocationCoord,setEndLocationCoord] = React.useState("")
  const [inputClick, setinputClick] = React.useState("")

  const nameRef = React.useRef();
  const startLocationRef = React.useRef();
  const endLocationRef = React.useRef();
  


  async function fetchChannel() {
    const channel = await getGroupChannel(chatRoom);
    setChannelName(channel.name)
    setChannel(channel);
  }

  async function listenOnMessageReceived() {
    const { message } = await onMessageReceived();
    if (chatRoom === message.channelUrl) {
      setMessages((prevState) => [...prevState, message]);
    }
  }

  const fetchMessages = async()=> {
    const channel = await getGroupChannel(chatRoom);
    const prevMessageListQuery = await createPreviousMessageListQuery(
      channel,
      3
    );
    prevMessageListQuery.load(function (messages, error) {
      if (error) {
        return console.log(error);
      }
      setMessages(messages);
    });
  }

  const handelkeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const sendMessage = async() => {
    const newMessage = await sendUserMessage(channel, messageRef.current.value);
    setMessages((prevState) => [...prevState, newMessage]);
    messageRef.current.value = "";
  };

  const imgClick = ()=>{
   setModalIsOpen(true)
  }

  const mapOpen = (data)=>{
    setinputClick(data)
    setMapModal(true)
   }

  const handelData= (data)=>{
    if(data.who === 'close'){
      setMapModal(false)
    } else if(data.who === 'start'){
      startLocationRef.current.value = data.address
      setStartLocationCoord(data.location)
      setStartLocation(data.address)
      setMapModal(false)
    } else if(data.who === 'end'){
      endLocationRef.current.value = data.address
      setEndLocationCoord(data.location)
      setEndLocation(data.address)
      setMapModal(false)
    }
  }

  const dataCollect = async ()=>{
    await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${startLocationCoord.lat},${startLocationCoord.lng}&destinations=${endLocationCoord.lat},${endLocationCoord.lng}&key=${"AIzaSyAkoe98NAkKlGghynXBqFjVdMrYK4RDoOI"}`, {
      headers: {"Access-Control-Allow-Origin": "*",'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'},
    responseType: 'json',
     }).then(response => {
       const distance = response.data.rows[0].elements[0].distance.text;
      sendData(distance)
    })
    .catch(error =>{
      console.log(error)
    })
    setModalIsOpen(false)
  }

  const sendData =(distance) =>{
    const message = `Name ${nameRef.current.value} Start Location : ${startLocation}  End Location : ${endLocation} Mileage : ${distance}`
       messageRef.current.value = message
       sendMessage()
  }

  React.useEffect(() => {
    const token = localStorage.getItem("userId");
    if (token) {
      setUserName(token);
    }
    listenOnMessageReceived();
    fetchChannel();
    fetchMessages();
    return () => {};
    //eslint-disable-next-line
  }, []);

  return (
    <div className="chatroomPage">
      <div className="chatroomSection">
        <div className="cardHeader">{channelName}</div>
        <div className="chatroomContent">
          {messages.map((message) => (
            <div key={message.messageId} className="message">
              <span
                className={userName === message._sender.userId ? "ownMessage" : "otherMessage"}>
                {message._sender.userId}:
              </span>{" "}
              {message.message}
            </div>
          ))}
        </div>
        <div className="chatroomActions">
          <div className="">
            <img  src={plus} alt="plus" onClick={imgClick}/>
          </div>
          <div>
            <input
              type="text"
              name="message"
              placeholder="Say something!"
              ref={messageRef}
              onKeyPress={handelkeyPress}
            />
          </div>
          <div>
            <button className="join" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          style={{
            overlay: {
              backgroundColor: 'grey'
            },
            content: {
              color: 'orange'
            }
          }}
        >
          <input
            type="text"
            name="name"
            placeholder="Enter Your Name"
            ref={nameRef}
          />
          <input
            type="text"
            name="message"
            placeholder="select start location"
            ref={startLocationRef}
            onClick={()=>mapOpen('start')}
          />
          <input
            type="text"
            name="message"
            placeholder="select end location"
            ref={endLocationRef}
            onClick={()=>mapOpen('end')}
          /> 
          <div style={{ marginTop:"5%"}}>
            <button onClick = {dataCollect}>Send</button>
          </div> 
          <div style={{marginTop:"2%"}}>
            <button onClick={() => setModalIsOpen(false)}>Close</button>
          </div> 
        </Modal>
        {/*This Modal will open when user click on start location or end location */}
        <Modal
          isOpen={mapModal}
          onRequestClose={() => setMapModal(false)}
          style={{
            overlay: {
              backgroundColor: 'grey'
            },
            content: {
              color: 'orange'
            }
          }}
        >
          <SimpleMap handelData={handelData} inputClick={inputClick}/>
         </Modal>
         {/*This End of Modal  start location or end location click */}
      </div>
    </div>
  );
};

export default withRouter(ChatroomPage);