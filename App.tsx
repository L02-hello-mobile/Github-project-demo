import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  useFonts,
  LexendDeca_400Regular,
  LexendDeca_700Bold,
} from "@expo-google-fonts/lexend-deca";
import { View, ActivityIndicator } from "react-native";
import OnboardingScreen from "./screens/OnboardingScreen";
import HomeScreen from "./screens/HomeScreen";
import WalkthroughScreen from "./screens/WalkthroughScreen";
import TodayTask from "./screens/TodayTask";
import EventsTasks_Org from "./screens/EventsTasks_Org";

import BottomTab from "./components/BottomTab";
import TaskDetailScreen from "./screens/TaskDetail_Org";
import MapEditorScreen from "./screens/AddLocation";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 1. Tab Navigator: Chỉ giữ lại các màn hình chính làm Tab thôi
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTab {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="EveTasOrg" component={EventsTasks_Org} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={TodayTask} />
      <Tab.Screen name="Documents" component={HomeScreen} />
      <Tab.Screen name="Profile" component={HomeScreen} />
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
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Start"
        screenOptions={{ headerShown: false }}
      >
        {/* Để test hoặc chạy luồng luân phiên, bạn có thể hướng initialRoute vào Main */}
        <Stack.Screen name="Start" component={EventsTasks_Org} />
        <Stack.Screen name="Walkthrough" component={WalkthroughScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        
        {/* 2. ĐƯA TASK DETAIL RA ĐÂY: Để mọi màn hình (kể cả Start hay MainTabs) đều gọi được */}
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="MapEditor" component={MapEditorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}