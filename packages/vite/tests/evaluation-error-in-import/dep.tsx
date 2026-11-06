const getColor = (): string => {
  throw new Error("failed to compute color");
};

export const color = getColor();
