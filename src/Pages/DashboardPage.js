import React from "react";
import { Link } from "react-router-dom";
import makeToast from "../Toaster";
import { useSendBird } from "../SendbirdApi/sendBirdApi";

const DashboardPage = () => {
  const addChatRoomref = React.createRef();
  const groupUserNameref = React.createRef();
  const [userName, setUserName] = React.useState("");
  const [channelList, setChannelList] = React.useState([]);
  const { channelListQuery, createChannelWithUserIds } = useSendBird();

  const createChatRoom = async() => {
    const chatRoom = addChatRoomref.current.value;
    const name = groupUserNameref.current.value;
    if(chatRoom!== ''){
      const openChannel = await createChannelWithUserIds(name ,chatRoom)
      makeToast("success", openChannel.name + ' channel create successfully');
      addChatRoomref.current.value = '';
      groupUserNameref.current.value = '';
      fetchChannels();
    } else {
      makeToast("error", 'Channel is Not Empty');
    }
  };

  async function fetchChannels() {
    const channels = await channelListQuery();
    setChannelList(channels);
  }

  React.useEffect(() => {
    fetchChannels();
    const token = localStorage.getItem("userId");
    if (token) {
      setUserName(token);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="card">
      <div className="cardHeader">{userName}</div>
      <div className="cardBody">
        <div className="inputGroup">
          <label htmlFor="chatroomName">Create Group Channel</label>
          <input
            type="text"
            name="chatroomName"
            id="chatroomName"
            placeholder="Ex: Group chat name"
            ref={addChatRoomref}
          />
          <label htmlFor="chatroomName">Enter User Name</label>
          <input
            type="text"
            name="groupUserName"
            id="groupUserName"
            placeholder="Enter User Name"
            ref={groupUserNameref}
          />
        </div>
      </div>
      <button onClick={createChatRoom}>Create Chatroom</button>
      <div className="chatrooms">
        {channelList.map((chatroom) => (
          <div key={chatroom.url} className="chatroom">
            <div>{chatroom.name}</div>
            <Link to={"/chatroom/" + chatroom.url}>
              <div className="join">Join</div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
