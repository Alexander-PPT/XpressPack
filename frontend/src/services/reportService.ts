export const openReport = (path: string, params?: Record<string, string>) => {
  const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${path}`;
  const url = new URL(baseUrl);
  
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key]) {
        url.searchParams.append(key, params[key]);
      }
    });
  }
  
  window.open(url.toString(), '_blank');
};
