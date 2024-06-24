import React, { useEffect, useState } from 'react';
import './chatlist.css'
import { useUserStore } from '../../../lib/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import Adduser from './addUser/Adduser';
import { useChatStore } from '../../../lib/chatStore';


function ChatList(props) {
    const [add, Setadd] = useState(false);
    const [chat, setChat] = useState([]);
    const [input, setInput] = useState("");

    const { currentUser } = useUserStore();
    const { changeChat, chatId } = useChatStore();

    useEffect(() => {
        if (!currentUser?.id) {
            console.log("currentUser.id is not defined");
            return;
        }

        console.log(`Subscribing to document: userchats/${currentUser.id}`);
        
        const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
            try {
                if (!res.exists()) {
                    console.log(`Document userchats/${currentUser.id} does not exist`);
                    setChat([]);
                    return;
                }

                const data = res.data();
                console.log("Document data:", data);
                
                const items = data?.chats;
                console.log("Chat items:", items);

                if (!items) {
                    console.log("No chat items found");
                    setChat([]);
                    return;
                }

                const promises = items.map(async (item) => {
                    const userDocref = doc(db, "users", item.receiverId);
                    const userDocSnap = await getDoc(userDocref);
                    
                    if (!userDocSnap.exists()) {
                        console.log(`User document for receiverId ${item.receiverId} does not exist`);
                        return { ...item, user: null };
                    }

                    const user = userDocSnap.data();
                    console.log("User data for receiverId:", item.receiverId, user);
                    return { ...item, user };
                });

                const chatData = await Promise.all(promises);
                setChat(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
            } catch (error) {
                console.error("Error fetching chat data:", error);
            }
        });

        return () => {
            console.log(`Unsubscribing from document: userchats/${currentUser.id}`);
            unSub();
        };
    }, [currentUser?.id]);

    const handleSelect = async (selectedChat) => {
        const userchats = chat.map((item) => {
            const { user, ...rest } = item;
            return rest;
        });

        const chatIndex = userchats.findIndex((item) => item.chatId === selectedChat.chatId);
        if (chatIndex >= 0) {
            userchats[chatIndex].isSeen = true;

            const userChatRef = doc(db, "userchats", currentUser.id);

            try {
                await updateDoc(userChatRef, {
                    chats: userchats,
                });
                changeChat(selectedChat.chatId, selectedChat.user);
            } catch (error) {
                console.error("Error updating chat document:", error);
            }
        }
    };

    const filteredChats = chat.filter((c) => c.user.username.toLowerCase().includes(input.toLowerCase()));

    return (
        <div className='ChatList'>
            <div className="search">
                <div className="searchbar">
                    <img src="./search.png" alt="" />
                    <input type="text"
                        placeholder='Search'
                        onChange={(e) => setInput(e.target.value)} />
                </div>
                <img src={add ? "./minus.png" : "./plus.png"}
                    alt=""
                    className='add'
                    onClick={() => Setadd((prev) => !prev)} />
            </div>

            {filteredChats.map((chat) => (
                <div
                    className="item"
                    key={chat.chatId}
                    onClick={() => handleSelect(chat)}
                    style={{
                        backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
                    }}
                >
                    <img
                        src={
                            chat.user.blocked.includes(currentUser.id)
                                ? "./avatar.png"
                                : chat.user.avatar || "./avatar.png"
                        }
                        alt=""
                    />
                    <div className="texts">
                        <span>
                            {chat.user.blocked.includes(currentUser.id)
                                ? "User"
                                : chat.user.username}
                        </span>
                        <p>{chat.lastMessage}</p>
                    </div>
                </div>
            ))}

            {add && <Adduser />}
        </div>
    );
}

export default ChatList;