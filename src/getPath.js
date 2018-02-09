export default function getPath(points, scale, start = 0) {
  if (points.length === 0) return "";

  let out =
    start === 0 ? `M${points[0][0] * scale} ${points[0][1] * scale}` : "";
  for (let i = start === 0 ? 1 : start; i < points.length; i++)
    out += `L${points[i][0] * scale} ${points[i][1] * scale}`;

  return out;
}
