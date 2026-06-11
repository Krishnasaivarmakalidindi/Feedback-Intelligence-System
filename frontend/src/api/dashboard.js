import client from './client';

export const getDashboardOverview = async (days = 30) => {
  const response = await client.get('/dashboard/overview', { params: { days } });
  return response.data;
};

export const getSentimentTimeline = async (days = 30) => {
  const response = await client.get('/dashboard/sentiment-timeline', { params: { days } });
  return response.data;
};

export const getPriorityBreakdown = async (days = 30) => {
  const response = await client.get('/dashboard/priority-breakdown', { params: { days } });
  return response.data;
};
