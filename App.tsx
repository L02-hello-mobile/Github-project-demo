import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  useFonts,
  LexendDeca_400Regular,
  LexendDeca_700Bold,
} from "@expo-google-fonts/lexend-deca";
import {
  View,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  registerPushToken,
  setupNotificationResponseListener,
} from "./utils/pushNotifications";
import { socketService } from "./services/socketService";
import { SocketNotificationProvider } from "./context/SocketNotificationContext";
import * as Notifications from "expo-notifications";

// Notification config
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
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

// Screens
import HomeScreen from "./screens/common/HomeScreen";
import TodayTask from "./screens/staff/TodayTask";
import EventsTasks_Org from "./screens/organizer/EventsTasks";
import BottomTab from "./components/BottomTab";
import TaskDetailScreen from "./screens/organizer/TaskDetail";
import MapEditorScreen from "./screens/organizer/AddLocation";
import CreateEvent from "./screens/organizer/CreateEvent";
import TaskDetailStaff from "./screens/staff/TaskDetail";
import MapViewStaff from "./screens/staff/MapView";
import MemberList from "./screens/organizer/MemberList";
import AddTask from "./screens/organizer/AddTask";
import MapList_Staff from "./screens/staff/MapList";
import SettingScreen from "./screens/common/SettingScreen";
import ForgotPasswordScreen from "./screens/common/ForgotPasswordScreen";
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

/* ================= ANIMATION ================= */
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

/* ================= TAB ================= */
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
    >
      <Tab.Screen name="Home" component={FadeHome} />
      <Tab.Screen name="Calendar" component={FadeCalendar} />
      <Tab.Screen name="Documents" component={FadeMapList} />
      <Tab.Screen name="Map" component={FadeSetting} />
    </Tab.Navigator>
  );
}

/* ================= APP ================= */
export default function App() {
  const navigationRef = useRef<any>(null);

  const [fontsLoaded] = useFonts({
    LexendDeca_400Regular,
    LexendDeca_700Bold,
  });

  const [initialRoute, setInitialRoute] = useState<string>("Start");

  /* ================= LOGIN CHECK ================= */
  useEffect(() => {
    let mounted = true;

    const timeout = setTimeout(() => {
      if (initialRoute === "Start") {
        console.log("⏱ fallback route Start");
        setInitialRoute("Start");
      }
    }, 5000);

    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        if (!mounted) return;

        if (!token) {
          setInitialRoute("Start");
          return;
        }

        // safe JWT decode
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const base64 = parts[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/");

            const json = JSON.parse(atob(base64));
            const exp = json.exp;

            if (exp && Date.now() / 1000 > exp) {
              await AsyncStorage.multiRemove([
                "userToken",
                "userData",
              ]);
              setInitialRoute("Start");
              return;
            }
          }
        } catch (e) {
          console.log("JWT decode error:", e);
        }

        setInitialRoute("Main");

        registerPushToken();

        socketService.connect().catch(() => {
          console.log("Socket ignored error");
        });
      } catch (e) {
        console.log("Login check error:", e);
        setInitialRoute("Start");
      }
    };

    checkLogin();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          {/* Init */}
          <Stack.Screen name="Start" component={StartScreen} />
          <Stack.Screen name="Walkthrough" component={WalkthroughScreen} />

          {/* Auth */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

          {/* Main */}
          <Stack.Screen name="Main" component={MainTabs} />

          {/* Detail */}
          <Stack.Screen name="EventDetail" component={EventDetailScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="Account" component={AccountScreen} />

          {/* Extra */}
          <Stack.Screen name="EventsTasks_Org" component={EventsTasks_Org} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="TaskDetailStaff" component={TaskDetailStaff} />
          <Stack.Screen name="MapViewStaff" component={MapViewStaff} />
          <Stack.Screen name="MapEditor" component={MapEditorScreen} />
          <Stack.Screen name="MemberList" component={MemberList} />
          <Stack.Screen name="TodayTask" component={TodayTask} />
          <Stack.Screen name="CreateEvent" component={CreateEvent} />
          <Stack.Screen name="AddTask" component={AddTask} />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketNotificationProvider>
  );
}