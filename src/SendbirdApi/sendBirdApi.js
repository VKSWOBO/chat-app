import React from "react";
  import SendBird from "sendbird";
  import { nanoid } from "nanoid";
  
  const APP_ID = "6D074215-DAFB-427C-897A-DA1619D5597B"
  const UNIQUE_HANDLER_ID = nanoid();
  
  export const useSendBird = () => SendBirdValue();
  
  function SendBirdValue() {
    const sbRef = React.useRef(null);
    const channelHandler = React.useRef(null);
    const userId = localStorage.getItem("userId");
  
    React.useLayoutEffect(() => {
      sbRef.current = new SendBird({
        appId: APP_ID
      });
  
      if (userId) {
        sbRef.current.connect(userId, function (user, error) {
          if (error) console.log(error);
        });
      }
  
      channelHandler.current = new sbRef.current.ChannelHandler();
  
      sbRef.current.addChannelHandler(UNIQUE_HANDLER_ID, channelHandler.current);
  
      return () => {
        sbRef.current.removeChannelHandler(UNIQUE_HANDLER_ID);
      };
    }, [userId]);
  
    function connect(USER_ID = null) {
      sbRef.current.connect(USER_ID, (user, error) => {
        if (error) return console.log(error);
  
        console.log(userId," connect");
      });
    }
  
    function disconnect() {
      sbRef.current.disconnect(function () {
        console.log(userId," disconnect");
      });
    }
  
    function onMessageReceived() {
      return new Promise((resolve, reject) => {
        channelHandler.current.onMessageReceived = function (channel, message) {
          resolve({ channel, message });
        };
      });
    }
  
    
    function createOpenChannel(channelName) {
      return new Promise((resolve,reject)=>{
        sbRef.current.OpenChannel.createChannel(channelName,null,null,(openChannel,error)=>{
          if(error){
            reject(error)
          }
          resolve(openChannel)
        })
      })
    }

    function createChannelWithUserIds(userName, channelName) {
      var name = [`${userId}`, `${userName}`]
      return new Promise((resolve,reject)=>{
        sbRef.current.GroupChannel.createChannelWithUserIds(name,false,channelName,null,null,(openChannel,error)=>{
          if(error){
            reject(error)
          }
          resolve(openChannel)
        })
      })
    }

    function openChannelListQuery() {
      return new Promise((resolve, reject) => {
        var channelListQuery = sbRef.current.OpenChannel.createOpenChannelListQuery();
        channelListQuery.includeEmpty = true;
        channelListQuery.limit = 15;
  
        if (channelListQuery.hasNext) {
          channelListQuery.next(async function (channelList, error) {
            if (error) {
              reject(error);
            }
            resolve(channelList);
          });
        }
      });
    }

    function channelListQuery() {
      return new Promise((resolve, reject) => {
        var channelListQuery = sbRef.current.GroupChannel.createMyGroupChannelListQuery();
        channelListQuery.includeEmpty = true;
        channelListQuery.order = "latest_last_message";
        channelListQuery.limit = 15;
  
        if (channelListQuery.hasNext) {
          channelListQuery.next(async function (channelList, error) {
            if (error) {
              reject(error);
            }
            resolve(channelList);
          });
        }
      });
    }

    function getGroupChannel(CHANNEL_URL = null) {
      return new Promise((resolve, reject) => {
        sbRef.current.GroupChannel.getChannel(CHANNEL_URL, function (
          groupChannel,
          error
        ) {
          if (error) {
            reject(error);
          }
          resolve(groupChannel);
        });
      });
    }

    function sendUserMessage(
      groupChannel = null,
      TEXT_MESSAGE = null,
      CUSTOM_TYPE = null,
      DATA = null
    ) {
      return new Promise((resolve, reject) => {
        const params = new sbRef.current.UserMessageParams();
        params.message = TEXT_MESSAGE;
        groupChannel.sendUserMessage(params, function (message, error) {
          if (error) {
            reject(error);
          }
          resolve(message);
        });
      });
    }
    
    function createPreviousMessageListQuery(
      groupChannel = null,
      LIMIT = 10,
      REVERSE = false
    ) {
      return new Promise((resolve, reject) => {
        var prevMessageListQuery = groupChannel.createPreviousMessageListQuery();
        prevMessageListQuery.reverse = REVERSE;
        prevMessageListQuery.includeMetaArray = true;
        prevMessageListQuery.includeReaction = true;
        resolve(prevMessageListQuery);
      });
    }
  
    return {
      connect,
      disconnect,
      onMessageReceived,
      createOpenChannel,
      createChannelWithUserIds,
      openChannelListQuery,
      channelListQuery,
      getGroupChannel,
      sendUserMessage,
      createPreviousMessageListQuery,
    };
  }
  