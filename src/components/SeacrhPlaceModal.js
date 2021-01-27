import React from 'react';
import {
    View,
    TextInput,
    Button,
    Text,
    ActivityIndicator,
    Alert
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { Icon } from 'react-native-elements';
import { google_map_key } from '../common/key';
import { getLatLngByPlaceId } from '../services/MapService';

class SearchPlaceModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            places: null,
            isLoading: false,
            textField: ""
        }

    }

    styles = {
        page: { padding: 15, width: "100%", height: "100%" },
        searchBar: {
            width: "100%",
            padding: 15,
            backgroundColor: "#efefef",
            marginBottom: 15,
            borderRadius: 20,
        },
        title: {
            fontWeight: "bold",
            fontSize: 20,
        }
    }


    async getPlaces(keyword = this.state.textField) {
        fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${google_map_key}&input=${keyword}&components=country:mx`)
            .then(res => res.json())
            .then(response => {
                this.setState({
                    places: response['predictions'] || [],
                    isLoading: false,
                });
            });
    }

    renderContent() {
        const data = Array.from(this.state.places || []);

        if (this.state.isLoading) {
            return (
                <View style={{ justifyContent: "center", alignItems: "center", marginTop: 20 }}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text>Cargando ...</Text>
                </View>
            );
        } else if (this.state.places == null) {
            return (<></>);
        } else if (data.length == 0) {
            return (
                <View style={{ padding: 20, alignItems: "center" }}>
                    <Text style={{ color: "black", fontSize: 25, fontWeight: "bold", textAlign: "center" }}>
                        No se encontraron resultados
                    </Text>
                    <Text> Intenta buscando de otra manera. </Text>
                </View>
            );
        } else {
            return (
                <FlatList
                    data={this.state.places}
                    renderItem={(item) => {
                        const element = item.item;
                        return (
                            <View style={{ flexDirection: "row" }} onTouchStart={() => {

                                getLatLngByPlaceId(element.place_id).then(response => {
                                    Alert.alert("Correcto", "Direccion Cargada", [
                                        {
                                            text: "Continuar",
                                            onPress: () => this.props.closeModal(response),
                                            style: "success"
                                          },
                                    ]);
                                });
                            }}>
                                <Icon
                                    reverse
                                    name='location'
                                    type='evilicon'
                                    color='#517fa4'
                                />

                                <View style={{ display: "flex", flexDirection: "column", paddingTop: 10, paddingRight: 10 }}>
                                    <Text style={this.styles.title}>{element.structured_formatting.main_text || "No Registra"}</Text>
                                    <Text>{element.structured_formatting.secondary_text || "No Registra"}</Text>
                                </View>
                            </View>
                        );
                    }}
                />
            );
        }
    }

    handlePress() {
        if (this.state.textField.length > 0) {
            this.setState({ isLoading: true });
        }

        this.getPlaces();
    }


    render() {
        return (
            <View style={this.styles.page}>
                <Icon
                    reverse
                    name='close'
                    type='evilicon'
                    color='#517fa4'
                    onPress={() => this.props.closeModal()}
                />

                <View style={this.styles.searchBar}>
                    <TextInput placeholder="¿Donde irá el Usuario?" onChangeText={text => this.setState({ textField: text })} />
                </View>
                <Button title="Buscar" onPress={() => this.handlePress()} />

                {this.renderContent()}

            </View>
        );
    }

}

export default SearchPlaceModal;