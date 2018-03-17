/* eslint-env jest */

import React from 'react';
import TestRenderer from 'react-test-renderer';
import CalendarScreen from './CalendarScreen';

it('renders without crashing', () => {
  const div = TestRenderer.create(
    <CalendarScreen />
  );
});
