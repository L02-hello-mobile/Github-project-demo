import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  useFonts,
  LexendDeca_400Regular,
  LexendDeca_700Bold,
} from "@expo-google-fonts/lexend-deca";
import React, { useRef, useEffect } from "react";
import { View, ActivityIndicator, Animated } from "react-native";

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
    card: "transparent",
    border: "transparent",
  },
};
import { useIsFocused } from "@react-navigation/native";
import OnboardingScreen from "./screens/OnboardingScreen";
import HomeScreen from "./screens/HomeScreen";
import WalkthroughScreen from "./screens/WalkthroughScreen";
import TodayTask from "./screens/TodayTask";
import CreateEvent from "./screens/CreateEvent";
import EventsTasks_Org from "./screens/EventsTasks_Org";
import NotificationScreen from "./screens/NotificationScreen";
import BottomTab from "./components/BottomTab";
import TaskDetailScreen from "./screens/TaskDetail_Org";
import MapEditorScreen from "./screens/AddLocation";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function withSlide<T extends object>(Component: React.ComponentType<T>) {
  return function SlideScreen(props: T) {
    const isFocused = useIsFocused();
    const opacity = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isFocused) {
        // Màn hình mới: slide từ phải vào + fade in
        translateX.setValue(60);
        opacity.setValue(0);
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Màn hình cũ: fade out
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }).start();
      }
    }, [isFocused]);

    return (
      <Animated.View style={{ flex: 1, opacity, transform: [{ translateX }] }}>
        <Component {...props} />
      </Animated.View>
    );
  };
}

const FadeHome = withSlide(HomeScreen);
const FadeCalendar = withSlide(TodayTask);

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTab {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
      sceneContainerStyle={{ backgroundColor: "transparent" }}
    >
      <Tab.Screen name="Home" component={FadeHome} />
      <Tab.Screen name="Calendar" component={FadeCalendar} />
      <Tab.Screen name="Documents" component={FadeHome} />
      <Tab.Screen name="Profile" component={FadeHome} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    LexendDeca_400Regular,
    LexendDeca_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#5F33E1" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator
        initialRouteName="Start"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 280,
        }}
      >
        {/* Để test hoặc chạy luồng luân phiên, bạn có thể hướng initialRoute vào Main */}
        <Stack.Screen name="Start" component={EventsTasks_Org} />
        <Stack.Screen name="Walkthrough" component={WalkthroughScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="CreateEvent" component={CreateEvent} />
        {/* 2. ĐƯA TASK DETAIL RA ĐÂY: Để mọi màn hình (kể cả Start hay MainTabs) đều gọi được */}
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="MapEditor" component={MapEditorScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}