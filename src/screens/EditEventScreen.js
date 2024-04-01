import React, {Component} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getDBConnection,
  getDiaryItemById,
  insertTodoItem,
  updateTodoItem,
} from '../util/db';
import * as ImagePicker from 'react-native-image-picker';

export class EditEventScreen extends Component {
  state = {
    isLoading: true,
    event: null,
    eventDate: '',
    eventName: '',
    eventDescription: '',
    eventPhotos: [],
    isModalVisible: false,
  };

  componentDidMount = () => {
    this.getEventData();
  };

  getTitle = () => {
    const {isCreating} = this.props.route.params;
    if (isCreating) {
      return 'Создание события';
    } else {
      return 'Редактирование события';
    }
  };

  getEventData = async () => {
    const {isCreating} = this.props.route.params;
    if (!isCreating) {
      const {eventId} = this.props.route.params;
      try {
        const db = await getDBConnection();
        const event = await getDiaryItemById(db, eventId);
        const eventPhotos = event.photos ? event.photos.split(',') : [];
        const eventName = event.name ? event.name : '';
        const eventDescription = event.value ? event.value : '';
        this.setState({
          eventDescription,
          eventName,
          event,
          eventPhotos,
          isLoading: false,
        });
      } catch (error) {
        console.error(error);
        this.setState({isLoading: false});
      }
    } else {
      const {date} = this.props.route.params;
      this.setState({eventDate: date});
      this.setState({isLoading: false});
    }
  };

  onBackPress = async () => {
    const {isCreating} = this.props.route.params;
    const {eventDate, eventName, eventDescription, eventPhotos} = this.state;
    if (isCreating) {
      try {
        const db = await getDBConnection();
        const newEvent = {
          date: eventDate,
          name: eventName,
          value: eventDescription,
          photos: eventPhotos.join(','),
        };
        await insertTodoItem(db, newEvent);
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        const db = await getDBConnection();
        const updatedEvent = {
          id: this.state.event.id,
          name: eventName,
          value: eventDescription,
          photos: eventPhotos.join(','),
        };
        await updateTodoItem(db, updatedEvent);
      } catch (error) {
        console.error(error);
      }
    }
    const {date} = this.props.route.params;
    this.props.navigation.navigate('selectedDay', {
      date: date,
      isFirst: false,
    });
  };
  componentWillUnmount() {
    this.removePhotoPressListener();
  }

  closePhotoModal = () => {
    this.setState({isModalVisible: false});
  };

  takePhoto = async () => {
    console.log('PHOTO');
  };

  chooseFromGallery = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };
    this.removePhotoPressListener();

    await ImagePicker.launchImageLibrary(options, response => {
      if (!response.didCancel && !response.error) {
        const newPhoto = response.assets[0].uri;
        if (newPhoto.trim() !== '') {
          this.setState(prevState => ({
            event: {
              ...prevState.event,
              photos: [...prevState.eventPhotos, newPhoto].join(','),
            },
            eventPhotos: [...prevState.eventPhotos, newPhoto],
          }));
        } else {
          console.log('Пустой путь к фотографии. Фотография не добавлена.');
        }
      }
    });
  };

  onAddPhotoPress = async () => {
    this.setState({isModalVisible: true});
  };

  removePhotoPressListener = () => {
    if (this.photoPressListener) {
      this.photoPressListener();
      this.photoPressListener = null;
    }
  };
  handleEventNameChange = text => {
    this.setState({eventName: text});
  };

  handleEventDescriptionChange = text => {
    this.setState({eventDescription: text});
  };

  render = () => {
    const {isLoading} = this.state;
    let count = 0;
    return isLoading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000AFF" />
      </View>
    ) : (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.modalBackground} />
          <View style={styles.header}>
            <TouchableOpacity onPress={this.onBackPress.bind(this)}>
              <Image
                source={require('../../assets/images/back.png')}
                style={styles.backButtonImage}
              />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.dayTitle}>{this.getTitle()}</Text>
            </View>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.isModalVisible}
            onRequestClose={this.closePhotoModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity onPress={this.onBackPress.bind(this)}>
                  <Image
                    source={require('../../assets/images/back.png')}
                    style={styles.closeButton}
                  />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Выберите режим</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    this.closePhotoModal();
                    this.takePhoto();
                  }}>
                  <Text style={styles.modalButtonText}>Сделать фото</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    this.closePhotoModal();
                    this.chooseFromGallery();
                  }}>
                  <Text style={styles.modalButtonText}>Выбрать из галереи</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Text style={styles.nameValue}>Название</Text>
          <TextInput
            style={styles.inputEvent}
            value={this.state.eventName}
            onChangeText={this.handleEventNameChange}
          />
          <Text style={styles.nameValue}>Описание</Text>
          <TextInput
            style={styles.inputEvent}
            value={this.state.eventDescription}
            multiline={true}
            textAlignVertical="top"
            onChangeText={this.handleEventDescriptionChange}
          />
          <View style={styles.centralBodyContainer}>
            <Image
              source={require('../../assets/images/separation.png')}
              style={styles.separationStyle}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={this.onAddPhotoPress}>
              <Text style={styles.addButtonText}>Добавить фото</Text>
            </TouchableOpacity>
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
      </View>
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
  addButton: {
    marginTop: 20,
    width: 310,
    height: 50,
    borderRadius: 30,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  separationStyle: {
    width: 336,
    height: 9,
  },
  closeButton: {
    width: 24,
    height: 24,
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width: 366,
    height: 296,
    borderRadius: 10,
    padding: 20,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: 'white',
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#0029FF',
    marginBottom: 40,
  },
  modalButton: {
    marginBottom: 40,
    width: 312,
    height: 47,
    borderRadius: 30,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: 'white',
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
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#0029FF',
    paddingLeft: 10,
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
    color: '#0029FF',
    paddingRight: 25,
    paddingTop: 25,
  },
  centralBodyContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  inputEvent: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    borderRadius: 5,
    width: '100%',
    padding: 10,
    marginTop: 5,
    textAlignVertical: 'top',
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
export default EditEventScreen;
