import { Notifications } from 'expo';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

class FCMService {
    
    static async updateFCM(){
        firebase.auth().onAuthStateChanged( async user => {
            const id = user.uid;
            try{
                firebase.database().ref().child("users/" + id).update({
                    pushToken: await Notifications.getExpoPushTokenAsync(),
                })
            }catch (e){
                firebase.database().ref().child("logs/" + id).set({
                    errorType: "FCMToken Error",
                    userId: id,
                    causedAt: new Date().toISOString(),
                })
            }
        })
    }
}

export default FCMService;