import React, { Component } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';


export default class MapComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { mapRegion, markerCord, mapStyle } = this.props;
        return (
            <MapView
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
                showsMyLocationButton={true}
                style={[mapStyle, { marginBottom: this.state.marginBottom }]}
                region={mapRegion}
                minZoomLevel={12.3}
                maxZoomLevel={18}
                onMapReady={() => this.setState({ marginBottom: 1 })}
            >
                <Marker
                    coordinate={markerCord}
                    title={'DEJAR'}
                    description={'Deja al usuario aquí'}
                    ref={ref => ref?.showCallout()}
                    image={require('../../assets/images/rsz_2red_pin.png')}
                >
                </Marker>

                {
                    this.props.add && (
                        <Marker
                            coordinate={this.props.add}
                            title={'RECOGER'}
                            description={'Aqui debes buscar al usuario'}
                            ref={ref => ref?.showCallout()}
                            image={require('../../assets/images/rsz_2red_pin.png')}
                        >
                        </Marker>
                    )
                }
            </MapView>
        );
    }
}
