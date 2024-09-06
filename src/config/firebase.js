// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyAISShFfcP_JjdKuKjHKCvC2zBmMUIWbl4",
  authDomain: "chat-app-pc-10287.firebaseapp.com",
  projectId: "chat-app-pc-10287",
  storageBucket: "chat-app-pc-10287.appspot.com",
  messagingSenderId: "822988393561",
  appId: "1:822988393561:web:fdf486f5bce062430f7548",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


const checkUserNameExist = async (username) => {
  const userRef = collection(db, 'users')
  const q = query(userRef, where("username", '==',username))
  const querySnapShot = await getDocs(q)
  return !querySnapShot.empty
}

const signup = async (username, email, password) => {
  try {
    // const usernameExist = await checkUserNameExist(username)
    // if (usernameExist) {
    //   toast.error("User name already taken, please try another")
    //   return
    // }
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, There i am using chat app",
      lastSeen: Date.now(),
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: [],
    });
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const resetPassword = async (email) => {
  if(!email){
    toast.error("Enter your email")
    return null
  }
  try {
    const userRef = collection(db,'users')
    const q = query(userRef,where("email","==",email))
    const querySnap = await getDocs(q)
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth,email)
      toast.success("Reset Email Send")
    }else{
      toast.error("Email does not exist")
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message)
    
  }
}

export { signup, login, logout, auth, db, resetPassword };
