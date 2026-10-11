import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import renderer from 'react-test-renderer';
import DashboardScreen from '../src/screens/DashboardScreen';
import {getSession} from '../src/services/authService';
import {getFarmUsers, getFarmsForUser} from '../src/services/farmService';
import {getFlocksByFarm} from '../src/services/flockService';
import {fetchSheepByFarm} from '../src/services/sheepService';

const mockFocus = {};

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: callback => {
    const ReactRuntime = require('react');
    ReactRuntime.useEffect(() => {
      mockFocus.callback = callback;
      const cleanup = callback();
      mockFocus.cleanup = cleanup;
      return cleanup;
    }, [callback]);
  },
}));
jest.mock('../src/services/authService', () => ({
  getSession: jest.fn(),
}));
jest.mock('../src/services/farmService', () => ({
  getFarmUsers: jest.fn(),
  getFarmsForUser: jest.fn(),
}));
jest.mock('../src/services/flockService', () => ({
  getFlocksByFarm: jest.fn(),
}));
jest.mock('../src/services/sheepService', () => ({
  fetchSheepByFarm: jest.fn(),
}));

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const textContent = children =>
  Array.isArray(children)
    ? children.map(textContent).join('')
    : String(children ?? '');

const renderDashboard = async navigation => {
  let screen;
  await renderer.act(async () => {
    screen = renderer.create(<DashboardScreen navigation={navigation} />);
    await flushPromises();
  });
  return screen;
};

const findText = (root, value) =>
  root
    .findAllByType(Text)
    .find(node => textContent(node.props.children) === value);

const findButton = (root, title) =>
  root
    .findAllByType(TouchableOpacity)
    .find(button =>
      button
        .findAllByType(Text)
        .some(node => textContent(node.props.children) === title),
    );

beforeEach(() => {
  jest.clearAllMocks();
  mockFocus.callback = null;
  mockFocus.cleanup = null;
  getSession.mockResolvedValue({user_id: 'user-1'});
  getFarmsForUser.mockResolvedValue([]);
  getFarmUsers.mockResolvedValue([]);
  getFlocksByFarm.mockResolvedValue([]);
  fetchSheepByFarm.mockResolvedValue([]);
});

afterEach(() => {
  mockFocus.cleanup?.();
});

it('shows first-time onboarding and Skip enters limited mode', async () => {
  const navigation = {navigate: jest.fn()};
  const screen = await renderDashboard(navigation);

  expect(findText(screen.root, 'Welcome to SheepVision')).toBeTruthy();
  expect(findText(screen.root, 'Farm management starts here.')).toBeTruthy();
  expect(findText(screen.root, 'Skip for Now')).toBeTruthy();

  await renderer.act(async () => {
    findButton(screen.root, 'Skip for Now').props.onPress();
  });

  expect(findText(screen.root, 'LIMITED ACCESS')).toBeTruthy();
  expect(findText(screen.root, 'Farm management starts here.')).toBeFalsy();
  expect(findText(screen.root, 'Skip for Now')).toBeFalsy();
  expect(findButton(screen.root, '+ Create Farm')).toBeTruthy();
});

it('lists every farm and opens the existing farm selection routes', async () => {
  const farms = [
    {
      farm_id: 'farm-1',
      farm_name: 'Green Valley Farm',
      district: 'Khushab',
      province: 'Punjab',
    },
    {
      farm_id: 'farm-2',
      farm_name: 'Hill Farm',
      district: 'Jhelum',
      province: 'Punjab',
    },
  ];
  getFarmsForUser.mockResolvedValue(farms);
  fetchSheepByFarm.mockImplementation(async farmId =>
    farmId === 'farm-1' ? [{sheep_id: 'sheep-1'}] : [],
  );
  const navigation = {navigate: jest.fn()};
  const screen = await renderDashboard(navigation);

  expect(findText(screen.root, 'Your Farms')).toBeTruthy();
  expect(findText(screen.root, 'Green Valley Farm')).toBeTruthy();
  expect(findText(screen.root, 'Hill Farm')).toBeTruthy();
  expect(findText(screen.root, '1 Sheep')).toBeTruthy();
  expect(findText(screen.root, 'Farm management starts here.')).toBeFalsy();
  expect(findText(screen.root, 'Skip for Now')).toBeFalsy();

  await renderer.act(async () => {
    findButton(screen.root, 'Green Valley Farm').props.onPress();
  });
  expect(navigation.navigate).toHaveBeenCalledWith('FarmDashboard', {
    farm: farms[0],
  });

  await renderer.act(async () => {
    findButton(screen.root, '+ Add Another Farm').props.onPress();
  });
  expect(navigation.navigate).toHaveBeenCalledWith('AddFarm');
});

it('refreshes farms on Home focus after the first farm is created', async () => {
  const navigation = {navigate: jest.fn()};
  const screen = await renderDashboard(navigation);
  expect(findText(screen.root, 'Welcome to SheepVision')).toBeTruthy();

  const farm = {
    farm_id: 'farm-1',
    farm_name: 'New Farm',
    district: 'Khushab',
    province: 'Punjab',
  };
  getFarmsForUser.mockResolvedValue([farm]);

  let cleanup;
  await renderer.act(async () => {
    mockFocus.cleanup();
    cleanup = mockFocus.callback();
    await flushPromises();
  });
  mockFocus.cleanup = cleanup;

  expect(findText(screen.root, 'New Farm')).toBeTruthy();
  expect(findText(screen.root, 'Welcome to SheepVision')).toBeFalsy();
  expect(findText(screen.root, 'Skip for Now')).toBeFalsy();
});

it('shows a retry state instead of onboarding when farm loading fails', async () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  getFarmsForUser.mockRejectedValueOnce(new Error('Network unavailable'));
  const screen = await renderDashboard({navigate: jest.fn()});

  expect(findText(screen.root, 'Your farms could not be loaded')).toBeTruthy();
  expect(findText(screen.root, 'Welcome to SheepVision')).toBeFalsy();

  await renderer.act(async () => {
    findButton(screen.root, 'Try Again').props.onPress();
    await flushPromises();
  });

  expect(findText(screen.root, 'Welcome to SheepVision')).toBeTruthy();
  warn.mockRestore();
});
