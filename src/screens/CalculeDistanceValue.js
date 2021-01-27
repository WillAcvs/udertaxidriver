import React from 'react';
import {
  View,
  Text,
  Button,
  Modal,
  Alert
} from 'react-native';
import { Divider } from 'react-native-elements';
import { TextInput } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

import * as Location from 'expo-location';
import { AppLoading } from 'expo';
import { SearchPlaceModal } from '../components';
import { getCoordinatesForPolyline } from '../services/MapService';
import { getRateByVehicle } from '../services/VehicleService';


const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;

class CalculeDistanceValue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coordinates: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      isLoading: true,
      markers: {},
      polylines: [],
      isModalOpen: false,
      serviceData: {},
      vehicleRate: 0,
      mode: "",
      localText: "Cambiar Ubicacion de Partida",
      userText: "¿A donde irá el Usuario?"
    }
    this.mapView = null;
  }

  /**
   * Estos son los estilós generales de la vista
   * se usan para las vistas menores y algunas generales
   */
  componentStyle = {
    route: { padding: 15, alignItems: "flex-start" },
    searchBar: { width: "100%", padding: 15, backgroundColor: "#efefef", marginBottom: 15, borderRadius: 20 },
    mapView: { width: "100%", height: "70%" },
    loadingPage: { width: "100%", height: "100%", alignContent: "center" },
    titlePage: { fontSize: 35, fontWeight: "bold" },
    serviceData: {
      title: { fontSize: 16, fontWeight: "bold", color: "green" },
      subtTitle: { fontSize: 10 },
    }
  }


  componentDidMount() {
    this.getCoordinates();
    getRateByVehicle((vehicleData) => {
      if (vehicleData == null) {
        Alert.alert("Ocurrio un Error", "No tienes asignado un vehiculo");
      } else {
        this.setState({
          vehicleRate: vehicleData.rate_per_kilometer,
        })
      }
    });
  }

  componentWillUnmount(){
    this.mapView = null;
  }

  /**
   * Con esto se puede obtener las @Coordenates actuales del conductor
   * ademas se pone el marker inicial en ese lugar
   */
  getCoordinates() {
    Location.requestPermissionsAsync().then((state) => {
      if (state.granted) {
        Location.getCurrentPositionAsync().then((location) => {
          const currentCoordenates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          };
          const marker = {
            "init": {
              coordinates: currentCoordenates,
              title: "Mi Ubicacion",
              description: "Esta es tu Ubicación"
            }
          }
          this.setState({
            coordinates: currentCoordenates,
            markers: marker,
          });

          this.updateMapCoordinates();
        });
      } else {
        Alert.alert("Error", "Debes habilitar el GPS");
      }
      this.setState({ isLoading: false });
    });
  }


  /**
   * Este metodo hace que al momento de cargar las @Coordenadas
   * se cambie la posicion de la camara
   */
  updateMapCoordinates() {
    if (this.mapView != null) {
      this.mapView.animateToCoordinate(this.state.coordinates);
    } else {
      this.updateMapCoordinates();
    }
  }


  /**
   * Esto imprime la @Polyline necesaria para ir de un sitio a otro
   */
  renderPoly() {
    const markers = this.state.markers;

    if (Object.keys(markers).length > 1 && this.state.polylines.length > 0) {
      return (
        <Polyline
          coordinates={[...this.state.polylines]}
          strokeColor="#000"
          strokeColors={["#7F0000"]}
          strokeWidth={6}
        />
      );
    }

    return (<></>);
  }

  /**
   * Este calculador muestra el costo base de el servicio
   * hace uso del tiempo y depende de @state
   */
  renderCalculator() {
    const calculeServiceValue = ()=> {
      return ((this.state.serviceData.distance / 1000) * this.state.vehicleRate).toFixed(3);
    }

    if (!!this.state.serviceData.distance == false) {
      return (<></>);
    }

    return (
      <View style={{ padding: 10, flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
        <View>
          <Text style={this.componentStyle.serviceData.title}> {this.state.serviceData.duration} </Text>
          <Text style={this.componentStyle.serviceData.subtTitle}> Tiempo (minutos) </Text>
        </View>

        {
          this.state.vehicleRate != 0 && (
            <View>
              <Text style={this.componentStyle.serviceData.title}> {calculeServiceValue()} </Text>
              <Text style={this.componentStyle.serviceData.subtTitle}> Valor (MXN) </Text>
            </View>
          )
        }

        <View>
          <Text style={this.componentStyle.serviceData.title}> {this.state.serviceData.distance} </Text>
          <Text style={this.componentStyle.serviceData.subtTitle}> Distancia (metros) </Text>
        </View>
      </View>
    );
  }

  render() {
    if (this.state.isLoading) {
      return <AppLoading
        startAsync={this.getCoordinates()}
        onFinish={() => true}
        onError={console.warn}
        autoHideSplash={true}
      />
    }

    return (
      <View style={this.componentStyle.route}>
        <Button title="Regresar" color="#2196F3" onPress={() => {
          this.props.navigation.goBack(null);          
        }} />

        <Text style={this.componentStyle.titlePage}> {"Calcula un Recorrido"}, </Text>
        <Text style={{ marginBottom: 10 }}> Aqui puedes ver cuanto cuesta hacer un servicio </Text>

        <Divider />

        <View style={this.componentStyle.searchBar} onTouchStart={() => this.setState({ isModalOpen: true, mode: "rider" })}>
          <TextInput placeholder={this.state.userText} placeholderTextColor="black"/>
        </View>

        
        <View style={this.componentStyle.searchBar} onTouchStart={() => this.setState({ isModalOpen: true, mode: "driver" })}>
          <TextInput placeholder={this.state.localText} placeholderTextColor="black"/>
        </View>

        {this.renderCalculator()}
        <View style={{ width: "100%", height: "65%" }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            region={this.state.coordinates}
            showsUserLocation
            showsMyLocationButton
            style={this.componentStyle.mapView}
            ref={ref => this.mapView = ref}
            minZoomLevel={13.9}
            onMapReady={() => {
            }} >

            {
              Object.keys(this.state.markers).length > 0
              && Object.keys(this.state.markers).map((key) => {
                const element = this.state.markers[key];
                return (
                  <Marker
                    key={Math.random()}
                    coordinate={element.coordinates}
                    title={element.title}
                    description={element.description}
                    ref={ ref => {
                      ref?.showCallout();
                    }}
                    image={require('../../assets/images/rsz_2red_pin.png')}
                  />
                );
              })
            }

            {this.renderPoly()}

          </MapView>
        </View>

        <Modal
          animationType="slide"
          visible={this.state.isModalOpen}
          onDismiss={() => this.setState({ isModalOpen: false })}
        >
          <SearchPlaceModal
          mode={this.state.mode}
            closeModal={async (response) => {
              this.setState({ isModalOpen: false });
              const isDriver = this.state.mode == "driver";
              console.log("-------------------------->");


              if (!!response) {
                let currentCoordinates = { ...this.state.markers };
                
                const key = isDriver ? "init" : "final";

                currentCoordinates[key] = {
                  coordinates: {
                    latitude: response.position.lat,
                    longitude: response.position.lng,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                  },
                  title: "Destino",
                  description: "Lugar de Llegada"
                };



                /**
                 * Esta es la informacion general del recorrdo,
                 * devuelve: 
                 * 
                 * @Coordenates => @Array
                 * @Distance => @Number
                 * @Time => @Number
                 * 
                 */

                const serviceData = await getCoordinatesForPolyline(
                  currentCoordinates['init']['coordinates'],
                  currentCoordinates['final']['coordinates']
                );


                this.setState({
                  markers: currentCoordinates,
                  polylines: serviceData.coordenates,
                  serviceData: {
                    distance: serviceData.distance,
                    duration: serviceData.time
                  },
                  coordinates: {
                    longitude: currentCoordinates['init']['coordinates']['longitude'],
                    latitude: currentCoordinates['init']['coordinates']['latitude'],
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                  },
                  [isDriver ? "localText" : "userText"]: (isDriver ? "Inicia en: " : "Dejar en: ") + response.name,
                })
                console.log(response);

                
                this.updateMapCoordinates();
              }
            }}
          />

        </Modal>

      </View>
    );
  }
}

export default CalculeDistanceValue;