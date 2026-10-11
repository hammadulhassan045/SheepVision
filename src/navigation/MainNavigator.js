import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MaterialIcons} from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import SheepListScreen from '../screens/SheepListScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import RecordsScreen from '../screens/RecordsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddFarmScreen from '../screens/AddFarmScreen';
import FarmDashboardScreen from '../screens/FarmDashboardScreen';
import AddFlockScreen from '../screens/AddFlockScreen';
import FarmUsersScreen from '../screens/FarmUsersScreen';
import AddSheepScreen from '../screens/AddSheepScreen';
import SheepDetailsScreen from '../screens/SheepDetailsScreen';
import SheepRegistrationSuccessScreen from '../screens/SheepRegistrationSuccessScreen';
import FinanceScreen from '../screens/FinanceScreen';
import ReportsScreen from '../screens/ReportsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName = 'home';

          if (route.name === 'Dashboard') iconName = 'home';
          if (route.name === 'Sheep') iconName = 'pets';
          if (route.name === 'Finance') iconName = 'account-balance-wallet';
          if (route.name === 'Reports') iconName = 'bar-chart';
          if (route.name === 'More') iconName = 'menu';

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0F8A5F',
        tabBarInactiveTintColor: '#71827B',
        headerShown: false,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopColor: '#E7F0EA',
        },
      })}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{title: 'Home'}}
      />
      <Tab.Screen
        name="Sheep"
        component={SheepListScreen}
        options={{title: 'Sheep'}}
      />
      <Tab.Screen
        name="Finance"
        component={FinanceScreen}
        options={{title: 'Finance'}}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{title: 'Reports'}}
      />
      <Tab.Screen
        name="More"
        component={ProfileScreen}
        options={{title: 'More'}}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator({initialRouteName = 'MainTabs'}) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AddFarm" component={AddFarmScreen} />
      <Stack.Screen name="FarmDashboard" component={FarmDashboardScreen} />
      <Stack.Screen name="AddFlock" component={AddFlockScreen} />
      <Stack.Screen name="FarmUsers" component={FarmUsersScreen} />
      <Stack.Screen name="AddSheep" component={AddSheepScreen} />
      <Stack.Screen name="SheepDetails" component={SheepDetailsScreen} />
      <Stack.Screen
        name="SheepRegistrationSuccess"
        component={SheepRegistrationSuccessScreen}
      />
      <Stack.Screen name="Finance" component={FinanceScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Scan" component={QRScannerScreen} />
      <Stack.Screen name="Records" component={RecordsScreen} />
    </Stack.Navigator>
  );
}
