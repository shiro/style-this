export const color = "red";

export const track = (() => {
  throw new Error("track must not be evaluated");
})();

export default (() => {
  throw new Error("default must not be evaluated");
})();
