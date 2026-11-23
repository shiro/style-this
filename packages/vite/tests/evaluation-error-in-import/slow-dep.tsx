// still evaluating when `dep` fails
export const size = await new Promise<string>((_, reject) => {
  setTimeout(() => reject(new Error("failed to compute size")), 10);
});
