import apiClient from './apiClient';

export const getServices = async () => {
  const { data } = await apiClient.get('/services');
  return data;
};

export const getServiceById = async (id) => {
  const { data } = await apiClient.get(`/services/${id}`);
  return data;
};

export const submitFeedback = async (payload) => {
  const { data } = await apiClient.post('/feedback', payload);
  return data;
};

export const loginRequest = async (credentials) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export const syncOfflinePayloads = async (payloads = []) => {
  if (!payloads.length) return { synced: 0 };
  const { data } = await apiClient.post('/sync', { payloads });
  return data;
};

export const fetchKnowledgeBase = async () => {
  const { data } = await apiClient.get('/knowledge-base');
  return data;
};
