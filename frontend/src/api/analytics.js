import client from './client';

export const getAnalyticsOverview = async (days = 30, keywordLimit = 10) => {
  const response = await client.get('/analytics/overview', {
    params: { days, keyword_limit: keywordLimit }
  });
  return response.data;
};
