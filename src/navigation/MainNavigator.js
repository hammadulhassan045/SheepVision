import {Pressable, StyleSheet, Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MaterialIcons, MaterialCommunityIcons} from '@expo/vector-icons';

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

const tabs = [
  {name: 'Home', component: DashboardScreen, icon: 'home'},
  {name: 'Sheep', component: SheepListScreen, icon: 'sheep'},
  {name: 'Records', component: RecordsScreen, icon: 'folder-open'},
  {name: 'More', component: ProfileScreen, icon: 'menu'},
];

function ScanPlaceholder() {
  return null;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route, navigation}) => ({
        headerShown: false,
        tabBarActiveTintColor: '#16845B',
        tabBarInactiveTintColor: '#83918A',

        // Hide the bottom navigation on the farm-selection dashboard.
        tabBarStyle: route.name === 'Home' ? {display: 'none'} : styles.tabBar,

        tabBarIcon: ({color, size}) =>
          route.name === 'Sheep' ? (
            <MaterialCommunityIcons
              name="sheep"
              size={size + 2}
              color={color}
            />
          ) : (
            <MaterialIcons
              name={tabs.find(tab => tab.name === route.name)?.icon || 'menu'}
              size={size}
              color={color}
            />
          ),

        ...(route.name === 'Scan' && {
          tabBarLabel: () => null,
          tabBarButton: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Scan sheep QR code"
              onPress={() => navigation.getParent()?.navigate('QRScanner')}
              style={styles.scanWrapper}>
              <View style={styles.scanButton}>
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={27}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.scanLabel}>Scan</Text>
            </Pressable>
          ),
        }),
      })}>
      {tabs.slice(0, 2).map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}

      <Tab.Screen name="Scan" component={ScanPlaceholder} />

      {tabs.slice(2).map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
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
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 68,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E7EEE9',
  },
  scanWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#16845B',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  scanLabel: {
    fontSize: 10,
    color: '#16845B',
    fontWeight: '600',
  },
});
