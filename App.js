/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {TextInput, Modal,Platform, StyleSheet, Text, View, Button, ScrollView, PermissionsAndroid, Image, TouchableHighlight, Dimensions, Alert} from 'react-native';
import CameraRoll from 'rn-camera-roll';
import RNFetchBlob from 'rn-fetch-blob';


const { width } = Dimensions.get('window')

async function requestCameraPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        'title': 'Cool Photo App Camera Permission',
        'message': 'Cool Photo App needs access to your camera ' +
                   'so you can take awesome pictures.'
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the camera")
    } else {
      console.log("Camera permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}

export default class App extends Component<Props> {
  state = {
    photos: [],
    index: null,
    data: null,
    modalVisible: false,
    username: '',
    password: ''
  }

  getState = () => {
    console.log(this.state.photos);
  }

  setIndex = (index) => {
    if (index === this.state.index) {
      index = null
    }
    this.setState({ index })
  }

  setModalVisible(visible) {
    this.setState({modalVisible:visible});
  }

  share = () => {
    let user = this.state.username;
    let password = this.state.password;
    console.log(user);
    console.log(password);

    console.log(this.state.photos[this.state.index].node.image)
    RNFetchBlob.fetch('POST', 'https://'+user+':'+password+'@simonriple.no/admin/api/upload.php', {
    Authorization : "Bearer access-token",
    otherHeader : "foo",
    'Content-Type' : 'multipart/form-data',
  }, [

    { name : 'image', filename: 'image.jpg', data: RNFetchBlob.wrap(this.state.photos[this.state.index].node.image.uri)},

    ]).then((resp) => {
      let error = ""
      if (resp.data == "File uploaded, no problem!" || resp.data == "File uploaded, but there was a problem with the db"){
        error = resp.data
      }else{
        error = "There was a problem with the upload"
      }
      Alert.alert(
        JSON.stringify(error)
      //  'Upload complete'
      )
    }).catch((err) => {
      
      //Alert.alert(
        //console.log(err)
        //'Upload failed'
      //)
    })
  }

  componentWillMount() {
    requestCameraPermission();
  }

  _handleButtonPress = () => {
   CameraRoll.getPhotos({
       first: 20,
       assetType: 'Photos',
     })
     .then(r => {
       this.setState({ photos: r.edges});
     })
     .catch((err) => {

     });
   };

  render() {
    return (
     <View style={styles.container}>
       <Button
        title="Load Images"
        onPress={this._handleButtonPress}
        />
       <ScrollView>
         {this.state.photos.map((p, i) => {
         return (
           <TouchableHighlight
                      style={{opacity: i === this.state.index ? 0.5 : 1}}
                      key={i}
                      underlayColor='transparent'
                      onPress={() => this.setIndex(i)}
            >
              <Image
                key={i}
                style={{width: width, height:600}}
                resizeMode="contain"
                source={{uri: p.node.image.uri}}
              />
            </TouchableHighlight>
         );
       })}
       </ScrollView>
       {
         this.state.index !== null  && (
            <View style={styles.shareButton}>
                <Button
                    title='Upload'
                    onPress={() => {this.setModalVisible(!this.state.modalVisible)}}
                />
            </View>
          )
        }
        <Modal
          style = {{height: "200", width: "200"}}
          animationType="fade"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          <View style={styles.container}>
            <View>
              <Text> Please enter your username and password for the server </Text>
              <TextInput
              style = {styles.textinput}
              placeholder="Username"
              onChangeText={(text) => this.setState({username: text})}
              />
              <TextInput
              style = {styles.textinput}
              placeholder="Password"
              onChangeText={(text) => this.setState({password: text})}
              />

              <Button
                title='Upload'
                onPress={() => {
                  console.log("Upload it")
                  this.setModalVisible(!this.state.modalVisible)
                  console.log("come on")
                  this.share()
                }}>
              </Button>
            </View>
          </View>
        </Modal>
     </View>
   );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#464646',
  },
  button: {
    padding: 20,
  },
  textinput: {
    height:40,  borderRadius: 4, borderWidth: 0.5, borderColor: '#d6d7da'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
