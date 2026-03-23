export const formatGameName = (name) => {
  if (!name) return name;
  return name.replace(/\s*Game$/i, '');
};
