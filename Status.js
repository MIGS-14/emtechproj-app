import { Constants } from 'expo';
import { Platform, StatusBar, StyleSheet, Text, View, Animated } from 'react-native';
import React from 'react';
import NetInfo from '@react-native-community/netinfo';

export default class Status extends React.Component {
    state = {
        isConnected: false,
        statusBarColor: new Animated.Value(0),
        messageOpacity: new Animated.Value(0),
    };

    componentDidMount() {
        this.getConnectionInfo();
        this.unsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    getConnectionInfo = async () => {
        try {
            const state = await NetInfo.fetch();
            const isConnected = state.isConnected;
            this.setState({ isConnected });
            this.animateMessageOpacity(isConnected ? 1 : 0);
        } catch (error) {
            console.error('Error getting connection info:', error);
        }
    };

    handleConnectivityChange = state => {
        const isConnected = state.isConnected;
        this.setState({ isConnected });
        this.animateMessageOpacity(isConnected ? 1 : 0);
    };

    animateStatusBarColor = (toColor) => {
        Animated.timing(this.state.statusBarColor, {
            toValue: toColor === 'green' ? 1 : 0,
            duration: 500,
            useNativeDriver: false,
        }).start();
    };

    animateMessageOpacity = (toOpacity) => {
        Animated.timing(this.state.messageOpacity, {
            toValue: toOpacity,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    render() {
        const { isConnected } = this.state;
        const backgroundColor = isConnected ? 'green' : 'red';

        this.animateStatusBarColor(backgroundColor);

        const statusBar = (
            <Animated.View
                style={{ backgroundColor: this.state.statusBarColor.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['red', 'green'],
                }) }}
            >
                <StatusBar
                    barStyle={isConnected ? 'dark-content' : 'light-content'}
                    animated={true}
                />
            </Animated.View>
        );

        const messageContainer = (
            <Animated.View
                style={[styles.messageContainer, { opacity: this.state.messageOpacity }]}
                pointerEvents={"none"}
            >
                {statusBar}
                <Animated.View
                    style={[
                        styles.bubble,
                        {
                            opacity: this.state.messageOpacity.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1],
                            }),
                        },
                    ]}
                >
                    <Text style={styles.text}>{isConnected ? 'Network connected' : 'No network connection'}</Text>
                </Animated.View>
            </Animated.View>
        );

        if (Platform.OS === 'ios') {
            return (
                <View style={[styles.status, { backgroundColor }]}>
                    {messageContainer}
                </View>
            );
        }
        return messageContainer;
    }
}

const statusHeight = (Platform.OS === 'ios' ? Constants.statusBarHeight : 0);

const styles = StyleSheet.create({
    status: {
        zIndex: 1,
        height: statusHeight,
    },
    messageContainer: {
        zIndex: 1,
        position: 'absolute',
        top: statusHeight + 70,
        right: 0,
        left: 0,
        height: 100,
        alignItems: 'center',
    },
    bubble: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'red',
    },
    text: {
        color: 'white',
    },
});