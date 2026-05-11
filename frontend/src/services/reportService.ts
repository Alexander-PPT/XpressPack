export const openReport = (path: string) => {
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${path}`;
  window.open(url, '_blank');
};
