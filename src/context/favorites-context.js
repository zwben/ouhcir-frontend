import React, { useState, useEffect, useContext } from 'react';
import AuthContext from './auth-context';
import { auth, db } from '../firebase-config';
import { addDoc, updateDoc, getDocs, collection, query, where} from 'firebase/firestore';
import TaskContext from './task-context';

const FavouritesContext = React.createContext({
    favourites: [],
    saveFavourite: (promptID, text) => {},
    removeFavourite: (promptID) => {},
});

export const FavouritesContextProvider = (props) => {
    const [favourites, setFavourites] = useState([]);
    const authCtx = useContext(AuthContext)
    const taskCtx = useContext(TaskContext)

    // Get all the favourites
    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const q = query(collection(db, 'favourites'), where('taskID', '==', taskCtx.taskID));
                const querySnapshot = await getDocs(q);
                console.log(taskCtx.taskID)
                const favouritesData = querySnapshot.docs[0]?.data().favourites
                console.log(favouritesData)          
                setFavourites(favouritesData);
            } catch (error) {
                console.error('Error fetching favourites:', error);
            }
        };
        fetchFavourites();
    }, [taskCtx.taskID]);

    const saveFavourite = async (promptID, text) => {
        try {
            const favouritesRef = collection(db, 'favourites');
            const querySnapshot = await getDocs(query(favouritesRef, where('taskID', '==', taskCtx.taskID)));

            if (!querySnapshot.empty) {
                // Update existing favourites for the matching taskID
                const favouritesDoc = querySnapshot.docs[0];
                const existingFavourites = favouritesDoc.data().favourites || [];
                const updatedFavourites = [...existingFavourites, { promptID, text }];
                await updateDoc(favouritesDoc.ref, { favourites: updatedFavourites });
                setFavourites(updatedFavourites);
            } else {
                // Add a new document for the non-matching taskID
                await addDoc(favouritesRef, {
                    taskID: taskCtx.taskID,
                    favourites: [{ promptID, text }],
                });
                setFavourites([{ promptID, text }]);
            }
        } catch (error) {
            console.error('Error saving favourite:', error);
        }
    };


    const removeFavourite = async (promptID) => {
        // try {
        //     const userId = authCtx.user.uid; // Replace with the user ID from Firebase Auth
        //     const favouritesRef = firebase.firestore().collection('users').doc(userId).collection('favourites');
        //     await favouritesRef.doc(promptID).delete();
        //     setFavourites(favourites.filter((fav) => fav.promptID !== promptID));
        // } catch (error) {
        // console.error('Error removing favourite:', error);
        // }
    };

    const contextValue = {
        favourites: favourites,
        saveFavourite: saveFavourite,
        removeFavourite: removeFavourite,
    };

    return <FavouritesContext.Provider value={contextValue}>{props.children}</FavouritesContext.Provider>;
};

export default FavouritesContext;
