//online game user
export interface OnlineUser {
    userId: string;
    userName: string;
    status: string;
}

//online users array
export interface OnlineUsers {
    users: OnlineUser[];
}

export interface Message {
  msg: string;
  user: string;
  matchId: string;
  msgFor: string;
}

export interface DataFromServer {
  type: string;
  msg: string;
  user: string;
  matchId: string;
}

export interface ChatState {
  userName: string;
  isLoggedIn: boolean;
  messages: Message[];
  searchVal: string;
}

// Define an interface for the OnlineGame object
export interface OnlineGame {
  matchId: string;
  hostName: string;
  guestName: string;
  hostId: string;
  guestId: string;
  status: string;
}




