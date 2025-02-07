import { useEffect, useState, useContext } from 'react';
import { firestore, partiesListener, userDataListener } from '../config/firebase';
import { AuthenticatedUserContext } from '../providers';

export const useUserData = () => {
  // password will not be initially visible
  const [currentUser, setCurrentUser] = useState(null);
  const [loaded, setLoaded] = useState(false)
  const [filled, setFilled] = useState(false)
  const { user, setUser } = useContext(AuthenticatedUserContext);

  useEffect(() => {
    // function that toggles password visibility on a TextInput component on a confirm password field
    console.log("userData hook")
    if (user) {
        setLoaded(false)
        const unsubscribe = userDataListener((snapshot) => {
            const doc = {...snapshot.data(), id: snapshot.id}
            if (doc && snapshot.data()) {
                setCurrentUser(doc)
                if (doc.username && doc.name) setFilled(true)
                console.log("userData: "+JSON.stringify(doc))
                setLoaded(true)
            } else {
                if (currentUser) setLoaded(false)
                setCurrentUser(null)
                setLoaded(true)
            }
        })
        return unsubscribe
    } else setLoaded(true)
    
  }, [user])

  

  return [loaded, currentUser, filled];
};
