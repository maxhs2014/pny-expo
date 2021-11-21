import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { query, collection, endAt, orderBy, startAt, onSnapshot, getFirestore, getDocs, getDoc, doc, addDoc, setDoc, updateDoc, where, arrayUnion, arrayRemove, increment } from "@firebase/firestore";
import Constants from 'expo-constants';
const geofire = require("geofire-common")

// add firebase config
/*const firebaseConfig = {
  apiKey: Constants.manifest.extra.apiKey,
  authDomain: Constants.manifest.extra.authDomain,
  projectId: Constants.manifest.extra.projectId,
  storageBucket: Constants.manifest.extra.storageBucket,
  messagingSenderId: Constants.manifest.extra.messagingSenderId,
  appId: Constants.manifest.extra.appId
};*/
const firebaseConfig = {
  apiKey: "AIzaSyAAhzSqfeYVBD6rL9Fl5K1kmMj6hA3NWV0",
  authDomain: "party-near-you-710cf.firebaseapp.com",
  projectId: "party-near-you-710cf",
  storageBucket: "party-near-you-710cf.appspot.com",
  messagingSenderId: "1049403930099",
  appId: "1:1049403930099:web:972607c2a6677807918e86",
  measurementId: "G-6RD2P9HVC0"
};

// initialize firebase
initializeApp(firebaseConfig);

// initialize auth
const auth = getAuth();
const firestore = getFirestore()

export function userDataListener(callback) { 
  return onSnapshot(doc(firestore, "users", auth.currentUser.uid), callback)
}

export function createTestDoc() {
  addDoc(collection(firestore, "parties"), {name: "test party"})
}

export function listenParties(coords, radius) {
  var partyDocs = []
  const bounds = geofire.geohashQueryBounds([coords.latitude, coords.longitude], radius);
  const boundPromises = [];
  for (const b of bounds) {
      const q = query(collection(firestore, "parties"), orderBy("geohash"), startAt(b[0]), endAt(b[1]))
      //const q = query(collection(firestore, "parties"))
  /*const q = firestore.collection('parties')
      .orderBy('geohash')
      .startAt(b[0])
      .endAt(b[1]);*/

      boundPromises.push(getDocs(q))
      /*, (querySnapshot) => {
          var docs = []
          querySnapshot.forEach((snap) => docs.push({...snap.data(), id: snap.id}))
          console.log(docs.length)
          var updatedDocs = [...partyDocs]
          updatedDocs = updatedDocs.filter(doc => docs.findIndex(d => d.id == doc.id) == -1)
          partyDocs = [...updatedDocs, ...docs]
          callback(partyDocs)
      }));*/
  }
  return Promise.all(boundPromises)
}

export async function attendParty(parties, coords) {
  const uid = auth.currentUser.uid
  if (parties.length > 0 && parties[0].distance < 0.1) {
    const update = {}
    update["user_"+uid] = true
    if (!("user_"+uid in parties[0])) updateUserData(true, {score: increment(1)})
    return updateDoc(doc(firestore, "parties", parties[0].id), update)
  } else {
    return new Promise((resolve, reject) => {
      const geohash = geofire.geohashForLocation([coords.latitude, coords.longitude])
      const newDoc = {geohash, loc: coords}
      newDoc["user_"+uid] = true
      updateUserData(true, {score: increment(1)})
      addDoc(collection(firestore, "parties"), newDoc).then(() => resolve())
      
    })
    
  }
}

export function leaveParty(id) {
  const uid = auth.currentUser.uid
  const update = {}
  update["user_"+uid] = false
  return updateDoc(doc(firestore, "parties", id), update)
}

export function distance(coords1, coords2) {
  return geofire.distanceBetween([coords1.latitude, coords1.longitude], [coords2.latitude, coords2.longitude])
}

export function partiesListener (uid, callback) {
  return onSnapshot(query(collection(firestore, "parties"), where("user_"+uid, "==", true)), callback)
}

export function reportInfo(partyID, field) {
  const updateData = {}
  updateData[field] = arrayUnion(auth.currentUser.uid)
  const actions = []
  if (field == "good") actions.push(unreportInfo(partyID, "bad"))
  else if (field == "bad") actions.push(unreportInfo(partyID, "good"))
  actions.push(updateDoc(doc(firestore, "parties", partyID), updateData))
  return Promise.all(actions)
}
export function unreportInfo(partyID, field) {
  const updateData = {}
  updateData[field] = arrayRemove(auth.currentUser.uid)
  return updateDoc(doc(firestore, "parties", partyID), updateData)
}
export function usernameLookUp(username) {
  return getDocs(query(collection(firestore, "users"), where("username", "==", username)))
}

export async function usernameExists(username) {
  const unSnaps = await usernameLookUp(username)
  const unDocs = []
  unSnaps.forEach((snap) => unDocs.push({...snap.data(), id: snap.id}))
  if (unDocs.length == 0 || (unDocs.length == 1 && unDocs[0].id == auth.currentUser.uid)) return false
  return true
}

export function updateUserData(userData, data) {
  if (userData) return updateDoc(doc(firestore, "users", auth.currentUser.uid), data)
  return setDoc(doc(firestore, "users", auth.currentUser.uid), data)
}

export function getUser(uid) {
  return getDoc(doc(firestore, "users", uid))
}

export function getUsers(users) {
  return Promise.all(users.map((user) => getUser(user)))
}

export function searchUsername(q) {
  if (q && q.length > 0) return getDocs(query(collection(firestore, "users"), orderBy("username"), startAt(q), endAt(q + "\uf8ff")))
  return []
}
export function requestFriend(uid, user) {
  return new Promise(async (resolve, reject) => {
    const modFriend = {incomingRequests: arrayUnion(auth.currentUser.uid)}
    await updateDoc(doc(firestore, "users", uid), modFriend)
    var friend = await getDoc(doc(firestore, "users", uid))
    friend = {...friend.data(), id: friend.id}

    const modSelf = {outgoingRequests: arrayUnion(uid)}
    await updateDoc(doc(firestore, "users", auth.currentUser.uid), modSelf)

    if (friend.pushToken) sendPushNotification(user, friend)
    resolve()
  })
}

export function sendPushNotification(from, to) {
  const message = {
    to: to.pushToken,
    sound: 'default',
    title: `${from.username} sent you a friend request`,
    body: `${from.username} (${from.name}) wants to add you as their friend. Press to see what parties they are at.`,
  };

  fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

export function declineRequest(uid) {
  return new Promise(async (resolve, reject) => {
    const modFriend = {incomingRequests: arrayRemove(auth.currentUser.uid)}
    await updateDoc(doc(firestore, "users", uid), modFriend)

    const modSelf = {outgoingRequests: arrayRemove(uid)}
    await updateDoc(doc(firestore, "users", auth.currentUser.uid), modSelf)
    resolve()
  })
}

export function removeFriend(uid) {
  return new Promise(async (resolve, reject) => {
    const modFriend = {friends: arrayRemove(auth.currentUser.uid)}
    await updateDoc(doc(firestore, "users", uid), modFriend)

    const modSelf = {friends: arrayRemove(uid)}
    await updateDoc(doc(firestore, "users", auth.currentUser.uid), modSelf)
    resolve()
  })
}

export function acceptRequest(uid) {
  return new Promise(async (resolve, reject) => {
    const modFriend = {friends: arrayUnion(auth.currentUser.uid), outgoingRequests: arrayRemove(auth.currentUser.uid)}
    await updateDoc(doc(firestore, "users", uid), modFriend)

    const modSelf = {friends: arrayUnion(uid), incomingRequests: arrayRemove(uid)}
    await updateDoc(doc(firestore, "users", auth.currentUser.uid), modSelf)
    resolve()
  })
}

export function getAdID() {
  const testID = 'ca-app-pub-3940256099942544/6300978111';
  const productionID = 'ca-app-pub-5790083206239403/4089514200';
  // Is a real device and running in production.
  return Constants.isDevice && !__DEV__ ? productionID : testID;
}

export { auth, firestore };
