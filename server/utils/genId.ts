const genId = (): string => {
  const chars: string = "0123456789";
  let str: string = "";
  for (let i = 0; i < 12; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    str += chars.substring(rnum, rnum + 1);
  }
  return str;
};

export default genId;
