/* eslint-env jest */

import React from 'react';
import ReactDOM from 'react-dom';
import CalendarScreen from './CalendarScreen';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <CalendarScreen />,
    div
  );
});
