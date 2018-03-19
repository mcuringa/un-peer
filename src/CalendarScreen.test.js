/* eslint-env jest */

import React from 'react';
import TestRenderer from 'react-test-renderer';
import CalendarScreen from './CalendarScreen';

const mockChallenges = [
  {
    created: new Date('2018-03-09'),
    end: new Date('2018-03-09'),
    endDate: new Date('2018-03-22'),
    id: 'what-about-the-careless-staff',
    modified: new Date('2018-03-14'),
    owner: {
      admin: true,
      firstName: 'Xun'
    },
    prompt: 'There is a staff in my team who needs to be closely monitored for every work performed in order to avoid any possible mistakes. She will only follow instructions without doing much thinking. She does not think it through before considering different factors. She is also not organized as very constant the document are not filed properly in the network system.',
    ratingDue: new Date('2018-03-13'),
    responseDue: new Date('2018-03-11'),
    stage: 'archive',
    start: new Date('2018-03-07 22:00'),
    status: 3,
    tags: '',
    title: 'What about the careless staff??',
    video: '',
    videoPoster: ''
  },
  {
    created: new Date('2018-03-09'),
    end: new Date('2018-03-16'),
    endDate: new Date('2018-03-22'),
    id: 'what-about-the-careless-staff',
    modified: new Date('2018-03-14'),
    owner: {
      admin: true,
      firstName: 'Xun'
    },
    prompt: 'There is a staff in my team who needs to be closely monitored for every work performed in order to avoid any possible mistakes. She will only follow instructions without doing much thinking. She does not think it through before considering different factors. She is also not organized as very constant the document are not filed properly in the network system.',
    ratingDue: new Date('2018-03-13'),
    responseDue: new Date('2018-03-11'),
    stage: 'archive',
    start: new Date('2018-03-09 22:00'),
    status: 3,
    tags: '',
    title: 'What about the careless staff??',
    video: '',
    videoPoster: ''
  },
  {
    created: new Date('2018-03-09'),
    end: new Date('2018-03-23'),
    endDate: new Date('2018-03-22'),
    id: 'what-about-the-careless-staff',
    modified: new Date('2018-03-14'),
    owner: {
      admin: true,
      firstName: 'Xun'
    },
    prompt: 'There is a staff in my team who needs to be closely monitored for every work performed in order to avoid any possible mistakes. She will only follow instructions without doing much thinking. She does not think it through before considering different factors. She is also not organized as very constant the document are not filed properly in the network system.',
    ratingDue: new Date('2018-03-20'),
    responseDue: new Date('2018-03-18'),
    stage: 'archive',
    start: new Date('2018-03-16 22:00'),
    status: 3,
    tags: '',
    title: 'What about the careless staff??',
    video: '',
    videoPoster: ''
  }
];

it('displays loading animation before data is loaded', () => {
  // Use March 2018 for this test.
  const now = new Date('2018-03-17');
  Date.now = jest.genMockFunction().mockReturnValue(now);

  const cal = TestRenderer.create(
    <CalendarScreen />
  ).toJSON();

  expect(cal.type).toBe('div');
  expect(cal.props.className).toBe('loader-inner ball-pulse');
});

it('displays challenges correctly', () => {
  const cal = TestRenderer.create(
    <CalendarScreen challenges={mockChallenges} />
  );

  const days = cal.root.findByProps({
    className: 'react-calendar__month-view__days'
  });

  console.log(days);
  //expect(days.children).toEqual(['1']);

  expect(cal.toJSON().type).toBe('div');
  expect(cal.toJSON().props.className).toBe('calendar-view');
});
