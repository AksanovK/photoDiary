import React, {Component} from 'react';
import {Calendar} from 'react-native-calendars';
import {LocaleConfig} from 'react-native-calendars/src/index';

export class CalendarScreen extends Component {
  state = {
    selectedDate: null,
    markedDates: {},
  };
  componentDidMount() {
    LocaleConfig.locales.en = LocaleConfig.locales[''];
    LocaleConfig.locales.ru = {
      monthNames: [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
      ],
      monthNamesShort: [
        'Янв.',
        'Фев.',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль.',
        'Авг.',
        'Сент.',
        'Окт.',
        'Нояб.',
        'Дек.',
      ],
      dayNames: [
        'Воскресенье',
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Суббота',
      ],
      dayNamesShort: ['Вс.', 'Пн.', 'Вт.', 'Ср.', 'Чт.', 'Пт.', 'Сб.'],
      today: 'Сегодняшний день',
    };
    LocaleConfig.defaultLocale = 'ru';
  }
  handleDayPress = day => {
    const {selectedDate} = this.state;
    if (selectedDate !== day.dateString) {
      const updatedMarkedDates = {};
      if (selectedDate) {
        updatedMarkedDates[selectedDate] = {};
      }
      updatedMarkedDates[day.dateString] = {selected: true};
      this.setState(
        {selectedDate: day.dateString, markedDates: updatedMarkedDates},
        () => {
          this.navigateToSelectedDayScreen();
        },
      );
    }
  };

  navigateToSelectedDayScreen = () => {
    const {selectedDate} = this.state;
    this.props.navigation.navigate('selectedDay', {
      date: selectedDate,
      isFirst: false,
    });
  };

  render() {
    const {markedDates} = this.state;
    return (
      <Calendar
        locale={'ru'}
        theme={{
          textSectionTitleColor: '#000AFF',
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#000AFF',
          todayTextColor: '#000AFF',
          dayTextColor: '#000000',
          textDisabledColor: '#d9e1e8',
          dotColor: '#000AFF',
          selectedDotColor: '#000AFF',
          arrowColor: '#000AFF',
          monthTextColor: 'blue',
          textDayFontFamily: 'Montserrat-Regular',
          textMonthFontFamily: 'Montserrat-Bold',
          textDayHeaderFontFamily: 'Montserrat-Bold',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
        }}
        onDayPress={this.handleDayPress}
        markedDates={markedDates}
      />
    );
  }
}
