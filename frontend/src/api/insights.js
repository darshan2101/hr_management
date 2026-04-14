import client from './client';

export const getCountryInsights = (country) =>
  client.get(`/api/insights/country/${country}`).then((res) => res.data);

export const getJobTitleInsights = (params) =>
  client.get('/api/insights/jobtitle', { params }).then((res) => res.data);

export const getSummary = () =>
  client.get('/api/insights/summary').then((res) => res.data);
