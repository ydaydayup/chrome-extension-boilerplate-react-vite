// export const getDomain = (url: string) => {
//   try {
//     const urlObj = new URL(url);
//     return urlObj.hostname;
//   } catch {
//     return '';
//   }
// };
//
// export const generateColorForDomain = (domain: string) => {
//   const colors = [
//     '#FFB6C1', '#98FB98', '#87CEFA', '#DDA0DD',
//     '#F0E68C', '#E6E6FA', '#F08080', '#20B2AA',
//   ];
//
//   let hash = 0;
//   // This code snippet calculates a hash value for a given domain string.
//   // It iterates over each character in the domain string and updates the
//   // `hash` variable by adding the ASCII code of the character to it.
//   // The calculation involves a bitwise left shift operation (`<<`) and
//   // subtraction (`-`) to create a hash value.
//   // The resulting `hash` value is used later to determine a color for the domain.
//   for (let i = 0; i < domain.length; i++) {
//     hash = domain.charCodeAt(i) + ((hash << 5) - hash);
//   }
//
//   return colors[Math.abs(hash) % colors.length];
// };

export const getDomain = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};

const COLORS = ['#FFB6C1', '#98FB98', '#87CEFA', '#DDA0DD', '#F0E68C', '#E6E6FA', '#20B2AA'];

interface BorderStyle {
  colors: string[];
  count: number;
}

export const generateBorderStyleForDomain = (
  domain: string,
  duplicateDomain: number,
  domainFrequency: number,
): BorderStyle => {
  // 如果域名只出现一次，返回空边框样式
  if (domainFrequency <= 1) {
    return { colors: [], count: 0 };
  }

  // 计算需要的边框数量
  const borderCount = Math.ceil(duplicateDomain / COLORS.length);
  // This code snippet calculates a hash value for a given domain string.
  // It iterates over each character in the domain string and updates the
  // `hash` variable by adding the ASCII code of the character to it.
  // The calculation involves a bitwise left shift operation (`<<`) and
  // subtraction (`-`) to create a hash value.
  // The resulting `hash` value is used later to determine a color for the domain.
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const colors: string[] = [];
  for (let i = 0; i < borderCount; i++) {
    const colorIndex = (hash + i) % COLORS.length;
    colors.push(COLORS[colorIndex]);
  }

  return {
    colors,
    count: borderCount,
  };
};
