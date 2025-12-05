import apiClient from './apiClient';

// Authentication Services
export const register = async (userData) => {
  const { data } = await apiClient.post('/auth/register', userData);
  return data;
};

export const loginRequest = async (credentials) => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export const getProfile = async () => {
  const { data } = await apiClient.get('/auth/profile');
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await apiClient.put('/auth/profile', profileData);
  return data;
};

export const changePassword = async (passwordData) => {
  const { data } = await apiClient.put('/auth/password', passwordData);
  return data;
};

// Services
export const getServices = async (params = {}) => {
  const { data } = await apiClient.get('/services', { params });
  return data?.services ?? [];
};

export const getServiceById = async (id) => {
  const { data } = await apiClient.get(`/services/${id}`);
  return data;
};

export const getServiceCategories = async () => {
  const { data } = await apiClient.get('/services/categories');
  return data;
};

export const getServiceStats = async () => {
  const { data } = await apiClient.get('/services/stats');
  return data;
};

// Admin service management
export const createService = async (serviceData) => {
  const { data } = await apiClient.post('/services', serviceData);
  return data;
};

export const updateService = async (id, serviceData) => {
  const { data } = await apiClient.put(`/services/${id}`, serviceData);
  return data;
};

export const deleteService = async (id) => {
  const { data } = await apiClient.delete(`/services/${id}`);
  return data;
};

// Conversations & AI
export const getUserConversations = async (userId, params = {}) => {
  const { data } = await apiClient.get(`/conversations/user/${userId}`, { params });
  return data;
};

export const getConversation = async (conversationId) => {
  const { data } = await apiClient.get(`/conversations/${conversationId}`);
  return data;
};

export const createConversation = async (conversationData) => {
  const { data } = await apiClient.post('/conversations', conversationData);
  return data;
};

export const updateConversation = async (conversationId, updateData) => {
  const { data } = await apiClient.put(`/conversations/${conversationId}`, updateData);
  return data;
};

export const deleteConversation = async (conversationId) => {
  const { data } = await apiClient.delete(`/conversations/${conversationId}`);
  return data;
};

export const addMessage = async (conversationId, messageData) => {
  const { data } = await apiClient.post(`/conversations/${conversationId}/messages`, messageData);
  return data;
};

export const generateAIResponse = async (conversationId, messageData) => {
  const { data } = await apiClient.post(`/conversations/${conversationId}/generate`, messageData);
  return data;
};

export const searchConversations = async (searchData) => {
  const { data } = await apiClient.post('/conversations/search', searchData);
  return data;
};

// Feedback
export const submitFeedback = async (feedbackData) => {
  const { data } = await apiClient.post('/feedback', feedbackData);
  return data;
};

export const getFeedback = async (params = {}) => {
  const { data } = await apiClient.get('/feedback', { params });
  return data;
};

export const getFeedbackStats = async () => {
  const { data } = await apiClient.get('/feedback/stats');
  return data;
};

export const updateFeedbackStatus = async (id, statusData) => {
  const { data } = await apiClient.put(`/feedback/${id}/status`, statusData);
  return data;
};

// Knowledge Base
export const fetchKnowledgeBase = async (params = {}) => {
  const { data } = await apiClient.get('/knowledge-base', { params });
  return data;
};

export const searchKnowledge = async (searchData) => {
  const { data } = await apiClient.post('/knowledge-base/search', searchData);
  return data;
};

// Sync
export const syncOfflinePayloads = async (payloads = []) => {
  if (!payloads.length) return { synced: 0 };
  const { data } = await apiClient.post('/sync', { payloads });
  return data;
};

// Health Check
export const healthCheck = async () => {
  const { data } = await apiClient.get('/health');
  return data;
};

// Documents API
export const getDocuments = async (params = {}) => {
  const { data } = await apiClient.get('/documents', { params });
  return data;
};

export const getDocument = async (trackingId) => {
  const { data } = await apiClient.get(`/documents/${trackingId}`);
  return data;
};

export const createDocument = async (documentData) => {
  const { data } = await apiClient.post('/documents', documentData);
  return data;
};

export const trackDocument = async (trackingId) => {
  const { data } = await apiClient.post('/documents/track', { trackingId });
  return data;
};

export const getDocumentStats = async () => {
  const { data } = await apiClient.get('/documents/stats');
  return data;
};

export const getDocumentTypes = async () => {
  const { data } = await apiClient.get('/documents/types');
  return data;
};

// Appointments API
export const getAppointments = async (params = {}) => {
  const { data } = await apiClient.get('/appointments', { params });
  return data;
};

export const getAppointment = async (id) => {
  const { data } = await apiClient.get(`/appointments/${id}`);
  return data;
};

export const createAppointment = async (appointmentData) => {
  const { data } = await apiClient.post('/appointments', appointmentData);
  return data;
};

export const updateAppointment = async (id, appointmentData) => {
  const { data } = await apiClient.put(`/appointments/${id}`, appointmentData);
  return data;
};

export const cancelAppointment = async (id, reason) => {
  const { data } = await apiClient.delete(`/appointments/${id}`, { data: { reason } });
  return data;
};

export const getAppointmentStats = async () => {
  const { data } = await apiClient.get('/appointments/stats');
  return data;
};

export const getAvailableSlots = async (date, locationId) => {
  const { data } = await apiClient.get('/appointments/slots', { params: { date, locationId } });
  return data;
};

export const getAppointmentServices = async () => {
  const { data } = await apiClient.get('/appointments/services');
  return data;
};

export const getAppointmentLocations = async () => {
  const { data } = await apiClient.get('/appointments/locations');
  return data;
};
