import React, {Component} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export class EventListItem extends Component {
  render = () => {
    const {onPress, name} = this.props;
    return (
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <Image
          source={require('../../assets/images/eventicon.png')}
          resizeMode={'contain'}
          style={styles.eventIconStyle}
        />
        <View>
          <Text style={styles.eventNameStyle}>{name}</Text>
        </View>
      </TouchableOpacity>
    );
  };
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 1,
    paddingVertical: 10,
  },
  eventIconStyle: {
    width: 16,
    height: 16,
    marginRight: 20,
    marginTop: 8,
  },
  eventNameStyle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#0029FF',
  },
});
