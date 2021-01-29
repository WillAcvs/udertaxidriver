import { Linking } from "react-native";

const { google_map_key } = require("../common/key");

const getLatLngByPlaceId = async (placeId) => {
    const route = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${google_map_key}`;
    const response = (await (await fetch(route)).json());
    return {
        position: response['result']['geometry']['location'] || null,
        name: response['result']['name'] || ""
    };
}

const getCoordinatesForPolyline = async (originObject, destinationObject) => {
    const origin = `${originObject['latitude']},${originObject['longitude']}`;
    const destination = `${destinationObject['latitude']},${destinationObject['longitude']}`;

    const route = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${google_map_key}&mode=driving`;
    const response = await (await fetch(route)).json();
    const routes = response.routes[0];
    return {
        "coordenates": calculeCoordinates(routes.overview_polyline.points), /** @Array */
        "distance": routes.legs[0].distance['value'], /** @Number */
        "time": (routes.legs[0].duration['value'] / 60).toFixed(1) /** @Number */,
    };
}

const calculeCoordinates = (t, e) => {
    for (var n, o, u = 0, l = 0, r = 0, d = [], h = 0, i = 0, a = null, c = Math.pow(10, e || 5); u < t.length;) { a = null, h = 0, i = 0; do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32); n = 1 & i ? ~(i >> 1) : i >> 1, h = i = 0; do a = t.charCodeAt(u++) - 63, i |= (31 & a) << h, h += 5; while (a >= 32); o = 1 & i ? ~(i >> 1) : i >> 1, l += n, r += o, d.push([l / c, r / c]) } return d = d.map(function (t) { return { latitude: t[0], longitude: t[1] } })
}

const openMaps = ({ lat, lng }) => {
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=${lat},${lng}`;
    Linking.canOpenURL(url).then(supported => {
        if (!supported) {
            console.log('Can\'t handle url: ' + url);
        } else {
            return Linking.openURL(url);
        }
    }).catch(err => console.error('An error occurred', err));
}
export {
    getLatLngByPlaceId,
    getCoordinatesForPolyline,
    openMaps
};