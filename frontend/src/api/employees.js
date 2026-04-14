import client from './client';

export const getCountries = () =>
  client.get('/api/employees/countries').then((res) => res.data);

export const getEmployees = (params = {}) =>
  client.get('/api/employees', { params }).then((res) => res.data);

export const getEmployee = (id) =>
  client.get(`/api/employees/${id}`).then((res) => res.data);

export const createEmployee = (payload) =>
  client.post('/api/employees', payload).then((res) => res.data);

export const updateEmployee = (id, payload) =>
  client.patch(`/api/employees/${id}`, payload).then((res) => res.data);

export const deleteEmployee = (id) =>
  client.delete(`/api/employees/${id}`).then((res) => res.data);
