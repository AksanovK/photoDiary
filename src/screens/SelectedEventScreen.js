import React, {Component} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {getDBConnection, getDiaryItemById} from '../util/db';

export class SelectedEventScreen extends Component {
  state = {
    isLoading: true,
    event: null,
    eventName: '',
    eventDescription: '',
  };

  componentDidMount = () => {
    this.getEventData();
  };

  getEventData = async () => {
    const {itemId} = this.props.route.params;
    try {
      const db = await getDBConnection();
      const event = await getDiaryItemById(db, itemId);
      this.setState({event, isLoading: false});
    } catch (error) {
      console.error(error);
      this.setState({isLoading: false});
    }
  };

  onBackPress = item => {
    const {date} = this.props.route.params;
    this.props.navigation.navigate('selectedDay', {
      date: date,
      isFirst: false,
    });
  };

  onEditPress = item => {
    const {date} = this.props.route.params;
    const {event} = this.state;
    this.props.navigation.navigate('editEvent', {
      eventId: event.id,
      isCreating: false,
      date: date,
    });
  };

  getNameOfEvent = () => {
    const {event} = this.state;
    return event ? event.name : '';
  };

  getDescriptionOfEvent = () => {
    const {event} = this.state;
    return event ? event.value : '';
  };

  render = () => {
    const {isLoading} = this.state;
    let count = 0;
    return isLoading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000AFF" />
      </View>
    ) : (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={this.onBackPress.bind(this)}>
            <Image
              source={require('../../assets/images/back.png')}
              style={styles.backButtonImage}
            />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.dayTitle}>{this.getNameOfEvent()}</Text>
          </View>
          <TouchableOpacity onPress={this.onEditPress.bind(this)}>
            <Image
              source={require('../../assets/images/editeventicon.png')}
              style={styles.editButtonStyle}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.nameValue}>{this.getDescriptionOfEvent()}</Text>
        <View style={styles.centralBodyContainer}>
          <Image
            source={require('../../assets/images/separation.png')}
            style={styles.separationStyle}
          />
          <View style={styles.photosContainer}>
            {this.state.event &&
              this.state.event.photos &&
              this.state.event.photos.split(',').map((photo, index) => {
                if (typeof photo === 'string' && photo.trim() !== '') {
                  if (this.state.event.id === 1 && count < 2) {
                    count = count + 1;
                    return count === 1 ? (
                      <Image
                        key={index}
                        source={require('../../assets/images/welcome.png')}
                        style={styles.photo}
                        alt="img"
                      />
                    ) : (
                      <Image
                        key={index}
                        source={require('../../assets/images/smiley.png')}
                        style={styles.photo}
                        alt="img"
                      />
                    );
                  } else {
                    return (
                      <Image
                        key={index}
                        source={{uri: photo}}
                        style={styles.photo}
                        alt="img"
                      />
                    );
                  }
                } else {
                  return null;
                }
              })}
          </View>
        </View>
      </ScrollView>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separationStyle: {
    width: 336,
    height: 9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 10,
  },
  backButtonImage: {
    width: 24,
    height: 24,
  },
  dayTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#0029FF',
    paddingRight: 25,
  },
  nameTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#0029FF',
    paddingRight: 25,
    paddingTop: 20,
  },
  nameValue: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#000000',
    paddingRight: 25,
    paddingTop: 25,
  },
  centralBodyContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  inputEvent: {
    width: '100%',
    marginTop: 5,
    textAlignVertical: 'top',
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
  },
  photosContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  photo: {
    width: 300,
    height: 300,
    marginHorizontal: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  editButtonStyle: {
    width: 24,
    height: 24,
  },
});
export default SelectedEventScreen;
