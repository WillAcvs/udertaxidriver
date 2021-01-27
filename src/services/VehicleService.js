import firebase from 'firebase';
import 'firebase/database';
import 'firebase/auth';

const getRateByVehicle = async ( callBack )=> {
    const userId = firebase.auth().currentUser.uid;
    firebase.database().ref().child("users/" + userId).on("value", (doc)=> {
        const vehicleType = doc.val().carType;
        const result = firebase.database().ref().child("rates/car_type").orderByChild("name").startAt(vehicleType);

        result.on("value", (response)=> {
            callBack(
                !!response.val() ? response.val()[0] : null
            );
        })
    });
}

export {
    getRateByVehicle
}