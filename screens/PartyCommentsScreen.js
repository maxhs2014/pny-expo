import React, {useState, useEffect} from 'react';
import { View, StyleSheet, Button, Text, ScrollView } from 'react-native';
import { signOut } from 'firebase/auth';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';

import { auth } from '../config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IOSButton from '../components/IOSButton';
import { useTheme } from '@react-navigation/native';
import { useAtParty, useparty } from '../hooks';
import { addComment, attendParty, getAdID, getUsers, leaveParty, reportInfo, requestFriend } from '../config/firebase';
import * as Linking from 'expo-linking';
import { useUserData } from '../hooks/useUserData';
import Friend from '../components/Friend';
import { Icon, TextInput } from '../components';
import PersonRequest from '../components/Person';
import { AdMobBanner } from 'expo-ads-admob';

export const PartyCommentsScreen = ({navigation, route}) => {
  const {colors} = useTheme()
  const insets = useSafeAreaInsets()
  const [party, setParty] = useState(route.params.party)
  const [loaded, userData, filled] = useUserData()
  const [partyFriends, setPartyFriends] = useState([])
  const [commentInput, setCommentInput] = useState("")
  const isAtParty = useAtParty()

  useEffect(() => {
    if (isAtParty && isAtParty.id == party.id) setParty(isAtParty)
  }, [isAtParty])
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={() => navigation.goBack()} title="Cancel" />
      ),
    });
  }, [navigation]);

  const postComment = () => {
    if (commentInput && commentInput.length > 0) {
      addComment(commentInput, party).then(() => setCommentInput(""))
    }
  }
  const formateTime = (time) => {
    const d = new Date(time)
    return `${d.getHours()%12}:${d.getMinutes()<10?"0"+d.getMinutes():d.getMinutes()}`
  }
  return (
    
    <View style={styles.container}>
      <ScrollView>
        {isAtParty && isAtParty.id == party.id &&
        <View style={{marginHorizontal: 16, flexDirection: "row", flex: 1}}>
          <View style={{flex: 1}}>
          <TextInput placeholder="New Comment" value={commentInput} onChangeText={(text) => setCommentInput(text)} />
          </View>
          <IOSButton title="Post" style="ghost" ap="primary" onPress={postComment} />
        </View>}
        <View style={{marginHorizontal: 16, marginTop: 8, flex: 1}}>
          {party.comments && party.comments.length > 0 ? party.comments.sort((a, b) => new Date(b.time) - new Date(a.time)).map((comment) => <View style={{borderBottomWidth: 1, borderBottomColor: "#6e6869", paddingBottom: 8, marginBottom: 16}}><Text style={{color: colors.text, fontSize: 17}}>{formateTime(comment.time)} - {comment.msg}</Text></View>):<Text style={{color: colors.text, fontSize: 17}}>No Comments</Text>}
        </View>
      </ScrollView> 
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  btmContainer: {
    position: "absolute",
  },
  infoView: {
      flexDirection: "row",
      marginLeft: 64,
      marginRight: 64,
      marginTop: 32,
      justifyContent: "space-around"
  }
});
