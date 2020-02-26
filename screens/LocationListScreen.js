import React from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    FlatList, 
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Font } from 'expo';
import geolib from 'geolib';

export default class LocationList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            fontLoaded: false,
            locations: [],
            loading: false,
            isRefreshing: false
        }
    }

    async componentDidMount() {
        //Set loading to show loading spinner
        this.setState({loading: true});

        //Load custom fonts
        await Font.loadAsync({
          'josefin-sans-bold': require('../assets/fonts/JosefinSans-Bold.ttf'),
          'josefin-sans': require('../assets/fonts/JosefinSans-Regular.ttf'),
        });
        this.setState({fontLoaded: true});

        //Get list of locations and sort them by distance
        let error = await this.fetchLocations();
        //Only get distance and sort if there was no error getting location data
        if (!error) {
            await this.getLocationsDistance();
            this.sortLocationsByDistance();
        }

        //Set loading to false to hide spinner
        this.setState({loading: false})
    }

    async fetchLocations() {
        //Get locations from API
        let response = await fetch('https://storage.googleapis.com/misc-internal/public/locations_filtered.json');
        let responseJson = await response.json();
        if (response.status === 200) {
            this.setState({locations: responseJson});
        } else {
            console.log('Error getting locations', error);
            return error;
        }
        return;

    }

    async onRefresh() {
        //Pull to refresh function
        this.setState({isRefreshing: true});

        let error = await this.fetchLocations();
        if (!error) {
            await this.getLocationsDistance();
            this.sortLocationsByDistance();
        }

        this.setState({isRefreshing: false});
    }

    async getLocationsDistance() {
        //Calculate distance from Karma HQ using the 'geolib' library
        let locations = this.state.locations.map((location) => {
            location.distance = geolib.getDistance({latitude: 59.330596, longitude: 18.0560967}, {latitude: location.latitude, longitude: location.longitude});
            return location;
        });
        this.setState({locations});
        return;
    }

    sortLocationsByDistance() {
        //Sort locations by distance
        let locations = this.state.locations.sort((a, b) => {
            return a.distance - b.distance;
        });
        this.setState({locations});
    }

    toggleFollowing(item) {
        //Toggle following
        //Create new array to make sure the row in FlatList is updated
        let locations = Array.from(this.state.locations);
        let index = locations.findIndex((location) => {
            return location.id === item.id;
        });
        locations[index].following = !item.following;
        this.setState({locations});
    }

    
  

  render() {
    return (
      <View style={styles.container}>
        {/* PAGE TITLE */}
        {this.state.fontLoaded && <Text style={styles.header}>Locations</Text>}
        {this.state.fontLoaded && <View style={styles.content}>
            {/* LOADING SPINNER */}
            {this.state.loading && <ActivityIndicator size='large' color='#000000'/>}
            {/* LIST OF LOCATIONS */}
            <FlatList
                data={this.state.locations}
                keyExtractor={(item, index) => index.toString()}
                onRefresh={() => this.onRefresh()}
                refreshing={this.state.isRefreshing}
                renderItem={({item}) => {
                    return (<View style={styles.listItem}>
                        {/* LOCATION NAME */}
                        <Text style={styles.locationName}>{item.name}</Text>
                        <View style={{flexDirection: 'row', flex: 1, width: '100%', alignSelf: 'flex-end', justifyContent: 'flex-end', padding: 7}}>
                            {/* DISTANCE FROM KARMA HQ */}
                            <Text style={styles.locationDistance}>Distance: {item.distance || '-'}m</Text>
                            {/* FOLLOW BUTTON */}
                            <TouchableOpacity style={{width: '50%', alignSelf: 'flex-end'}} onPress={() => {this.toggleFollowing(item)}}>
                                <View style={{ width: '70%', backgroundColor: item.following ? '#0f0' : '#000', padding: 4}}>
                                    <Text style={{fontSize: 20, fontFamily: 'josefin-sans-bold', color: '#fff', width: '100%', textAlign: 'center'}}>{item.following ? 'Following' : 'Follow'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>);
                }}
            ></FlatList>
        </View>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {    
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      height: 120,
      marginTop: 10,
      width: '100%',
      alignSelf: 'flex-start',
      padding: 14,
      paddingLeft: 8,
      fontFamily: 'josefin-sans-bold',
      fontSize: 36,
      backgroundColor: '#fff'
    },
    content: {
      alignSelf: 'flex-start',
      flex: 1,
      padding: 0,
      margin: 0,
      width: '100%',
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    listItem: {
      width: '100%',
      height: 120,
      padding: 8,
      margin: 0,
      backgroundColor: '#fff'
    },
    locationName: {
        width: '100%',
        fontSize: 20,
  
        fontFamily: 'josefin-sans-bold',
        alignSelf: 'flex-start'
    },
    locationDistance: {
      width: '50%',
      fontSize: 16,
  
      fontFamily: 'josefin-sans',
      alignSelf: 'flex-end',
      textAlign: 'left'
    },
  });
  