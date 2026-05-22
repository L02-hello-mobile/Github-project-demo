import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  useFonts,
  LexendDeca_400Regular,
  LexendDeca_700Bold,
} from "@expo-google-fonts/lexend-deca";
import { View, ActivityIndicator, Animated } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- THEME TRONG SUỐT TỪ NHÁNH MAIN ---
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
    card: "transparent",
    border: "transparent",
  },
};

// --- CÁC MÀN HÌNH TỪ NHÁNH MAIN VÀ HEAD ---
import HomeScreen from "./screens/common/HomeScreen";
import TodayTask from "./screens/staff/TodayTask";
import EventsTasks_Org from "./screens/organizer/EventsTasks";
import BottomTab from "./components/BottomTab";
import TaskDetailScreen from "./screens/organizer/TaskDetail";
import TaskDetailStaff from "./screens/staff/TaskDetail";
import MapViewStaff from "./screens/staff/MapView";
import MapEditorScreen from "./screens/organizer/AddLocation";
import MemberList from "./screens/organizer/MemberList";
import MapList_Staff from "./screens/staff/MapList";
import SettingScreen from "./screens/common/SettingScreen";

// --- CÁC MÀN HÌNH AUTH ---

import ForgotPasswordScreen from "./screens/common/ForgotPasswordScreen";

// --- CÁC MÀN HÌNH CHI TIẾT ---
import EventDetailScreen from "./screens/organizer/EventDetailScreen";
import AccountScreen from "./screens/common/AccountScreen";
import WalkthroughScreen from "./screens/common/WalkthroughScreen";
import LoginScreen from "./screens/common/LoginScreen";
import NotificationScreen from "./screens/common/NotificationScreen";
import ResetPasswordScreen from "./screens/common/ResetPasswordScreen";
import SignUpScreen from "./screens/common/SignUpScreen";
import StartScreen from "./screens/common/StartScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- HOC: HIỆU ỨNG ANIMATION TỪ NHÁNH MAIN ---
function withSlide<T extends object>(Component: React.ComponentType<T>) {
  return function SlideScreen(props: T) {
    const isFocused = useIsFocused();
    const opacity = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isFocused) {
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
const FadeMapList = withSlide(MapList_Staff);
const FadeSetting = withSlide(SettingScreen);
// Nếu muốn các màn hình Org vào Tab, có thể tạo thêm FadeEventsTasksOrg = withSlide(EventsTasks_Org)

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
      <Tab.Screen name="Documents" component={FadeMapList} />
      <Tab.Screen name="Map" component={FadeSetting} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    LexendDeca_400Regular,
    LexendDeca_700Bold,
  });

  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          setInitialRoute("Main");
        } else {
          setInitialRoute("Start");
        }
      } catch (error) {
        setInitialRoute("Start");
      }
    };
    checkLoginStatus();
  }, []);

  if (!fontsLoaded || initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#5F33E1" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 280,
        }}
      >
        {/* Flow khởi tạo */}
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Walkthrough" component={WalkthroughScreen} />

        {/* Flow Xác thực (Auth) */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

        {/* Màn hình chính sau khi đăng nhập thành công */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Các màn hình chi tiết & Organizer (Gộp từ 2 nhánh) */}
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />

        {/* Màn hình từ nhánh main */}
        <Stack.Screen name="EventsTasks_Org" component={EventsTasks_Org} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="TaskDetailStaff" component={TaskDetailStaff} />
        <Stack.Screen name="MapViewStaff" component={MapViewStaff} />
        <Stack.Screen name="MapEditor" component={MapEditorScreen} />
        <Stack.Screen name="MemberList" component={MemberList} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
