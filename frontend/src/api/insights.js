import client from './client';

export const getAIAnalysis = async (days = 30) => {
  const response = await client.get('/insights/ai-analysis', { params: { days } });
  return response.data;
};

export const getExecutiveSummary = async (days = 30) => {
  const response = await client.get('/insights/executive-summary', { params: { days } });
  return response.data;
};

export const getActionItems = async (days = 30) => {
  const response = await client.get('/insights/action-items', { params: { days } });
  return response.data;
};
