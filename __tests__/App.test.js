/**
 * @format
 */

import 'react-native';
import React from 'react';
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', async () => {
  let app;

  await renderer.act(async () => {
    app = renderer.create(<App />);
    await new Promise(resolve => setImmediate(resolve));
  });

  await renderer.act(async () => {
    app.unmount();
  });
});
