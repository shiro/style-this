import "virtual:style-this:/entry.tsx.css";
const doPromise = async () => {
	await new Promise((resolve) => setTimeout(resolve, 10));
	return "red";
};
const a = "a-ggghhh";
