import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  useFonts,
  LexendDeca_400Regular,
  LexendDeca_700Bold,
} from "@expo-google-fonts/lexend-deca";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Sentry from "@sentry/react-native";

import {
  registerPushToken,
  setupNotificationResponseListener,
} from "./utils/pushNotifications";

import { socketService } from "./services/socketService";
import { SocketNotificationProvider } from "./context/SocketNotificationContext";

import HomeScreen from "./screens/common/HomeScreen";
import TodayTask from "./screens/staff/TodayTask";
import MapList_Staff from "./screens/staff/MapList";
import SettingScreen from "./screens/common/SettingScreen";

import LoginScreen from "./screens/common/LoginScreen";
import SignUpScreen from "./screens/common/SignUpScreen";
import StartScreen from "./screens/common/StartScreen";
import WalkthroughScreen from "./screens/common/WalkthroughScreen";
import ForgotPasswordScreen from "./screens/common/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/common/ResetPasswordScreen";

import EventDetailScreen from "./screens/organizer/EventDetailScreen";
import NotificationScreen from "./screens/common/NotificationScreen";
import AccountScreen from "./screens/common/AccountScreen";

import EventsTasks_Org from "./screens/organizer/EventsTasks";
import TaskDetailScreen from "./screens/organizer/TaskDetail";
import TaskDetailStaff from "./screens/staff/TaskDetail";
import MapViewStaff from "./screens/staff/MapView";
import MapEditorScreen from "./screens/organizer/AddLocation";
import MemberList from "./screens/organizer/MemberList";
import CreateEvent from "./screens/organizer/CreateEvent";
import AddTask from "./screens/organizer/AddTask";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ================= SENTRY INIT ================= */
Sentry.init({
  dsn: "https://981f37c1999cf0c7b8e276f5b1962e26@o4511441842601984.ingest.us.sentry.io/4511441848238080",
  tracesSampleRate: 1.0,
  debug: false,
});

console.log("✅ SENTRY INITIALIZED");

/* ================= NOTIFICATION CONFIG ================= */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
    card: "transparent",
    border: "transparent",
  },
};

/* ================= TAB ================= */
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={TodayTask} />
      <Tab.Screen name="Documents" component={MapList_Staff} />
      <Tab.Screen name="Map" component={SettingScreen} />
    </Tab.Navigator>
  );
}

/* ================= APP ================= */
function App() {
  const navigationRef = useRef<any>(null);
  const [initialRoute, setInitialRoute] = useState("Start");

  const [fontsLoaded] = useFonts({
    LexendDeca_400Regular,
    LexendDeca_700Bold,
  });

  /* ================= GLOBAL ERROR ================= */
  useEffect(() => {
    const handler = (error: any, isFatal?: boolean) => {
      console.log("🔥 GLOBAL ERROR:", error);

      Sentry.captureException(error, {
        extra: {
          isFatal,
        },
      });
    };

    const previousHandler = ErrorUtils.getGlobalHandler?.();

    ErrorUtils.setGlobalHandler(handler);

    return () => {
      if (previousHandler) {
        ErrorUtils.setGlobalHandler(previousHandler);
      }
    };
  }, []);

  /* ================= LOGIN CHECK ================= */
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        console.log("🔐 TOKEN:", token);

        if (!token) {
          setInitialRoute("Start");
          return;
        }

        setInitialRoute("Main");

        registerPushToken();

        socketService.connect().catch((e) => {
          console.log("Socket error:", e);
          Sentry.captureException(e);
        });

        Sentry.captureMessage("✅ User session restored");
      } catch (e) {
        console.log("LOGIN CHECK ERROR:", e);

        Sentry.captureException(e);

        setInitialRoute("Start");
      }
    };

    checkLogin();
  }, []);

  /* ================= NOTIFICATION ================= */
  useEffect(() => {
    const cleanup = setupNotificationResponseListener(
      (screen, params) => {
        navigationRef.current?.navigate(screen, params);
      }
    );

    return cleanup;
  }, []);

  /* ================= LOADING ================= */
  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#5F33E1" />
      </View>
    );
  }

  /* ================= UI ================= */
  return (
    <SocketNotificationProvider>
      <NavigationContainer ref={navigationRef} theme={AppTheme}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Start" component={StartScreen} />
          <Stack.Screen name="Walkthrough" component={WalkthroughScreen} />

          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
          />

          <Stack.Screen name="Main" component={MainTabs} />

          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
          />
          <Stack.Screen
            name="Notification"
            component={NotificationScreen}
          />
          <Stack.Screen name="Account" component={AccountScreen} />

          <Stack.Screen
            name="EventsTasks_Org"
            component={EventsTasks_Org}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
          />
          <Stack.Screen
            name="TaskDetailStaff"
            component={TaskDetailStaff}
          />
          <Stack.Screen
            name="MapViewStaff"
            component={MapViewStaff}
          />
          <Stack.Screen
            name="MapEditor"
            component={MapEditorScreen}
          />
          <Stack.Screen
            name="MemberList"
            component={MemberList}
          />
          <Stack.Screen
            name="TodayTask"
            component={TodayTask}
          />
          <Stack.Screen
            name="CreateEvent"
            component={CreateEvent}
          />
          <Stack.Screen
            name="AddTask"
            component={AddTask}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketNotificationProvider>
  );
}

export default Sentry.wrap(App);