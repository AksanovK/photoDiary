import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import {getDBConnection, findDiaryItemNamesByDate} from '../util/db';
import {EventListItem} from '../components/EventListItem';
import {PERMISSIONS, request} from 'react-native-permissions';

export class SelectedDayScreen extends Component {
  state = {
    list: [],
    isLoading: true,
  };
  getDayOfWeek = () => {
    const {isFirst} = this.props.route.params;
    const {date} = this.props.route.params;
    const daysOfWeek = [
      'Понедельник',
      'Вторник',
      'Среда',
      'Четверг',
      'Пятница',
      'Суббота',
      'Воскресенье',
    ];
    const currentDate = isFirst ? new Date() : new Date(date);
    const dayOfWeekIndex = currentDate.getDay();
    return daysOfWeek[dayOfWeekIndex];
  };

  getDayOfMonth = () => {
    const {isFirst} = this.props.route.params;
    const {date} = this.props.route.params;
    const currentDate = isFirst ? new Date() : new Date(date);
    return currentDate.getDate();
  };

  getMonth = () => {
    const {isFirst} = this.props.route.params;
    const {date} = this.props.route.params;
    const currentDate = isFirst ? new Date() : new Date(date);
    const monthNames = [
      'Января',
      'Февраля',
      'Марта',
      'Апреля',
      'Мая',
      'Июня',
      'Июля',
      'Августа',
      'Сентября',
      'Октября',
      'Ноября',
      'Декабря',
    ];
    return monthNames[currentDate.getMonth()];
  };

  getMoreData = async () => {
    try {
      const {date} = this.props.route.params;
      const db = await getDBConnection();
      let diaryItems;
      if (date) {
        const formattedDate =
          typeof date === 'string' ? date : date.toISOString().split('T')[0];
        diaryItems = await findDiaryItemNamesByDate(db, formattedDate);
      } else {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        diaryItems = await findDiaryItemNamesByDate(db, formattedDate);
      }
      this.setState({list: diaryItems, isLoading: false});
    } catch (error) {
      console.error(error);
      this.setState({isLoading: false});
    }
  };

  componentDidMount = () => {
    this.requestPermissions().then(r => console.log('123'));
    this.onRefresh();
  };

  requestPermissions = async () => {
    try {
      const cameraPermission = await request(PERMISSIONS.ANDROID.CAMERA);
      const storagePermission = await request(
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      );
      if (cameraPermission === 'granted') {
        console.log('Разрешение на камеру получено');
      } else {
        console.log('Отказано в разрешении на камеру');
      }

      if (storagePermission === 'granted') {
        console.log('Разрешение на доступ к хранилищу получено');
      } else {
        console.log(
          'Отказано в разрешении на доступ к хранилищу ' + storagePermission,
        );
      }
    } catch (error) {
      console.error('Ошибка запроса разрешений:', error);
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const prevDate = prevProps.route.params.date;
    const currentDate = this.props.route.params.date;
    if (prevDate !== currentDate) {
      this.onRefresh();
    }
  }

  onRefresh = () => {
    this.getMoreData();
  };

  onScrollToEnd = ({distanceFromEnd}) => {
    return 0;
  };

  onItemPress = item => {
    const {date} = this.props.route.params;
    this.props.navigation.navigate('selectedEvent', {
      itemId: item.id,
      date: date,
    });
  };

  onBackPress = item => {
    this.props.navigation.navigate('calendar');
  };

  onAddPress = item => {
    const {date} = this.props.route.params;
    this.props.navigation.navigate('editEvent', {
      isCreating: true,
      date: date,
    });
  };

  keyExtractor = person => {
    return person.id;
  };

  renderItem = ({item}) => {
    return (
      <EventListItem
        id={item.id}
        name={item.name}
        onPress={this.onItemPress.bind(this, item)}
      />
    );
  };

  render = () => {
    const {isLoading, list} = this.state;
    return isLoading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000AFF" />
      </View>
    ) : (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={this.onBackPress.bind(this)}>
            <Image
              source={require('../../assets/images/back.png')}
              style={styles.backButtonImage}
            />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.dayTitle}>{this.getDayOfWeek()}</Text>
          </View>
        </View>
        <Text style={styles.dateNumber}>{this.getDayOfMonth()}</Text>
        <Text style={styles.monthName}>{this.getMonth()}</Text>
        <Image
          source={require('../../assets/images/separation.png')}
          style={styles.separationStyle}
        />
        <Text style={styles.eventTitle}>События</Text>

        <View style={styles.eventList}>
          <FlatList
            data={list}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
            refreshing={isLoading}
            onRefresh={this.onRefresh}
            onEndReached={this.onScrollToEnd}
            onEndReachedThreshold={0.2}
            style={styles.eventList}
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={this.onAddPress.bind(this)}>
          <Text style={styles.addButtonText}>Добавить событие</Text>
        </TouchableOpacity>
      </View>
    );
  };
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
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
  dateNumber: {
    fontSize: 120,
    fontFamily: 'Montserrat-ExtraBold',
    color: '#000AFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 4,
    textAlign: 'center',
  },
  monthName: {
    fontSize: 40,
    fontFamily: 'Montserrat-ExtraBold',
    color: '#000AFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: {width: 0, height: 4},
    textShadowRadius: 4,
    textAlign: 'center',
    paddingBottom: 30,
  },
  eventTitle: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
    color: '#000AFF',
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 5,
  },
  eventList: {
    flex: 1,
    width: '100%',
    marginBottom: 30,
  },
  eventItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    width: 310,
    height: 50,
    borderRadius: 30,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: 'white',
  },
});
export default SelectedDayScreen;
