import client from './client';

export const listFeedback = async (params = {}) => {
  const response = await client.get('/feedback', { params });
  return response.data;
};

export const createFeedback = async (feedbackData) => {
  const response = await client.post('/feedback', feedbackData);
  return response.data;
};

export const getFeedbackById = async (id) => {
  const response = await client.get(`/feedback/${id}`);
  return response.data;
};

export const updateFeedback = async (id, feedbackData) => {
  const response = await client.put(`/feedback/${id}`, feedbackData);
  return response.data;
};

export const deleteFeedback = async (id) => {
  const response = await client.delete(`/feedback/${id}`);
  return response.data;
};
