export const isSupabaseFunctionsApiUrl = (apiUrl?: string) =>
  Boolean(apiUrl?.includes('.supabase.co/functions/v1'));

export const shouldUseSupabaseDirect = () => {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  return !apiUrl || apiUrl.includes('localhost') || isSupabaseFunctionsApiUrl(apiUrl);
};
